import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * API Route to backfill historical price data (365 days)
 * Run this once after setup: GET /api/cron/backfill
 */
export async function GET(request: Request) {
    try {
        // Verify secret
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = await createClient();

        // Get all unique tickers
        const { data: transactions, error: txError } = await supabase
            .from('transactions')
            .select('ticker');

        if (txError) {
            throw new Error(`Database error: ${txError.message}`);
        }

        const uniqueTickers = [...new Set(transactions?.map(t => t.ticker) || [])];

        if (uniqueTickers.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No tickers to backfill'
            });
        }

        let successCount = 0;
        let failCount = 0;
        const results: any[] = [];

        // Backfill each ticker with 365 days of history
        for (const ticker of uniqueTickers) {
            try {
                const response = await fetch(`https://brapi.dev/api/quote/${ticker}?range=365d&interval=1d`);

                if (!response.ok) {
                    results.push({ ticker, status: 'failed', error: `API error ${response.status}` });
                    failCount++;
                    continue;
                }

                const data = await response.json();
                const result = data.results?.[0];

                if (!result || !result.historicalDataPrice) {
                    results.push({ ticker, status: 'failed', error: 'No data available' });
                    failCount++;
                    continue;
                }

                const priceData = result.historicalDataPrice.map((item: any) => ({
                    ticker: ticker.toUpperCase(),
                    date: new Date(item.date * 1000).toISOString().split('T')[0],
                    open: item.open,
                    high: item.high,
                    low: item.low,
                    close: item.close,
                    volume: item.volume
                }));

                const { error: insertError } = await supabase
                    .from('price_history')
                    .upsert(priceData, {
                        onConflict: 'ticker,date',
                        ignoreDuplicates: false
                    });

                if (insertError) {
                    results.push({ ticker, status: 'failed', error: insertError.message });
                    failCount++;
                } else {
                    results.push({ ticker, status: 'success', records: priceData.length });
                    successCount++;
                }

                // Rate limiting
                await new Promise(resolve => setTimeout(resolve, 300));

            } catch (error: any) {
                results.push({ ticker, status: 'failed', error: error.message });
                failCount++;
            }
        }

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            stats: {
                total: uniqueTickers.length,
                success: successCount,
                failed: failCount
            },
            results
        });

    } catch (error: any) {
        console.error('Backfill error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
