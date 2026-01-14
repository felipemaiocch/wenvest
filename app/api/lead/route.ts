import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
    try {
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
            return NextResponse.json({ error: 'Supabase service role missing' }, { status: 500 });
        }

        const body = await req.json();
        const { lead, answers, ai } = body || {};

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        const { error } = await supabase
            .from('diagnostic_leads')
            .insert({
                name: lead?.name || null,
                email: lead?.email || null,
                phone: lead?.phone || null,
                answers: answers || null,
                ai_summary: ai?.summary || null,
                ai_risks: ai?.risks || null,
                ai_opportunities: ai?.opportunities || null,
                ai_next_steps: ai?.next_steps || null,
            });

        if (error) {
            console.error('Lead insert error', error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ ok: true });
    } catch (err: any) {
        console.error('lead api error', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ ok: true });
}
