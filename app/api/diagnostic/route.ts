import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { lead, answers } = body || {};

        if (!process.env.GROQ_API_KEY) {
            return NextResponse.json({ error: 'GROQ_API_KEY missing' }, { status: 500 });
        }

        const prompt = `
Você é um consultor patrimonial da Wenvest. Responda em português BR com recomendações específicas, focando em como a Wenvest resolve os pontos fracos. Seja direto, nada genérico. Retorne APENAS JSON válido, sem texto fora do JSON.

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

Formato de saída (JSON):
{
 "summary": "2 frases sobre a situação atual, citando lacunas e prioridade",
 "risks": "2 frases sobre riscos reais ou perdas potenciais se nada for feito",
 "opportunities": "2 frases sobre ganhos ao contratar a Wenvest (ex: diversificação global, eficiência fiscal, rebalanceamento)",
 "next_steps": ["passo 1", "passo 2", "passo 3"],
 "cta": "1 frase convidando a falar com a Wenvest para resolver"
}
Use verbos de ação e cite BR/US/eficiência fiscal/riscos onde fizer sentido.`;

        const groqResp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-oss-20b',
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
