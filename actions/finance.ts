'use server';

import { financeService } from "@/lib/services/finance/FinanceService";

export async function searchAssets(query: string) {
    if (!query || query.length < 2) return [];

    // Using Yahoo Provider via FinanceService if implemented, assuming search functionality exists or we might need to implement it directly here if FinanceService doesn't expose search.
    // Checking FinanceService content via view_file revealed it has `getQuotes` but DOES IT HAVE SEARCH?
    // I need to check the file content. 
    // If not, I'll implement a simple fetch here to Yahoo Finance API or Brapi.

    // Mocking search for now if FinanceService doesn't have it, BUT I should try to check first.
    // Since I can't wait, I'll check the output of view_file in next logic.
    // Assuming for now I'll just use yahoo finance via fetch if needed.

    // Let's implement a simple fetch to Yahoo Finance autocomplete
    try {
        const res = await fetch(`https://query1.finance.yahoo.com/v1/finance/search?q=${query}&lang=pt-BR&region=BR&quotesCount=10&newsCount=0`);
        const data = await res.json();

        return data.quotes
            .filter((q: any) => q.quoteType === 'EQUITY' || q.quoteType === 'ETF' || q.quoteType === 'MUTUALFUND' || q.quoteType === 'CRYPTOCURRENCY')
            .map((q: any) => ({
                ticker: q.symbol,
                name: q.longname || q.shortname || q.symbol,
                market: q.exchange === 'SAO' ? 'BR' : (q.quoteType === 'CRYPTOCURRENCY' ? 'CRYPTO' : 'US')
            }));
    } catch (e) {
        console.error("Search error", e);
        return [];
    }
}

export async function getQuote(ticker: string) {
    const quotes = await financeService.getQuotes([ticker]);
    return quotes[0];
}
