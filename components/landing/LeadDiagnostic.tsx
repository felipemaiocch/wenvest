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
    swot?: {
        strengths?: string[];
        weaknesses?: string[];
        opportunities_detail?: string[];
        threats?: string[];
    }
};

const fallbackFromAnswers = (answers: Record<string, number>) => {
    const scores = QUESTIONS.map((q) => Number(answers[q.id] ?? 0));
    const avg = scores.reduce((a, b) => a + b, 0) / QUESTIONS.length;
    const weakest = QUESTIONS
        .map((q) => ({ area: q.area, score: Number(answers[q.id] ?? 0) }))
        .sort((a, b) => a.score - b.score)
        .slice(0, 2)
        .map((a) => a.area)
        .join(' e ');
    return {
        summary: `Maturidade média de ${avg.toFixed(1)}/10; principais lacunas em ${weakest || 'diversificação e metas'}.`,
        risks: 'Risco de perdas por concentração, pouca liquidez e ausência de metas claras.',
        opportunities: 'Diversificar BR/US, fortalecer reserva de liquidez e otimizar impostos com apoio da Wenvest.',
    };
};

function generatePdf(answers: Record<string, number>, lead: Lead, ai?: AiInsights) {
    const doc = new jsPDF();
    const primary = { r: 12, g: 20, b: 40 };
    const accent = { r: 252, g: 191, b: 24 };
    const textDark = { r: 33, g: 37, b: 41 };
    const softBg = { r: 245, g: 248, b: 252 };
    const margin = 16;
    let y = 22;

    const ensureSpace = (space: number) => {
        if (y + space > 285) {
            doc.addPage();
            y = 22;
        }
    };

    const wrap = (text: string, x: number, width: number, lineHeight = 5.5) => {
        const lines = doc.splitTextToSize(text, width);
        lines.forEach((line: string) => {
            if (y + lineHeight > 285) {
                doc.addPage();
                y = 22;
            }
            doc.text(line, x, y);
            y += lineHeight;
        });
    };

    const scores = QUESTIONS.map((q) => Number(answers[q.id] ?? 0));
    const scoreAvg = scores.reduce((a, b) => a + b, 0) / QUESTIONS.length;
    const percent = Math.round((scoreAvg / 10) * 100);
    const status =
        percent < 50 ? { label: 'Em risco', color: [220, 53, 69] as [number, number, number] } :
        percent < 75 ? { label: 'Em evolução', color: [240, 171, 0] as [number, number, number] } :
        { label: 'Sólido', color: [34, 197, 94] as [number, number, number] };

    // Header
    doc.setFillColor(primary.r, primary.g, primary.b);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(accent.r, accent.g, accent.b);
    doc.setFontSize(18);
    doc.text('Diagnóstico Patrimonial - Wenvest', margin, 18);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    if (lead.name) {
        doc.text(`Cliente: ${lead.name}`, margin, 26);
    }
    doc.text(new Date().toLocaleDateString('pt-BR'), 210 - margin, 26, { align: 'right' });

    y = 38;

    // Resumo executivo
    ensureSpace(52);
    doc.setFillColor(softBg.r, softBg.g, softBg.b);
    doc.roundedRect(margin, y, 210 - margin * 2, 48, 3, 3, 'F');
    doc.setTextColor(textDark.r, textDark.g, textDark.b);
    doc.setFontSize(13);
    doc.text('Resumo Executivo', margin + 4, y + 10);

    doc.setFontSize(28);
    doc.setTextColor(accent.r, accent.g, accent.b);
    doc.text(`${percent}%`, margin + 4, y + 28);
    doc.setFontSize(11);
    doc.setTextColor(textDark.r, textDark.g, textDark.b);
    doc.text('Índice de maturidade', margin + 4, y + 38);

    // Status badge
    // Status badge (altura maior para não colidir com texto)
    doc.setFillColor(...status.color);
    doc.setTextColor(255, 255, 255);
    doc.roundedRect(margin + 42, y + 20, 46, 10, 2, 2, 'F');
    doc.setFontSize(9.5);
    doc.text(status.label, margin + 65, y + 27, { align: 'center' });
    doc.setTextColor(textDark.r, textDark.g, textDark.b);

    // Mini insight
    const insight = ai?.summary || 'Síntese automática a partir das respostas. Sugerimos uma conversa rápida para aprofundar.';
    doc.setFontSize(11);
    doc.text('Principais achados:', margin + 80, y + 14);
    const oldY = y;
    y = y + 20;
    wrap(insight, margin + 80, 210 - margin * 2 - 80);
    y = Math.max(y + 4, oldY + 52);

    // Pontuação por pilar (barras)
    ensureSpace(60);
    doc.setFontSize(13);
    doc.text('Mapa de maturidade por pilar', margin, y);
    y += 6;
    doc.setFontSize(10);
    QUESTIONS.forEach((q) => {
        ensureSpace(10);
        const score = Number(answers[q.id] ?? 0);
        doc.text(q.area, margin, y);
        doc.setDrawColor(230);
        doc.setFillColor(235, 239, 246);
        const barWidth = 110;
        doc.rect(margin + 32, y - 4.5, barWidth, 7, 'FD');
        const fill = Math.max(3, Math.min(barWidth, (score / 10) * barWidth));
        doc.setFillColor(accent.r, accent.g, accent.b);
        doc.rect(margin + 32, y - 4.5, fill, 7, 'F');
        doc.setTextColor(textDark.r, textDark.g, textDark.b);
        doc.text(`${score}/10`, margin + 32 + barWidth + 6, y);
        y += 8.5;
    });
    y += 4;

    // Análise estratégica
    ensureSpace(40);
    doc.setFontSize(13);
    doc.text('Análise estratégica (IA + consultor)', margin, y);
    y += 6;
    doc.setFontSize(11);
    const fallback = fallbackFromAnswers(answers);
    const summaryTxt = ai?.summary || fallback.summary;
    const risksTxt = ai?.risks || fallback.risks;
    const oppTxt = ai?.opportunities || fallback.opportunities;
    wrap(`Resumo: ${summaryTxt}`, margin, 178);
    y += 1;
    wrap(`Riscos: ${risksTxt}`, margin, 178);
    y += 1;
    wrap(`Oportunidades: ${oppTxt}`, margin, 178);
    y += 3;

    // SWOT
    const sortedAreas = QUESTIONS
        .map((q) => ({ area: q.area, score: answers[q.id] ?? 0 }))
        .sort((a, b) => b.score - a.score);
    const swotData = ai?.swot || {
        strengths: sortedAreas.slice(0, 2).map((a) => `${a.area}: base razoável (${a.score}/10)`),
        weaknesses: sortedAreas.slice(-2).map((a) => `${a.area}: precisa de atenção (${a.score}/10)`),
        opportunities_detail: ['Rebalancear BR/US com governança', 'Organizar liquidez e metas por prazo', 'Otimizar custos e impostos BR/US'],
        threats: ['Volatilidade sem proteção', 'Liquidez curta para emergências', 'Tributação corroendo retorno'],
    };

    ensureSpace(36);
    doc.setFontSize(13);
    doc.text('Matriz SWOT', margin, y);
    y += 6;
    doc.setFontSize(11);
    if (swotData.strengths?.length) { wrap(`Forças: ${swotData.strengths.slice(0, 4).join('; ')}`, margin, 178); y += 1; }
    if (swotData.weaknesses?.length) { wrap(`Fraquezas: ${swotData.weaknesses.slice(0, 4).join('; ')}`, margin, 178); y += 1; }
    if (swotData.opportunities_detail?.length) { wrap(`Oportunidades: ${swotData.opportunities_detail.slice(0, 4).join('; ')}`, margin, 178); y += 1; }
    if (swotData.threats?.length) { wrap(`Ameaças: ${swotData.threats.slice(0, 4).join('; ')}`, margin, 178); y += 2; }

    // Roadmap
    ensureSpace(36);
    doc.setFontSize(13);
    doc.text('Roadmap de ação (90-180 dias)', margin, y);
    y += 6;
    doc.setFontSize(11);
    const steps = ai?.next_steps && ai.next_steps.length ? ai.next_steps : [
        'Rebalancear BR/US e classes de ativo para otimizar risco-retorno.',
        'Implementar controles de drawdown, liquidez e metas por prazo.',
        'Revisar impostos/custos e mapear oportunidades globais.',
        'Definir governança de rebalanceamento e acompanhamento mensal.'
    ];
    steps.forEach((s, idx) => {
        ensureSpace(10);
        wrap(`${idx + 1}) ${s}`, margin, 178);
        y += 1;
    });

    // CTA
    ensureSpace(28);
    doc.setFillColor(primary.r, primary.g, primary.b);
    doc.roundedRect(margin, y, 210 - margin * 2, 24, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    const ctaText = ai?.cta || 'Unificamos BR/US, calibramos risco e impostos e entregamos acompanhamento ativo do seu patrimônio.';
    y += 8;
    wrap(`Por que falar com a Wenvest agora: ${ctaText}`, margin + 4, 210 - margin * 2 - 8, 5.5);

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
        const cleanLead = {
            name: lead.name.trim(),
            email: lead.email.trim(),
            phone: lead.phone.trim(),
        };
        if (!cleanLead.name || !cleanLead.email || !cleanLead.phone) return;
        setLoadingAi(true);
        try {
            let insights: AiInsights | null = null;
            try {
                const resp = await fetch('/api/diagnostic', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ lead: cleanLead, answers }),
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
                body: JSON.stringify({ lead: cleanLead, answers, ai: insights }),
            }).catch(() => {});

            setLead(cleanLead);
            setSent(true);
            generatePdf(answers, cleanLead, insights || undefined);
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
                    disabled={loadingAi || !lead.name.trim() || !lead.email.trim() || !lead.phone.trim()}
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
                                disabled={!lead.name.trim() || !lead.email.trim() || !lead.phone.trim()}
                                onClick={() => {
                                    if (!lead.name.trim() || !lead.email.trim() || !lead.phone.trim()) return;
                                    generatePdf(answers, lead, aiInsights || undefined);
                                }}
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
