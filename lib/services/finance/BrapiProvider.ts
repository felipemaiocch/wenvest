import { MarketDataProvider, Quote } from "./types";

export class BrapiProvider implements MarketDataProvider {
    private readonly API_URL = "https://brapi.dev/api/quote";
    private readonly TOKEN = "public"; // Using public token for MVP, should be ENV in prod.

    async getQuote(ticker: string): Promise<Quote | null> {
        try {
            const response = await fetch(`${this.API_URL}/${ticker}?token=${this.TOKEN}`);
            if (!response.ok) {
                if (response.status === 404) return null;
                throw new Error(`Brapi API error: ${response.statusText}`);
            }

            const data = await response.json();
            const result = data.results[0];

            if (!result) return null;

            return {
                ticker: result.symbol,
                price: result.regularMarketPrice,
                currency: "BRL",
                change_pct: result.regularMarketChangePercent,
                type: ticker.endsWith("11") ? 'fund' : 'stock', // Simple heuristic for MVP
                updated_at: new Date(result.regularMarketTime).getTime()
            };
        } catch (error) {
            console.error(`[BrapiProvider] Error fetching ${ticker}:`, error);
            return null;
        }
    }
}
