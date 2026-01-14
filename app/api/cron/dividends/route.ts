import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import YahooFinance from 'yahoo-finance2';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const yahooFinance = new YahooFinance();

type Tx = {
    portfolio_id: string;
    ticker: string;
    type: 'BUY' | 'SELL' | 'DIVIDEND';
    date: string;
    qty: number;
};

type DividendEvt = {
    date: string;
    amount: number;
};

const normalizeTicker = (t: string) => t.toUpperCase().replace('.SA', '');

async function fetchDividends(ticker: string): Promise<DividendEvt[]> {
    const candidates = [ticker, ticker.endsWith('.SA') ? ticker : `${ticker}.SA`];

    for (const tk of candidates) {
        try {
            const hist = await yahooFinance.historical(tk, {
                period1: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
                period2: new Date(),
                interval: '1d'
            });

            const evts = (hist || [])
                .filter((row: any) => row.dividends && row.dividends > 0)
                .map((row: any) => ({
                    date: new Date(row.date).toISOString().split('T')[0],
                    amount: Number(row.dividends)
                }));

            if (evts.length) return evts;
        } catch (err) {
            // tenta próximo candidato
        }
    }
    return [];
}

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('authorization');
        const url = new URL(request.url);
        const secretParam = url.searchParams.get('secret');
        const providedSecret = authHeader?.replace('Bearer ', '') || secretParam;

        if (providedSecret !== process.env.CRON_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!serviceRoleKey) {
            return NextResponse.json({ error: 'Service role key missing' }, { status: 500 });
        }

        const supabase = createSupabaseClient(supabaseUrl, serviceRoleKey);

        const { data: txs, error: txErr } = await supabase
            .from('transactions')
            .select('portfolio_id,ticker,type,date,qty');

        if (txErr || !txs) {
            throw new Error(txErr?.message || 'No transactions');
        }

        // Agrupa transações por portfolio/ticker, ordenadas por data
        const grouped = new Map<string, Tx[]>();
        txs.forEach((tx: any) => {
            const key = `${tx.portfolio_id}:${normalizeTicker(tx.ticker)}`;
            const arr = grouped.get(key) || [];
            arr.push({
                portfolio_id: tx.portfolio_id,
                ticker: normalizeTicker(tx.ticker),
                type: tx.type,
                date: tx.date,
                qty: Number(tx.qty)
            });
            grouped.set(key, arr);
        });

        let inserted = 0;
        let skipped = 0;

        for (const [key, list] of grouped.entries()) {
            const [portfolio_id, ticker] = key.split(':');
            const dividends = await fetchDividends(ticker);
            if (!dividends.length) continue;

            // ordena transações por data asc
            list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

            // busca existentes para evitar duplicados
            const existingDates = dividends.map(d => d.date);
            const { data: existing } = await supabase
                .from('dividends')
                .select('ex_date, amount')
                .eq('portfolio_id', portfolio_id)
                .eq('ticker', ticker)
                .in('ex_date', existingDates);

            const existsSet = new Set((existing || []).map(e => `${e.ex_date}:${e.amount}`));

            for (const div of dividends) {
                // calcula quantidade em aberto na data do dividendo
                let qtyAtDate = 0;
                for (const tx of list) {
                    if (new Date(tx.date) <= new Date(div.date)) {
                        qtyAtDate += tx.type === 'SELL' ? -tx.qty : tx.qty;
                    }
                }
                if (qtyAtDate <= 0) {
                    skipped++;
                    continue;
                }

                const dedupeKey = `${div.date}:${div.amount}`;
                if (existsSet.has(dedupeKey)) {
                    skipped++;
                    continue;
                }

                const { error: insErr } = await supabase.from('dividends').insert({
                    portfolio_id,
                    ticker,
                    ex_date: div.date,
                    payment_date: null,
                    amount: div.amount,
                    quantity: qtyAtDate,
                    total: div.amount * qtyAtDate,
                });

                if (insErr) {
                    console.warn('Dividend insert error', insErr.message);
                    skipped++;
                } else {
                    inserted++;
                }
            }
        }

        return NextResponse.json({
            success: true,
            inserted,
            skipped
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
