'use server';

import { createClient } from "@/lib/supabase/server";
import YahooFinance from "yahoo-finance2";
const yahooFinance = new YahooFinance();

type PricePoint = { date: string; close: number };

const isB3Ticker = (ticker: string) => {
    if (ticker.endsWith('.SA')) return true;
    const b3Regex = /^[A-Z]{4}[34]$|^[A-Z]{4}11$|^[A-Z]{3}11$/;
    return b3Regex.test(ticker);
};

const normalizeTicker = (t: string) => t.toUpperCase();

async function getPortfolioTransactions(portfolioId: string) {
    const supabase = await createClient();
    const { data } = await supabase
        .from('transactions')
        .select('*')
        .eq('portfolio_id', portfolioId)
        .order('date', { ascending: true });
    return data || [];
}

async function getLocalHistory(ticker: string, start: string) {
    const supabase = await createClient();
    const { data } = await supabase
        .from('price_history')
        .select('date, close')
        .eq('ticker', ticker)
        .gte('date', start)
        .order('date', { ascending: true });
    return (data || []).map(d => ({ date: d.date, close: Number(d.close) }));
}

async function fetchRemoteHistory(ticker: string, days: number): Promise<PricePoint[]> {
    const normalized = normalizeTicker(ticker);
    const start = new Date();
    start.setDate(start.getDate() - days);

    if (isB3Ticker(normalized)) {
        const base = normalized.replace('.SA', '');
        const url = new URL(`https://brapi.dev/api/quote/${base}`);
        url.searchParams.set('range', `${days}d`);
        url.searchParams.set('interval', '1d');
        if (process.env.BRAPI_API_KEY) url.searchParams.set('token', process.env.BRAPI_API_KEY);

        try {
            const response = await fetch(url.toString(), { cache: 'no-store' });
            if (response.ok) {
                const data = await response.json();
                const result = data.results?.[0];
                if (result?.historicalDataPrice?.length) {
                    return result.historicalDataPrice
                        .map((item: any) => ({
                            date: new Date(item.date * 1000).toISOString().split('T')[0],
                            close: Number(item.close)
                        }))
                        .sort((a: any, b: any) => a.date.localeCompare(b.date));
                }
            } else {
                console.warn(`Brapi history failed (${response.status}). Fallback to Yahoo.`);
            }
        } catch (err) {
            console.warn(`Brapi history error for ${base}:`, err);
        }

        // Fallback Yahoo (.SA)
        const yahooTicker = normalized.endsWith('.SA') ? normalized : `${normalized}.SA`;
        try {
            const hist = await yahooFinance.historical(yahooTicker, {
                period1: start,
                period2: new Date(),
                interval: '1d'
            });
            return (hist || [])
                .map((row: any) => ({
                    date: new Date(row.date).toISOString().split('T')[0],
                    close: Number(row.close)
                }))
                .sort((a, b) => a.date.localeCompare(b.date));
        } catch (err) {
            console.warn(`Yahoo history fallback failed for ${yahooTicker}:`, err);
            return [];
        }
    }

    try {
        const hist = await yahooFinance.historical(normalized, {
            period1: start,
            period2: new Date(),
            interval: '1d'
        });

        return (hist || [])
            .map((row: any) => ({
                date: new Date(row.date).toISOString().split('T')[0],
                close: Number(row.close)
            }))
            .sort((a, b) => a.date.localeCompare(b.date));
    } catch (err) {
        console.warn(`Yahoo history failed for ${normalized}:`, err);
        return [];
    }
}

async function getHistory(ticker: string, days: number): Promise<PricePoint[]> {
    const start = new Date();
    start.setDate(start.getDate() - days);
    const startStr = start.toISOString().split('T')[0];
    const local = await getLocalHistory(ticker, startStr);
    if (local.length > 5) return local;
    return fetchRemoteHistory(ticker, days);
}

function dailyReturns(history: PricePoint[]) {
    const returns: { date: string; ret: number }[] = [];
    for (let i = 1; i < history.length; i++) {
        const prev = history[i - 1].close;
        const curr = history[i].close;
        if (prev > 0) {
            returns.push({ date: history[i].date, ret: (curr - prev) / prev });
        }
    }
    return returns;
}

