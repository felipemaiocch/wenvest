'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import jsPDF from 'jspdf';

type Question = {
    id: string;
    area: string;
    title: string;
    text: string;
};

type Option = {
    label: string;
    desc: string;
    score: number;
};

const OPTIONS: Option[] = [
    { label: 'Preciso melhorar', desc: 'Sem processo claro', score: 3 },
    { label: 'Em andamento', desc: 'Alguns pontos cobertos', score: 6 },
    { label: 'Bem estruturado', desc: 'Processo consistente', score: 9 },
];

const QUESTIONS: Question[] = [
    { id: 'alloc', area: 'Alocação', title: 'Diversificação Global', text: 'Como está o balanceamento BR x exterior e classes de ativos?' },
    { id: 'risk', area: 'Risco', title: 'Gestão de Risco', text: 'Você monitora drawdown, correlação e limites por ativo?' },
    { id: 'liquidity', area: 'Liquidez', title: 'Reserva e Liquidez', text: 'Existe reserva de 6-12 meses separada da carteira?' },
    { id: 'goals', area: 'Objetivos', title: 'Planos e Metas', text: 'Carteira mapeada por metas (prazo/valor) e revisões periódicas?' },
    { id: 'tax', area: 'Fiscal', title: 'Eficiência Tributária', text: 'Revisa custos/impostos BR/US com recorrência?' },
];

type Lead = {
    name: string;
    email: string;
    phone: string;
};

type AiInsights = {
    summary?: string;
    risks?: string;
    opportunities?: string;
    next_steps?: string[];
    cta?: string;
};

function drawRadar(doc: any, answers: Record<string, number>) {
    const cx = 150;
    const cy = 125;
    const radius = 38;
    const axes = QUESTIONS;
    const step = (Math.PI * 2) / axes.length;

    // grade concêntrica
    doc.setDrawColor(210);
    doc.setLineWidth(0.2);
    [0.3, 0.6, 1].forEach((r) => {
        doc.circle(cx, cy, radius * r, 'S');
    });

    // eixos + labels
    axes.forEach((axis, idx) => {
        const angle = -Math.PI / 2 + idx * step;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);
        doc.line(cx, cy, x, y);
        const labelX = cx + (radius + 12) * Math.cos(angle);
        const labelY = cy + (radius + 12) * Math.sin(angle);
        doc.setFontSize(8);
        doc.text(axis.area, labelX - 8, labelY);
    });

    // polígono da pontuação
    const points = axes.map((axis, idx) => {
        const score = (answers[axis.id] ?? 0) / 10;
        const angle = -Math.PI / 2 + idx * step;
        return [
            cx + radius * score * Math.cos(angle),
            cy + radius * score * Math.sin(angle),
        ];
    });

    doc.setDrawColor(252, 191, 24);
    doc.setFillColor(252, 191, 24, 0.45);
    doc.setLineWidth(0.9);
    if (typeof (doc as any).polygon === 'function') {
        (doc as any).polygon(points, 'FD');
    } else {
        doc.setFillColor(252, 191, 24);
        doc.setDrawColor(252, 191, 24);
        doc.setLineWidth(0.7);
        doc.lines(
            points.map(([x, y], idx) => {
                const [nx, ny] = points[(idx + 1) % points.length];
                return [nx - x, ny - y];
            }),
            points[0][0],
            points[0][1],
            [1, 1],
            'FD',
            true
        );
    }
}

function bucketRecommendation(score: number) {
    if (score >= 8) return 'Você já tem uma base sólida; podemos adicionar eficiência fiscal e oportunidades globais.';
    if (score >= 5) return 'Há estrutura parcial; podemos ajustar riscos, diversificação e liquidez para robustez.';
    return 'O momento pede organização urgente: priorizar liquidez, metas claras e controles de risco.';
}

