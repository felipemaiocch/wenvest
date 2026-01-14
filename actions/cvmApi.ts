'use server';

/**
 * CVM API integration for Brazilian investment funds
 * Allows searching by CNPJ and retrieving fund information
 */

interface CVMFundData {
    cnpj: string;
    nome: string;
    ticker?: string;
    tipo: string;
}

/**
 * Search for a fund by CNPJ using CVM's public API
 */
export async function searchFundByCNPJ(cnpj: string): Promise<CVMFundData | null> {
    try {
        // Remove formatting from CNPJ
        const cleanCNPJ = cnpj.replace(/[^\d]/g, '');

        // CVM API endpoint for fund data
        const response = await fetch(
            `https://dados.cvm.gov.br/dados/FI/CAD/DADOS/cad_fi.csv`,
            { next: { revalidate: 86400 } } // Cache for 24 hours
        );

        if (!response.ok) {
            console.error('CVM API error:', response.status);
            return null;
        }

        const csvText = await response.text();
        const lines = csvText.split('\n');

        // Parse CSV and find fund by CNPJ
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            if (line.includes(cleanCNPJ)) {
                const parts = line.split(';');

                return {
                    cnpj: parts[0] || cleanCNPJ,
                    nome: parts[1] || 'Fundo sem nome',
                    tipo: parts[4] || 'Indefinido',
                    ticker: undefined // CVM doesn't provide ticker directly
                };
            }
        }

        return null;
    } catch (error) {
        console.error('Error searching CVM:', error);
        return null;
    }
}

/**
 * Try to find a ticker for a Brazilian fund
 * Some FIIs have tickers on B3, but most funds don't
 */
export async function findTickerForFund(fundName: string, cnpj: string): Promise<string | null> {
    try {
        // Try searching Brapi for similar names
        const response = await fetch(
            `https://brapi.dev/api/available`,
            { next: { revalidate: 86400 } }
        );

        if (!response.ok) return null;

        const data = await response.json();
        const stocks = data.stocks || [];

        // Simple name matching (could be improved)
        const nameWords = fundName.toLowerCase().split(' ');

        for (const stock of stocks) {
            const stockName = stock.name?.toLowerCase() || '';
            const matches = nameWords.filter(word =>
                word.length > 3 && stockName.includes(word)
            );

            if (matches.length >= 2) {
                return stock.stock; // Return ticker
            }
        }

        return null;
    } catch (error) {
        console.error('Error finding ticker:', error);
        return null;
    }
}

/**
 * Enhanced search that accepts both ticker and CNPJ
 */
export async function searchAssetUnified(query: string) {
    const cleanQuery = query.trim();
    if (!cleanQuery) return [];

    const results: { symbol: string; name: string; type: string; extra?: any }[] = [];
    const dedupe = new Set<string>();

    const push = (item: { symbol: string; name: string; type: string; extra?: any }) => {
        if (!item.symbol || dedupe.has(item.symbol)) return;
        dedupe.add(item.symbol);
        results.push(item);
    };

    // CNPJ lookup
    const cnpjPattern = /^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/;
    if (cnpjPattern.test(cleanQuery)) {
        const fundData = await searchFundByCNPJ(cleanQuery);
        if (fundData) {
            const ticker = await findTickerForFund(fundData.nome, fundData.cnpj);
            push({
                symbol: ticker || fundData.cnpj,
                name: fundData.nome,
                type: 'FUND',
                extra: { cnpj: fundData.cnpj }
            });
            return results;
        }
    }

    // Yahoo search (funciona para BR/US/ETFs)
    try {
        const res = await fetch(`https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(cleanQuery)}&lang=pt-BR&region=BR&quotesCount=10&newsCount=0`, {
            cache: 'no-store'
        });
        if (res.ok) {
            const data = await res.json();
            (data.quotes || []).forEach((q: any) => {
                if (!q.symbol) return;
                const type = q.quoteType || 'EQUITY';
                push({
                    symbol: q.symbol,
                    name: q.longname || q.shortname || q.symbol,
                    type
                });
            });
        }
    } catch (err) {
        console.error('Yahoo search error', err);
    }

    // Tentativa direta na Brapi (melhor para tickers BR simples)
    try {
        const apiKey = process.env.BRAPI_API_KEY || '';
        const url = apiKey
            ? `https://brapi.dev/api/quote/${cleanQuery}?token=${apiKey}`
            : `https://brapi.dev/api/quote/${cleanQuery}`;

        const response = await fetch(url, { next: { revalidate: 300 } });
        if (response.ok) {
            const data = await response.json();
            const result = data.results?.[0];
            if (result) {
                push({
                    symbol: result.symbol,
                    name: result.longName || result.shortName || result.symbol,
                    type: result.type || 'STOCK'
                });
            }
        }
    } catch (error) {
        console.error('Brapi search error:', error);
    }

    return results;
}
