'use server';

import { getTransactions } from "./transaction";
import { financeService } from "@/lib/services/finance/FinanceService";

/**
 * THE ENGINE
 * Consolidates transactions into current position and calculates P&L
 */

export async function getPortfolioSummary(portfolioId: string) {
    // 1. Get raw history
    const transactions = await getTransactions(portfolioId);
    if (!transactions || transactions.length === 0) {
        return {
            netWorth: 0,
            variation: 0,
            assets: []
        };
    }

    // 2. Consolidate Position (The "Ledger" logic)
    const positions = new Map<string, { qty: number, avgPrice: number, totalCost: number }>();

    for (const tx of transactions) {
        // Reverse order (oldest first) usually better for PM, but we got desc. 
        // For simple PM calc, order matters slightly less if we just sum total qty and total cost for buys.
        // Let's do simple Avg Price: Total Invested / Total Qty (for Buys).
        // Sells reduce Qty but keep Avg Price.
        
        // Actually, let's just do a simple aggregation for MVP
        if (!positions.has(tx.ticker)) {
            positions.set(tx.ticker, { qty: 0, avgPrice: 0, totalCost: 0 });
        }
        
        const pos = positions.get(tx.ticker)!;

        if (tx.type === 'BUY') {
            const newQty = pos.qty + Number(tx.qty);
            const addedCost = Number(tx.total);
            pos.totalCost += addedCost;
            pos.qty = newQty;
            pos.avgPrice = pos.totalCost / (pos.qty || 1); // Simple PM
        } else if (tx.type === 'SELL') {
             // For sells, reduce qty, reduce totalCost proportionally to keep PM same
             const sellQty = Math.abs(Number(tx.qty));
             const costRemoved = sellQty * pos.avgPrice;
             pos.qty -= sellQty;
             pos.totalCost -= costRemoved;
        }
    }

    // Filter out zero positions
    const activePositions = Array.from(positions.entries())
        .filter(([_, pos]) => pos.qty > 0.000001)
        .map(([ticker, pos]) => ({ ticker, ...pos }));

    // 3. Fetch Realtime Prices
    const tickers = activePositions.map(p => p.ticker);
    const quotes = await financeService.getQuotes(tickers);
    const quoteMap = new Map(quotes.map(q => [q.ticker, q]));

    // 4. Calculate Final Metrics
    let totalValue = 0;
    let totalCost = 0;
    
    const assetDetails = activePositions.map(pos => {
        const quote = quoteMap.get(pos.ticker);
        const currentPrice = quote?.price || pos.avgPrice; // Fallback to cost if no quote
        const currentValue = pos.qty * currentPrice;
        const profit = currentValue - (pos.qty * pos.avgPrice);
        const profitPct = (profit / (pos.qty * pos.avgPrice)) * 100;

        totalValue += currentValue;
        totalCost += (pos.qty * pos.avgPrice);

        return {
            ticker: pos.ticker,
            qty: pos.qty,
            avgPrice: pos.avgPrice,
            currentPrice,
            currentValue,
            profit,
            profitPct,
            type: quote?.type || 'stock',
            updatedAt: quote?.updated_at
        };
    });

    // 5. Calculate Total Variation
    const totalProfit = totalValue - totalCost;
    const totalVariationPct = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

    return {
        netWorth: totalValue,
        cost: totalCost,
        variation: totalVariationPct,
        profit: totalProfit,
        assets: assetDetails.sort((a,b) => b.currentValue - a.currentValue), // Top assets first
        lastUpdate: Date.now()
    };
}