function generatePdf(answers: Record<string, number>, lead: Lead, ai?: AiInsights) {
    const doc = new jsPDF();
    // Header block
    doc.setFillColor(12, 20, 40);
    doc.rect(0, 0, 210, 36, 'F');
    doc.setTextColor(252, 191, 24);
    doc.setFontSize(18);
    doc.text('Diagnóstico Patrimonial - Wenvest', 20, 18);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text(`Nome: ${lead.name || '---'}`, 20, 26);
    doc.text(`Email: ${lead.email || '---'}`, 80, 26);
    doc.text(`Telefone: ${lead.phone || '---'}`, 150, 26);

    // Cards de resultados + radar lado a lado
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text('Resumo de Maturidade', 20, 48);
    let y = 56;
    const avg = Object.values(answers).reduce((a, b) => a + b, 0) / QUESTIONS.length;
    QUESTIONS.forEach((q) => {
        const score = answers[q.id] ?? 0;
        doc.text(`• ${q.area}: ${score}/10`, 24, y);
        y += 7;
    });
    doc.text(`Média geral: ${avg.toFixed(1)}/10`, 24, y + 4);

    // Radar visual ao lado (centralizado verticalmente)
    drawRadar(doc, answers);

    // Bloco recomendações + próximos passos + CTA em um cartão maior
    let recY = 150;
    doc.setFontSize(13);
    doc.setTextColor(12, 20, 40);
    doc.setFillColor(245, 249, 255);
    doc.roundedRect(16, recY - 12, 178, 70, 3, 3, 'F');
    doc.text('Recomendações (IA + consultor):', 20, recY);
    recY += 8;
    doc.setTextColor(33, 37, 41);
    doc.setFontSize(11);
    if (ai && (ai.summary || ai.risks || ai.opportunities)) {
        if (ai.summary) { doc.text(`Resumo: ${ai.summary}`, 20, recY); recY += 7; }
        if (ai.risks) { doc.text(`Riscos: ${ai.risks}`, 20, recY); recY += 7; }
        if (ai.opportunities) { doc.text(`Oportunidades: ${ai.opportunities}`, 20, recY); recY += 7; }
    } else {
        QUESTIONS.forEach((q) => {
            const score = answers[q.id] ?? 0;
            const text = bucketRecommendation(score);
            doc.text(`• ${q.area}: ${text}`, 20, recY);
            recY += 7;
        });
    }

    recY += 8;
    doc.setFontSize(13);
    doc.setTextColor(12, 20, 40);
    doc.text('Próximos passos com a Wenvest:', 20, recY);
    recY += 7;
    doc.setFontSize(11);
    const steps = ai?.next_steps && ai.next_steps.length ? ai.next_steps : [
        'Ajustar alocação BR/US e classes para risco-retorno ótimo.',
        'Implementar controle de drawdown, liquidez e metas por prazo.',
        'Revisar custos/impostos e mapear oportunidades globais.',
    ];
    steps.forEach((s, idx) => {
        doc.text(`${idx + 1}) ${s}`, 20, recY);
        recY += 6;
    });

    recY += 8;
    doc.setFontSize(12);
    doc.setTextColor(12, 20, 40);
    doc.text('Por que falar com a Wenvest agora:', 20, recY);
    recY += 7;
    doc.setFontSize(11);
    const ctaText = ai?.cta || 'Unificamos BR/US, calibramos risco e impostos e entregamos acompanhamento ativo do seu patrimônio.';
    doc.text(`• ${ctaText}`, 20, recY);

    doc.save('diagnostico-wenvest.pdf');
}

