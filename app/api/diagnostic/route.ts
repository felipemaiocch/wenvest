import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { lead, answers } = body || {};

        if (!process.env.GROQ_API_KEY) {
            return NextResponse.json({ error: 'GROQ_API_KEY missing' }, { status: 500 });
        }

        const prompt = `
Você é um consultor patrimonial da Wenvest. Gere recomendações concisas em português, formato JSON.

Dados do lead:
Nome: ${lead?.name || 'N/A'}
Email: ${lead?.email || 'N/A'}
Telefone: ${lead?.phone || 'N/A'}

Notas (1-10, 3/6/9):
- Alocação: ${answers?.alloc || 0}
- Risco: ${answers?.risk || 0}
- Liquidez: ${answers?.liquidity || 0}
- Objetivos: ${answers?.goals || 0}
- Fiscal: ${answers?.tax || 0}

Retorne JSON com:
{
 "summary": "1-2 frases do estado geral",
 "risks": "1-2 frases de riscos ou lacunas",
 "opportunities": "1-2 frases de ganhos ao contratar a Wenvest",
 "next_steps": ["passo 1","passo 2","passo 3"]
}
Não inclua nada fora do JSON.
`;

        const groqResp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'llama3-8b-8192',
                messages: [
                    { role: 'system', content: 'Você é um consultor financeiro que responde em português brasileiro.' },
                    { role: 'user', content: prompt },
                ],
                temperature: 0.4,
            }),
        });

        if (!groqResp.ok) {
            const text = await groqResp.text();
            console.error('Groq error', groqResp.status, text);
            return NextResponse.json({ error: 'Groq request failed' }, { status: 500 });
        }

        const data = await groqResp.json();
        const content = data?.choices?.[0]?.message?.content;
        if (!content) {
            return NextResponse.json({ error: 'No content' }, { status: 500 });
        }

        // try parse json from content
        let parsed: any;
        try {
            parsed = JSON.parse(content);
        } catch {
            // fallback: attempt to extract JSON substring
            const match = content.match(/\{[\s\S]*\}/);
            if (match) {
                parsed = JSON.parse(match[0]);
            }
        }

        if (!parsed) {
            return NextResponse.json({ error: 'Parse failed', raw: content }, { status: 500 });
        }

        return NextResponse.json({ insights: parsed });
    } catch (error: any) {
        console.error('diagnostic error', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
