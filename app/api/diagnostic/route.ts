import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { lead, answers } = body || {};

        if (!process.env.GROQ_API_KEY) {
            return NextResponse.json({ error: 'GROQ_API_KEY missing' }, { status: 500 });
        }

        const prompt = `
Você é um consultor patrimonial da Wenvest. Responda em português BR, direto, com ênfase em ações e riscos reais. A saída deve ser APENAS JSON válido, sem texto fora do JSON.

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
 "summary": "2-3 frases sobre situação atual, lacunas críticas e prioridade de atuação",
 "risks": "3 bullets sobre riscos reais se nada for feito (ex: perdas por concentração, falta de liquidez, ineficiência fiscal)",
 "opportunities": "3 bullets sobre ganhos ao contratar a Wenvest (diversificação BR/US, eficiência fiscal, rebalanceamento assistido)",
 "next_steps": ["passo 1", "passo 2", "passo 3", "passo 4"],
 "cta": "1 frase chamando para falar com a Wenvest agora",
 "swot": {
   "strengths": ["força1","força2","força3"],
   "weaknesses": ["fraqueza1","fraqueza2","fraqueza3"],
   "opportunities_detail": ["oportunidade1","oportunidade2","oportunidade3"],
   "threats": ["ameaça1","ameaça2","ameaça3"]
 }
}
Use verbos de ação e cite BR/US/eficiência fiscal/riscos onde fizer sentido.`;

        const groqResp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                response_format: { type: 'json_object' },
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
            // devolve fallback sem estourar 500
        return NextResponse.json({
            error: 'Groq request failed',
            details: text,
            insights: {
                summary: 'Estrutura parcial identificada; priorizar alocação, risco e liquidez.',
                risks: 'Risco de perdas por falta de diversificação e controles de drawdown/liquidez.',
                opportunities: 'Melhorar alocação BR/US, eficiência fiscal e acompanhamento ativo com a Wenvest.',
                next_steps: [
                    'Rebalancear BR/US e classes para otimizar risco-retorno.',
                    'Implementar limites de risco, liquidez e metas por prazo.',
                    'Revisar custos/impostos e mapear oportunidades globais.'
                ],
                cta: 'Fale com a Wenvest para organizar risco, impostos e crescimento do seu patrimônio.',
                swot: {
                    strengths: ['Diversificação pode ser ampliada', 'Potencial de eficiência fiscal'],
                    weaknesses: ['Controle de risco/liquidez fraco', 'Metas pouco claras'],
                    opportunities_detail: ['Rebalancear BR/US', 'Monitorar drawdown e impostos'],
                    threats: ['Volatilidade sem proteção', 'Impostos erodindo retorno']
                }
            }
        }, { status: 200 });
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
            const match = content.match(/\{[\s\S]*\}/);
            if (match) {
                parsed = JSON.parse(match[0]);
            }
        }

        if (!parsed) {
            return NextResponse.json({
                error: 'Parse failed',
                raw: content,
                insights: {
                    summary: 'Estrutura parcial; precisamos ajustar risco e liquidez.',
                    risks: 'Sem controles claros de risco e liquidez, há risco de perdas e falta de caixa.',
                    opportunities: 'Diversificar BR/US, otimizar impostos e acompanhar metas com a Wenvest.',
                    next_steps: [
                        'Rebalancear BR/US e classes para risco-retorno ótimo.',
                        'Implementar limites de risco, liquidez e metas por prazo.',
                        'Revisar custos/impostos e mapear oportunidades globais.'
                    ],
                    cta: 'Converse com a Wenvest para estruturar risco, liquidez e crescimento do patrimônio.'
                }
            }, { status: 200 });
        }

        return NextResponse.json({ insights: parsed });
    } catch (error: any) {
        console.error('diagnostic error', error);
        return NextResponse.json({
            error: error.message,
            insights: {
                summary: 'Falha ao gerar IA; use recomendações padrão.',
                risks: 'Riscos de diversificação, liquidez e falta de metas claras.',
                opportunities: 'Wenvest ajuda com rebalanceamento, eficiência fiscal e acompanhamento ativo.',
                next_steps: [
                    'Ajustar alocação BR/US e classes.',
                    'Implementar controles de risco, liquidez e metas.',
                    'Revisar custos/impostos e oportunidades globais.'
                ],
                cta: 'Fale com a Wenvest para estruturar seu patrimônio.'
            }
        }, { status: 200 });
    }
}
