'use server';

import { createClient } from "@/lib/supabase/server";

/**
 * Calculate current portfolio summary with real-time prices
 */
export async function getPortfolioSummary(portfolioId: string) {
    const supabase = await createClient();

    // Get all transactions for this portfolio
    const { data: transactions, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('portfolio_id', portfolioId)
        .order('date', { ascending: true });

    if (txError || !transactions) {
        return null;
    }

    // Calculate positions and total invested
    const positions: Record<string, { quantity: number; avgPrice: number; invested: number }> = {};
    let totalInvested = 0;

    for (const tx of transactions) {
        if (tx.type === 'BUY') {
            const currentPos = positions[tx.ticker] || { quantity: 0, avgPrice: 0, invested: 0 };
            const newQuantity = currentPos.quantity + tx.qty;
            const newInvested = currentPos.invested + tx.total;

            positions[tx.ticker] = {
                quantity: newQuantity,
                avgPrice: newInvested / newQuantity,
                invested: newInvested
            };

            totalInvested += tx.total;
        } else if (tx.type === 'SELL') {
            const currentPos = positions[tx.ticker];
            if (currentPos) {
                const soldValue = tx.qty * currentPos.avgPrice;
                currentPos.quantity -= tx.qty;
                currentPos.invested -= soldValue;

                totalInvested -= soldValue;
            }
        }
    }

    // Get current prices for all tickers
    const tickers = Object.keys(positions).filter(t => positions[t].quantity > 0);
    let currentValue = 0;

    for (const ticker of tickers) {
        try {
            // Try to get from price_history first
            const { data: priceData } = await supabase
                .from('price_history')
                .select('close')
                .eq('ticker', ticker)
                .order('date', { ascending: false })
                .limit(1)
                .single();

            let price = priceData?.close;

            // If not in history, fetch from Brapi
            if (!price) {
                const response = await fetch(`https://brapi.dev/api/quote/${ticker}`, {
                    next: { revalidate: 300 } // Cache for 5 minutes
                });

                if (response.ok) {
                    const data = await response.json();
                    price = data.results?.[0]?.regularMarketPrice;
                }
            }

            if (price) {
                currentValue += positions[ticker].quantity * Number(price);
            } else {
                // Fallback to invested value if no price available
                currentValue += positions[ticker].invested;
            }
        } catch (error) {
            console.error(`Error fetching price for ${ticker}:`, error);
            currentValue += positions[ticker].invested;
        }
    }

    // Calculate variation
    const variation = totalInvested > 0 ? ((currentValue - totalInvested) / totalInvested) * 100 : 0;
    const variationValue = currentValue - totalInvested;

    return {
        current_value: currentValue,
        total_invested: totalInvested,
        variation_percent: variation,
        variation_value: variationValue,
        positions: Object.entries(positions)
            .filter(([_, pos]) => pos.quantity > 0)
            .map(([ticker, pos]) => ({
                ticker,
                quantity: pos.quantity,
                avg_price: pos.avgPrice,
                invested: pos.invested
            }))
    };
}

/**
 * Get portfolio performance history (rentability over time)
 */
export async function getPortfolioPerformance(portfolioId: string, days: number = 365) {
    const supabase = await createClient();

    // Get all transactions
    const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('portfolio_id', portfolioId)
        .order('date', { ascending: true });

    if (!transactions || transactions.length === 0) {
        return [];
    }

    // Start from first transaction date
    const startDate = new Date(transactions[0].date);
    const endDate = new Date();
    const performanceData = [];

    // Calculate value for each day
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];

        // Get transactions up to this date
        const txUpToDate = transactions.filter(tx =>
            new Date(tx.date) <= currentDate
        );

        // Calculate positions
        const positions: Record<string, number> = {};
        let invested = 0;

        for (const tx of txUpToDate) {
            if (tx.type === 'BUY') {
                positions[tx.ticker] = (positions[tx.ticker] || 0) + tx.qty;
                invested += tx.total;
            } else if (tx.type === 'SELL') {
                positions[tx.ticker] = (positions[tx.ticker] || 0) - tx.qty;
                invested -= tx.total;
            }
        }

        // Get prices for this date
        let portfolioValue = 0;

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
                portfolioValue += quantity * Number(priceData.close);
            }
        }

        if (portfolioValue > 0 && invested > 0) {
            performanceData.push({
                date: dateStr,
                value: portfolioValue,
                invested: invested,
                return: ((portfolioValue - invested) / invested) * 100
            });
        }

        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return performanceData;
}
