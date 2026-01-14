import { BrapiProvider } from "./BrapiProvider";
import { YahooProvider } from "./YahooProvider";
import { Quote } from "./types";

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export class FinanceService {
    private brapi: BrapiProvider;
    private yahoo: YahooProvider;
    private cache: Map<string, { quote: Quote, expires: number }>;

    constructor() {
        this.brapi = new BrapiProvider();
        this.yahoo = new YahooProvider();
        this.cache = new Map();
    }

    private getProvider(ticker: string) {
        // Simple routing logic: 
        // 3-5 chars + optional number (PETR4, WEGE3, VALE3) -> Brapi (Assumption: Default context is B3 for clean tickers)
        // OR ending in .SA -> Brapi (Explicit)
        // Everything else (IVV, VTSAX, AAPL) -> Yahoo

        if (ticker.endsWith(".SA")) return this.brapi;

        // Regex for standard B3 tickers (e.g. ABCD3, ABCD4, ABC11, ABCD11)
        const b3Regex = /^[A-Z]{4}[34]|^[A-Z]{4}11$|^[A-Z]{3}11$/;
        if (b3Regex.test(ticker)) return this.brapi;

        return this.yahoo;
    }

    async getQuote(ticker: string): Promise<Quote | null> {
        const now = Date.now();
        const cached = this.cache.get(ticker);

        if (cached && cached.expires > now) {
            console.log(`[FinanceService] Cache HIT for ${ticker}`);
            return cached.quote;
        }

        console.log(`[FinanceService] Fetching LIVE for ${ticker}`);
        const provider = this.getProvider(ticker);
        let quote = await provider.getQuote(ticker);

        // Fallback para Yahoo se Brapi falhar (ex.: 401 por falta de token)
        if (!quote && provider === this.brapi) {
            const yahooTicker = ticker.endsWith('.SA') ? ticker : `${ticker}.SA`;
            quote = await this.yahoo.getQuote(yahooTicker);
        }

        if (quote) {
            this.cache.set(ticker, { quote, expires: now + CACHE_TTL_MS });
        }

        return quote;
    }

    async getQuotes(tickers: string[]): Promise<Quote[]> {
        const promises = tickers.map(t => this.getQuote(t));
        const results = await Promise.all(promises);
        return results.filter((q): q is Quote => q !== null);
    }
}

// Singleton instance
export const financeService = new FinanceService();