function statsFromReturns(rets: number[]) {
    if (rets.length === 0) return { mean: 0, std: 0 };
    const mean = rets.reduce((a, b) => a + b, 0) / rets.length;
    const variance = rets.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / rets.length;
    return { mean, std: Math.sqrt(variance) };
}

export async function checkPriceHistoryExists(): Promise<boolean> {
    try {
        const supabase = await createClient();
        const { count } = await supabase
            .from('price_history')
            .select('*', { count: 'exact', head: true })
            .limit(1);
        return (count ?? 0) > 0;
    } catch {
        return false;
    }
}

export async function calculateVolatility(ticker: string, days: number = 60): Promise<number | null> {
    try {
        const history = await getHistory(ticker, days);
        const rets = dailyReturns(history).map(r => r.ret);
        if (rets.length < 5) return null;
        const { std } = statsFromReturns(rets);
        return std * Math.sqrt(252) * 100;
    } catch {
        return null;
    }
}

export async function calculatePortfolioMetrics(portfolioId: string) {
    try {
        const transactions = await getPortfolioTransactions(portfolioId);
        if (!transactions.length) return null;

        const positions = new Map<string, number>();
        transactions.forEach(tx => {
            const t = normalizeTicker(tx.ticker);
            const curr = positions.get(t) || 0;
            const qty = Number(tx.qty);
            positions.set(t, tx.type === 'SELL' ? curr - qty : curr + qty);
        });

        const active = Array.from(positions.entries()).filter(([_, qty]) => qty > 0);
        if (active.length === 0) return null;

        const histories = await Promise.all(active.map(([ticker]) => getHistory(ticker, 180)));
        const latestPrices = histories.map(h => h.at(-1)?.close || 0);
        const totalValue = latestPrices.reduce((sum, price, idx) => sum + price * active[idx][1], 0);
        if (!totalValue) return null;

        // Weighted daily returns aligned by date
        const weightMap = new Map<string, number>();
        active.forEach(([ticker, qty], idx) => {
            const price = latestPrices[idx] || 0;
            weightMap.set(ticker, totalValue ? (price * qty) / totalValue : 0);
        });

        const dateRet = new Map<string, number>();
        active.forEach(([ticker], idx) => {
            const w = weightMap.get(ticker) || 0;
            const rets = dailyReturns(histories[idx]);
            rets.forEach(r => {
                const prev = dateRet.get(r.date) || 0;
                dateRet.set(r.date, prev + r.ret * w);
            });
        });

        const portfolioRets = Array.from(dateRet.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([, ret]) => ret);

        if (portfolioRets.length < 5) return null;

        const { mean, std } = statsFromReturns(portfolioRets);
        const annualVol = std * Math.sqrt(252);

        const downside = portfolioRets.filter(r => r < 0);
        const { std: downsideStd } = statsFromReturns(downside);

        // Benchmark (Ibovespa) para beta
        let beta = null;
        try {
            const benchmarkHist = await getHistory('^BVSP', 180);
            const benchRets = dailyReturns(benchmarkHist).map(r => r.ret);
            const commonLength = Math.min(benchRets.length, portfolioRets.length);
            if (commonLength > 5) {
                const pR = portfolioRets.slice(-commonLength);
                const bR = benchRets.slice(-commonLength);
                const pMean = pR.reduce((a, b) => a + b, 0) / commonLength;
                const bMean = bR.reduce((a, b) => a + b, 0) / commonLength;
                let cov = 0;
                let varB = 0;
                for (let i = 0; i < commonLength; i++) {
                    cov += (pR[i] - pMean) * (bR[i] - bMean);
                    varB += Math.pow(bR[i] - bMean, 2);
                }
                cov /= commonLength;
                varB /= commonLength;
                beta = varB === 0 ? null : cov / varB;
            }
        } catch { /* ignore */ }

        return {
            sharpe: annualVol === 0 ? 0 : (mean / std) * Math.sqrt(252),
            beta,
            volatility: annualVol * 100,
            sortino: downsideStd === 0 ? null : (mean * Math.sqrt(252)) / downsideStd,
        };
    } catch (err) {
        console.warn('calculatePortfolioMetrics failed', err);
        return null;
    }
}

