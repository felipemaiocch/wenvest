export interface Quote {
    ticker: string;
    price: number;
    currency: string;
    change_pct: number;
    type: 'stock' | 'fund' | 'etf';
    updated_at: number; // timestamp
}

export interface MarketDataProvider {
    getQuote(ticker: string): Promise<Quote | null>;
}
