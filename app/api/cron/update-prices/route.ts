import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import YahooFinance from 'yahoo-finance2';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const brapiToken = process.env.BRAPI_API_KEY;
const yahooFinance = new YahooFinance();

// Identifica se ticker é BR (B3)
const isB3Ticker = (ticker: string) => {
    if (ticker.endsWith('.SA')) return true;
    const b3Regex = /^[A-Z]{4}[34]$|^[A-Z]{4}11$|^[A-Z]{3}11$/;
    return b3Regex.test(ticker);
};

async function fetchHistory(ticker: string, days: number) {
    const normalized = ticker.toUpperCase();
    const baseTicker = normalized.replace('.SA', '');

    if (isB3Ticker(normalized)) {
        const url = new URL(`https://brapi.dev/api/quote/${baseTicker}`);
        url.searchParams.set('range', `${days}d`);
        url.searchParams.set('interval', '1d');
        if (brapiToken) url.searchParams.set('token', brapiToken);

        const response = await fetch(url.toString());
        if (!response.ok) throw new Error(`Brapi API ${response.status}`);

        const data = await response.json();
        const result = data.results?.[0];
        if (!result || !result.historicalDataPrice || result.historicalDataPrice.length === 0) {
            throw new Error('Sem dados retornados');
        }

        return result.historicalDataPrice.map((item: any) => ({
            ticker: baseTicker,
            date: new Date(item.date * 1000).toISOString().split('T')[0],
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
            volume: item.volume
        }));
    }

    // US/ETFs etc via Yahoo
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);

    const hist = await yahooFinance.historical(normalized, {
        period1: start,
        period2: end,
        interval: '1d'
    });

    if (!hist || hist.length === 0) throw new Error('Sem histórico Yahoo');

    return hist.map((item: any) => ({
        ticker: normalized,
        date: new Date(item.date).toISOString().split('T')[0],
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume
    }));
}

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

        if (!serviceRoleKey) {
            throw new Error('SUPABASE_SERVICE_ROLE_KEY ausente');
        }

        const supabase = createSupabaseClient(supabaseUrl, serviceRoleKey);

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
                const priceData = await fetchHistory(ticker, 5);

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