export async function calculateDrawdown(portfolioId: string) {
    try {
        const transactions = await getPortfolioTransactions(portfolioId);
        if (!transactions.length) return null;

        const positions = new Map<string, number>();
        transactions.forEach(tx => {
            const t = normalizeTicker(tx.ticker);
            const curr = positions.get(t) || 0;
            const qty = Number(tx.qty);
            positions.set(t, tx.type === 'SELL' ? curr - qty : curr + qty);
        });
        const active = Array.from(positions.entries()).filter(([_, qty]) => qty > 0);
        if (!active.length) return null;

        const histories = await Promise.all(active.map(([ticker]) => getHistory(ticker, 365)));
        const latestPrices = histories.map(h => h.at(-1)?.close || 0);
        const totalValue = latestPrices.reduce((sum, price, idx) => sum + price * active[idx][1], 0);
        if (!totalValue) return null;

        const weightMap = new Map<string, number>();
        active.forEach(([ticker, qty], idx) => {
            const price = latestPrices[idx] || 0;
            weightMap.set(ticker, totalValue ? (price * qty) / totalValue : 0);
        });

        const dateRet = new Map<string, number>();
        active.forEach(([ticker], idx) => {
            const w = weightMap.get(ticker) || 0;
            const rets = dailyReturns(histories[idx]);
            rets.forEach(r => {
                const prev = dateRet.get(r.date) || 0;
                dateRet.set(r.date, prev + r.ret * w);
            });
        });

        const ordered = Array.from(dateRet.entries()).sort((a, b) => a[0].localeCompare(b[0]));
        if (!ordered.length) return null;

        let value = 1;
        let peak = 1;
        let maxDrawdown = 0;
        let peakDate = ordered[0][0];
        let troughDate = ordered[0][0];
        const chartData: { date: string; value: number }[] = [];

        ordered.forEach(([date, ret]) => {
            value *= (1 + ret);
            if (value > peak) {
                peak = value;
                peakDate = date;
            }
            const dd = (value - peak) / peak;
            if (dd < maxDrawdown) {
                maxDrawdown = dd;
                troughDate = date;
            }
            chartData.push({ date, value: dd * 100 });
        });

        return {
            maxDrawdown: Number((maxDrawdown * 100).toFixed(2)),
            currentDrawdown: Number(((value - peak) / peak * 100).toFixed(2)),
            peakDate,
            troughDate,
            chartData,
        };
    } catch (err) {
        console.warn('calculateDrawdown failed', err);
        return null;
    }
}

export async function calculateRiskReturn(portfolioId: string) {
    try {
        const transactions = await getPortfolioTransactions(portfolioId);
        if (!transactions.length) return null;

        const positions = new Map<string, number>();
        transactions.forEach(tx => {
            const t = normalizeTicker(tx.ticker);
            const curr = positions.get(t) || 0;
            const qty = Number(tx.qty);
            positions.set(t, tx.type === 'SELL' ? curr - qty : curr + qty);
        });
        const active = Array.from(positions.entries()).filter(([_, qty]) => qty > 0);
        if (!active.length) return null;

        const results = [];
        for (const [ticker] of active) {
            const history = await getHistory(ticker, 180);
            const rets = dailyReturns(history).map(r => r.ret);
            if (rets.length < 5) continue;
            const { mean, std } = statsFromReturns(rets);
            results.push({
                ticker,
                risk: Number((std * Math.sqrt(252) * 100).toFixed(2)),
                return: Number((mean * 252 * 100).toFixed(2)),
            });
        }

        return results.length ? results : null;
    } catch (err) {
        console.warn('calculateRiskReturn failed', err);
        return null;
    }
}

// Mantido apenas para compatibilidade: componente de correlação foi removido,
// mas exportamos um stub para não quebrar o build se ainda houver import.
export async function calculateCorrelationMatrix(_portfolioId: string) {
    return null;
}
