'use server';

import { createClient } from "@/lib/supabase/server";
import YahooFinance from "yahoo-finance2";
const yahooFinance = new YahooFinance();

type DividendEvent = {
    ticker: string;
    date: string;
    amount: number; // por ação
    quantity: number;
    total: number;
};

export async function getEstimatedDividends(portfolioId: string): Promise<DividendEvent[]> {
    const supabase = await createClient();
    const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('portfolio_id', portfolioId);

    if (!transactions || transactions.length === 0) return [];

    // Quantidade atual por ticker
    const qtyMap = new Map<string, number>();
    transactions.forEach(tx => {
        const t = (tx.ticker as string).toUpperCase();
        const curr = qtyMap.get(t) || 0;
        const qty = Number(tx.qty);
        qtyMap.set(t, tx.type === 'SELL' ? curr - qty : curr + qty);
    });

    const tickers = Array.from(qtyMap.entries()).filter(([_, qty]) => qty > 0);
    const start = new Date();
    start.setFullYear(start.getFullYear() - 1);

    const allEvents: DividendEvent[] = [];

    for (const [ticker, qty] of tickers) {
        const tryTickers = [ticker];
        // Yahoo usa .SA para B3
        if (!ticker.endsWith('.SA')) {
            tryTickers.push(`${ticker}.SA`);
        }

        let found = false;
        for (const t of tryTickers) {
            try {
                const hist = await yahooFinance.historical(t, {
                    period1: start,
                    period2: new Date(),
                    interval: '1d'
                });

                (hist || []).forEach((row: any) => {
                    if (row.dividends && row.dividends > 0) {
                        const amountPerShare = Number(row.dividends);
                        allEvents.push({
                            ticker,
                            date: new Date(row.date).toISOString().split('T')[0],
                            amount: amountPerShare,
                            quantity: qty,
                            total: amountPerShare * qty,
                        });
                        found = true;
                    }
                });
                if (found) break;
            } catch (err) {
                // Não interrompe fluxo se um ticker falhar
                console.warn('Dividend fetch error', t, err);
            }
        }
    }

    return allEvents.sort((a, b) => a.date.localeCompare(b.date));
}
