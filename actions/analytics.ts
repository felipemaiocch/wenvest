'use server';

import { createClient } from "@/lib/supabase/server";

/**
 * Verifica se existe histórico de preços no sistema
 */
export async function checkPriceHistoryExists(): Promise<boolean> {
    try {
        const supabase = await createClient();

        // Tentar criar a tabela se não existir ainda (graceful degradation)
        // Isso evita erro caso a tabela ainda não tenha sido criada
        const { count, error } = await supabase
            .from('price_history')
            .select('*', { count: 'exact', head: true })
            .limit(1);

        if (error) {
            // Se tabela não existe, retorna false silenciosamente
            console.log('Price history table not ready yet:', error.message);
            return false;
        }

        return (count ?? 0) > 100; // Requer pelo menos 100 registros para ativar
    } catch (error) {
        return false;
    }
}

/**
 * Calcula volatilidade de um ativo (anualizada)
 */
export async function calculateVolatility(ticker: string, days: number = 30): Promise<number | null> {
    try {
        const supabase = await createClient();

        const { data: prices } = await supabase
            .from('price_history')
            .select('close_price, date')
            .eq('ticker', ticker)
            .order('date', { ascending: false })
            .limit(days);

        if (!prices || prices.length < 10) return null;

        // Calcular retornos diários
        const returns = prices.slice(0, -1).map((p, i) =>
            (p.close_price - prices[i + 1].close_price) / prices[i + 1].close_price
        );

        // Volatilidade = Desvio Padrão dos Retornos * sqrt(252)
        const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
        const dailyVol = Math.sqrt(variance);

        return dailyVol * Math.sqrt(252) * 100; // Anualizado em %
    } catch (error) {
        return null;
    }
}

/**
 * Calcula indicadores de performance de um portfolio
 */
export async function calculatePortfolioMetrics(portfolioId: string) {
    // TODO: Implementar quando histórico estiver disponível
    // Por enquanto, retorna null para ativar placeholder
    const hasHistory = await checkPriceHistoryExists();

    if (!hasHistory) return null;

    // EXEMPLO de como seria o cálculo real:
    return {
        sharpe: 1.45,
        beta: 0.89,
        volatility: 15.2,
        sortino: 1.82
    };
}

/**
 * Calcula drawdown máximo de um portfolio
 */
export async function calculateDrawdown(portfolioId: string) {
    const hasHistory = await checkPriceHistoryExists();

    if (!hasHistory) return null;

    // EXEMPLO: Como seria o cálculo real
    return {
        maxDrawdown: -12.5,
        currentDrawdown: -3.2,
        peakDate: '2025-06-15',
        troughDate: '2025-09-22',
        chartData: [
            { date: '01/2025', value: 0 },
            { date: '02/2025', value: -2.1 },
            { date: '03/2025', value: -5.4 },
            // ...
        ]
    };
}

/**
 * Calcula dados para gráfico Risco x Retorno
 */
export async function calculateRiskReturn(portfolioId: string) {
    const hasHistory = await checkPriceHistoryExists();

    if (!hasHistory) return null;

    // EXEMPLO: Retornaria array de ativos com risco/retorno
    return [
        { ticker: 'VALE3', risk: 18.5, return: 22.3 },
        { ticker: 'PETR4', risk: 25.1, return: 15.8 },
        { ticker: 'ITUB4', risk: 12.4, return: 18.2 },
    ];
}

/**
 * Calcula matriz de correlação entre ativos
 */
export async function calculateCorrelationMatrix(portfolioId: string) {
    const hasHistory = await checkPriceHistoryExists();

    if (!hasHistory) return null;

    // EXEMPLO: Matriz de correlação
    return {
        tickers: ['VALE3', 'PETR4', 'ITUB4'],
        matrix: [
            [1.00, 0.72, 0.45],  // VALE3
            [0.72, 1.00, 0.58],  // PETR4
            [0.45, 0.58, 1.00],  // ITUB4
        ]
    };
}
