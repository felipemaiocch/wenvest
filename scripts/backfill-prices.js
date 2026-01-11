/**
 * Backfill script to populate price_history table with historical data
 * Run this after creating portfolios to enable historical performance tracking
 * 
 * Usage: node scripts/backfill-prices.js
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchHistoricalPrices(ticker, days = 365) {
    const range = `${days}d`;

    try {
        const response = await fetch(`https://brapi.dev/api/quote/${ticker}?range=${range}&interval=1d`);

        if (!response.ok) {
            console.error(`Failed to fetch ${ticker}: ${response.status}`);
            return null;
        }

        const data = await response.json();
        const result = data.results?.[0];

        if (!result || !result.historicalDataPrice) {
            console.log(`No historical data for ${ticker}`);
            return null;
        }

        return result.historicalDataPrice.map(item => ({
            ticker: ticker.toUpperCase(),
            date: new Date(item.date * 1000).toISOString().split('T')[0],
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
            volume: item.volume
        }));
    } catch (error) {
        console.error(`Error fetching ${ticker}:`, error.message);
        return null;
    }
}

async function backfillPrices() {
    console.log('🚀 Starting price history backfill...\n');

    // Get all unique tickers from transactions
    const { data: transactions, error } = await supabase
        .from('transactions')
        .select('ticker');

    if (error) {
        console.error('Error fetching transactions:', error);
        return;
    }

    const uniqueTickers = [...new Set(transactions.map(t => t.ticker))];
    console.log(`Found ${uniqueTickers.length} unique tickers to process\n`);

    let successCount = 0;
    let failCount = 0;

    for (const ticker of uniqueTickers) {
        console.log(`Processing ${ticker}...`);

        const priceData = await fetchHistoricalPrices(ticker, 365);

        if (!priceData || priceData.length === 0) {
            console.log(`❌ Failed: ${ticker}\n`);
            failCount++;
            continue;
        }

        // Upsert to database
        const { error: insertError } = await supabase
            .from('price_history')
            .upsert(priceData, {
                onConflict: 'ticker,date',
                ignoreDuplicates: false
            });

        if (insertError) {
            console.error(`❌ Error storing ${ticker}:`, insertError.message);
            failCount++;
        } else {
            console.log(`✅ Stored ${priceData.length} records for ${ticker}\n`);
            successCount++;
        }

        // Rate limiting - wait 250ms between requests
        await new Promise(resolve => setTimeout(resolve, 250));
    }

    console.log('\n📊 Summary:');
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`📈 Total: ${uniqueTickers.length}`);
}

backfillPrices().catch(console.error);
