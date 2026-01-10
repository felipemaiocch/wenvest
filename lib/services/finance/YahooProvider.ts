import { MarketDataProvider, Quote } from "./types";
import yahooFinance from 'yahoo-finance2';

export class YahooProvider implements MarketDataProvider {
    async getQuote(ticker: string): Promise<Quote | null> {
        try {
            // Yahoo Finance uses strict tickers (e.g., PETR4.SA, IVV)
            const quoteResult = await yahooFinance.quote(ticker);
            const quote = quoteResult as any;

            if (!quote) return null;

            let type: 'stock' | 'fund' | 'etf' = 'stock';
            if (quote.quoteType === 'ETF') type = 'etf';
            if (quote.quoteType === 'MUTUALFUND') type = 'fund';

            return {
                ticker: ticker,
                price: quote.regularMarketPrice || 0,
                currency: quote.currency || "USD",
                change_pct: quote.regularMarketChangePercent || 0,
                type: type,
                updated_at: quote.regularMarketTime ? new Date(quote.regularMarketTime).getTime() : Date.now()
            };

        } catch (error) {
            console.error(`[YahooProvider] Error fetching ${ticker}:`, error);
            return null;
        }
    }
}
