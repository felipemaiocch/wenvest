import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * API Route to update price history
 * This runs automatically via Vercel Cron Jobs
 * Also can be called manually: GET /api/cron/update-prices
 */
export async function GET(request: Request) {
    try {
        // Verify cron secret to prevent unauthorized access (from header OR query param)
        const authHeader = request.headers.get('authorization');
        const url = new URL(request.url);
        const secretParam = url.searchParams.get('secret');

        const providedSecret = authHeader?.replace('Bearer ', '') || secretParam;

        if (providedSecret !== process.env.CRON_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = await createClient();

        // Get all unique tickers from transactions
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
                message: 'No tickers to update',
                updated: 0
            });
        }

        let successCount = 0;
        let failCount = 0;
        const errors: string[] = [];

        // Update prices for each ticker
        for (const ticker of uniqueTickers) {
            try {
                const response = await fetch(`https://brapi.dev/api/quote/${ticker}?range=5d&interval=1d`);

                if (!response.ok) {
                    errors.push(`${ticker}: API error ${response.status}`);
                    failCount++;
                    continue;
                }

                const data = await response.json();
                const result = data.results?.[0];

                if (!result || !result.historicalDataPrice || result.historicalDataPrice.length === 0) {
                    errors.push(`${ticker}: No data available`);
                    failCount++;
                    continue;
                }

                // Get latest prices (last 5 days)
                const priceData = result.historicalDataPrice.map((item: any) => ({
                    ticker: ticker.toUpperCase(),
                    date: new Date(item.date * 1000).toISOString().split('T')[0],
                    open: item.open,
                    high: item.high,
                    low: item.low,
                    close: item.close,
                    volume: item.volume
                }));

                // Upsert to database
                const { error: insertError } = await supabase
                    .from('price_history')
                    .upsert(priceData, {
                        onConflict: 'ticker,date',
                        ignoreDuplicates: false
                    });

                if (insertError) {
                    errors.push(`${ticker}: ${insertError.message}`);
                    failCount++;
                } else {
                    successCount++;
                }

                // Rate limiting
                await new Promise(resolve => setTimeout(resolve, 200));

            } catch (error: any) {
                errors.push(`${ticker}: ${error.message}`);
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
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error: any) {
        console.error('Cron job error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
