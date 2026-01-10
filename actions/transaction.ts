'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// Helper to get supabase client
async function getSupabase() {
    const cookieStore = await cookies();
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    );
}

export type TransactionInput = {
    portfolio_id: string;
    ticker: string;
    type: 'BUY' | 'SELL' | 'DIVIDEND';
    date: Date;
    qty: number;
    price: number;
    origin?: string;
}

export async function addTransaction(input: TransactionInput) {
    const supabase = await getSupabase();

    // User validation happens via RLS mostly, but good to check user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const total = input.qty * input.price;

    const { error } = await supabase.from('transactions').insert({
        portfolio_id: input.portfolio_id,
        ticker: input.ticker.toUpperCase(),
        type: input.type,
        date: input.date.toISOString(),
        qty: input.qty,
        price: input.price,
        total: total,
        origin: input.origin || 'Manual'
    });

    if (error) {
        console.error("Error adding transaction:", error);
        throw new Error("Failed to add transaction");
    }

    revalidatePath('/client');
    return { success: true };
}

export async function getTransactions(portfolioId: string) {
    const supabase = await getSupabase();

    // Now that we have real portfolios with UUIDs, we MUST filter by portfolio_id.
    // RLS ensures we only see transactions for portfolios we own, but we only want THIS portfolio's data.
    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('portfolio_id', portfolioId)
        .order('date', { ascending: false });

    if (error) {
        console.error("Error fetching transactions:", error);
        throw new Error("Failed to fetch transactions");
    }

    return data;
}

export async function deleteTransaction(id: string) {
    const supabase = await getSupabase();
    const { error } = await supabase.from('transactions').delete().eq('id', id);

    if (error) throw new Error("Failed to delete transaction");

    revalidatePath('/client');
    return { success: true };
}
