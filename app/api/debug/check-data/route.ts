import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Debug API to check database connection
 */
export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const secret = url.searchParams.get('secret');

        if (secret !== process.env.CRON_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Create admin client (bypasses RLS)
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error('SUPABASE_SERVICE_ROLE_KEY ausente');
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        // Get all transactions
        const { data, error } = await supabase
            .from('transactions')
            .select('*');

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Get all portfolios
        const { data: portfolios } = await supabase
            .from('portfolios')
            .select('*');

        return NextResponse.json({
            transactions_count: data?.length || 0,
            portfolios_count: portfolios?.length || 0,
            transactions: data,
            portfolios
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
