'use server';

import { createClient as createSupabaseClient } from '@/lib/supabase/server';

/**
 * Fetch historical price data for a ticker and store in database
 * Uses Brapi API for Brazilian stocks
 */
export async function fetchAndStoreHistoricalPrices(ticker: string, days: number = 365) {
    const supabase = await createSupabaseClient();

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const range = `${days}d`;

    try {
        // Fetch from Brapi
        const response = await fetch(`https://brapi.dev/api/quote/${ticker}?range=${range}&interval=1d`, {
            headers: {
                'Authorization': `Bearer ${process.env.BRAPI_API_KEY || ''}`
            },
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!response.ok) {
            throw new Error(`Brapi API error: ${response.status}`);
        }

        const data = await response.json();
        const result = data.results?.[0];

        if (!result || !result.histor​icalDataPrice) {
            console.log(`No historical data for ${ticker}`);
            return { success: false, error: 'No data available' };
        }

        // Transform and insert data
        const priceData = result.historicalDataPrice.map((item: any) => ({
            ticker: ticker.toUpperCase(),
            date: new Date(item.date * 1000).toISOString().split('T')[0],
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
            volume: item.volume
        }));

        // Upsert to database (insert or update if exists)
        const { error } = await supabase
            .from('price_history')
            .upsert(priceData, {
                onConflict: 'ticker,date',
                ignoreDuplicates: false
            });

        if (error) {
            console.error('Error storing price history:', error);
            return { success: false, error: error.message };
        }

        console.log(`Stored ${priceData.length} price records for ${ticker}`);
        return { success: true, count: priceData.length };

    } catch (error: any) {
        console.error('Error fetching historical prices:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get historical prices for a ticker from database
 */
export async function getHistoricalPrices(ticker: string, days: number = 365) {
    const supabase = await createSupabaseClient();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
        .from('price_history')
        .select('*')
        .eq('ticker', ticker.toUpperCase())
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

    if (error) {
        console.error('Error fetching price history:', error);
        return null;
    }

    return data;
}

/**
 * Calculate portfolio value for a specific date
 */
export async function calculatePortfolioValue(portfolioId: string, date: Date) {
    const supabase = await createSupabaseClient();

    // Get all transactions up to this date
    const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('portfolio_id', portfolioId)
        .lte('date', date.toISOString())
        .order('date', { ascending: true });

    if (!transactions) return 0;

    // Calculate position for each ticker
    const positions: Record<string, number> = {};

    for (const tx of transactions) {
        if (tx.type === 'BUY') {
            positions[tx.ticker] = (positions[tx.ticker] || 0) + tx.qty;
        } else if (tx.type === 'SELL') {
            positions[tx.ticker] = (positions[tx.ticker] || 0) - tx.qty;
        }
    }

    // Get prices for each ticker on this date
    let totalValue = 0;
    const dateStr = date.toISOString().split('T')[0];

    for (const [ticker, quantity] of Object.entries(positions)) {
        if (quantity <= 0) continue;

        const { data: priceData } = await supabase
            .from('price_history')
            .select('close')
            .eq('ticker', ticker)
            .lte('date', dateStr)
            .order('date', { ascending: false })
            .limit(1)
            .single();

        if (priceData) {
            totalValue += quantity * Number(priceData.close);
        }
    }

    return totalValue;
}