export function LeadDiagnostic() {
    const [step, setStep] = useState<number>(0); // 0 = CTA, 1..questions, n+1 = form, done = pdf
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [lead, setLead] = useState<Lead>({ name: '', email: '', phone: '' });
    const [sent, setSent] = useState(false);
    const [aiInsights, setAiInsights] = useState<AiInsights | null>(null);
    const [loadingAi, setLoadingAi] = useState(false);

    const currentQuestion = useMemo(() => QUESTIONS[step - 1], [step]);
    const progress = Math.min((step / (QUESTIONS.length + 1)) * 100, 100);

    const handleAnswer = (value: number) => {
        if (!currentQuestion) return;
        setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
        if (step < QUESTIONS.length) {
            setStep(step + 1);
        } else {
            setStep(QUESTIONS.length + 1); // go to form
        }
    };

    const handleSubmitLead = async () => {
        setLoadingAi(true);
        try {
            let insights: AiInsights | null = null;
            try {
                const resp = await fetch('/api/diagnostic', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ lead, answers }),
                });
                if (resp.ok) {
                    const data = await resp.json();
                    insights = data.insights;
                    setAiInsights(data.insights);
                }
            } catch (err) {
                // ignore, fallback
            }

            // Save lead (best effort)
            fetch('/api/lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lead, answers, ai: insights }),
            }).catch(() => {});

            setSent(true);
            generatePdf(answers, lead, insights || undefined);
        } finally {
            setLoadingAi(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto mt-10">
            <Card className="bg-white/5 border border-white/10 backdrop-blur">
                <CardContent className="p-6 md:p-8 flex flex-col gap-6">
                    {step === 0 && (
                        <div className="flex flex-col items-center gap-4 text-center">
                            <h3 className="text-2xl md:text-3xl font-bold text-white">Diagnóstico Patrimonial</h3>
                            <p className="text-slate-200/80 max-w-2xl">
                                Responda 5 perguntas rápidas e receba um PDF com a análise do seu momento de investimentos.
                            </p>
                            <Button
                                size="lg"
                                className="bg-[#fcbf18] hover:bg-[#e5ad15] text-slate-900 font-semibold h-12 px-8 shadow-lg shadow-[#fcbf18]/30"
                                onClick={() => setStep(1)}
                            >
                                Iniciar diagnóstico
                            </Button>
                        </div>
                    )}

                    {step > 0 && step <= QUESTIONS.length && currentQuestion && (
                        <div className="flex flex-col gap-6">
                            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-[#fcbf18] to-amber-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <div className="text-sm uppercase tracking-wide text-amber-200">{currentQuestion.area}</div>
                            <h3 className="text-3xl md:text-4xl font-bold text-white">{currentQuestion.title}</h3>
                            <p className="text-slate-200/80 text-lg">{currentQuestion.text}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {OPTIONS.map((opt) => (
                                    <button
                                        key={opt.label}
                                        onClick={() => handleAnswer(opt.score)}
                                        className="h-16 rounded-xl border border-white/10 bg-white/5 text-white font-semibold hover:bg-[#fcbf18]/20 hover:border-[#fcbf18]/40 transition-colors text-left px-4"
                                    >
                                        <div className="text-base">{opt.label}</div>
                                        <div className="text-xs text-slate-300/80">{opt.desc}</div>
                                    </button>
                                ))}
                            </div>
                            <div className="flex justify-between text-xs uppercase text-slate-400 tracking-wide">
                                <span>Baixa maturidade</span>
                                <span>Alta maturidade</span>
                            </div>
                        </div>
                    )}

                    {step === QUESTIONS.length + 1 && !sent && (
                        <div className="flex flex-col gap-4">
                            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-[#fcbf18] to-amber-300"
                                    style={{ width: `100%` }}
                                />
                            </div>
                            <h3 className="text-3xl font-bold text-white">Quase lá</h3>
                            <p className="text-slate-200/80">Deixe seu contato para receber o PDF personalizado.</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <Input
                                    placeholder="Nome"
                                    value={lead.name}
                                    onChange={(e) => setLead((prev) => ({ ...prev, name: e.target.value }))}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-400"
                                />
                                <Input
                                    placeholder="Email"
                                    value={lead.email}
                                    onChange={(e) => setLead((prev) => ({ ...prev, email: e.target.value }))}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-400"
                                />
                                <Input
                                    placeholder="Telefone/WhatsApp"
                                    value={lead.phone}
                                    onChange={(e) => setLead((prev) => ({ ...prev, phone: e.target.value }))}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-400"
                                />
                            </div>
                            <Button
                                className="bg-[#fcbf18] hover:bg-[#e5ad15] text-slate-900 font-semibold h-12 px-6 self-start shadow-lg shadow-[#fcbf18]/30"
                                onClick={handleSubmitLead}
                                disabled={loadingAi}
                            >
                                {loadingAi ? 'Gerando com IA...' : 'Gerar PDF e enviar'}
                            </Button>
                        </div>
                    )}

                    {sent && (
                        <div className="flex flex-col items-start gap-3">
                            <div className="text-3xl font-bold text-white">Diagnóstico gerado</div>
                            <p className="text-slate-200/80">
                                PDF baixado. Entraremos em contato para discutir um plano sob medida.
                            </p>
                            <Button
                                className="bg-[#fcbf18] hover:bg-[#e5ad15] text-slate-900 font-semibold px-6 h-11 shadow-lg shadow-[#fcbf18]/30"
                                onClick={() => generatePdf(answers, lead, aiInsights || undefined)}
                            >
                                Baixar novamente
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
