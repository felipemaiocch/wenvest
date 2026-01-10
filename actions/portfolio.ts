'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getPortfolios() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching portfolios:', error);
        return [];
    }

    return data;
}

export async function createPortfolio(name: string, type: string) {
    const supabase = await createClient();

    // Auth check implicitly handled by RLS, but client needs user_id in session
    // We rely on RLS `default auth.uid()` in schema, but usually it's safer to let RLS handle it OR pass it if we weren't using defaults.
    // The schema has `default auth.uid()`, so we just insert name/type.

    const { data, error } = await supabase
        .from('portfolios')
        .insert({ name, type })
        .select()
        .single();

    if (error) {
        console.error('Error creating portfolio:', error);
        throw new Error('Failed to create portfolio');
    }

    revalidatePath('/dashboard');
    return data;
}
