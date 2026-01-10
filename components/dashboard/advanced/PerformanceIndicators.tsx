'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, BarChart3, Loader2 } from "lucide-react";
import { calculatePortfolioMetrics } from '@/actions/analytics';

interface PerformanceIndicatorsProps {
    portfolioId: string;
}

export function PerformanceIndicators({ portfolioId }: PerformanceIndicatorsProps) {
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        calculatePortfolioMetrics(portfolioId).then(data => {
            setMetrics(data);
            setLoading(false);
        });
    }, [portfolioId]);

    // Estado de Loading
    if (loading) {
        return (
            <Card className="border border-border/60 shadow-sm">
                <CardContent className="min-h-[120px] flex items-center justify-center">
                    <Loader2 className="animate-spin text-muted-foreground" size={24} />
                </CardContent>
            </Card>
        );
    }

    // Estado Vazio (sem histórico)
    if (!metrics) {
        const placeholders = [
            { label: "Sharpe Ratio", description: "Retorno ajustado ao risco" },
            { label: "Beta", description: "Correlação com mercado" },
            { label: "Volatilidade", description: "Risco anualizado" },
            { label: "Sortino Ratio", description: "Downside risk" }
        ];

        return (
            <Card className="border border-border/60 shadow-sm">
                <CardHeader className="pb-2 border-b border-border/40 bg-slate-50/50 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                        <BarChart3 size={16} className="text-slate-500" />
                        Indicadores de Performance
                    </CardTitle>
                    <div className="px-2 py-1 bg-amber-50 border border-amber-200 rounded">
                        <p className="text-[10px] text-amber-700 flex items-center gap-1">
                            <Info size={10} />
                            Aguardando histórico
                        </p>
                    </div>
                </CardHeader>
                <CardContent className="p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {placeholders.map((indicator, idx) => (
                            <div
                                key={idx}
                                className="p-3 border border-dashed border-slate-200 rounded-lg bg-slate-50/50 flex flex-col items-center justify-center text-center gap-1 min-h-[80px]"
                            >
                                <span className="text-xs font-semibold text-slate-600">{indicator.label}</span>
                                <span className="text-2xl font-bold text-slate-300">--</span>
                                <span className="text-[9px] text-muted-foreground">{indicator.description}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground text-center mt-3 px-4">
                        Estes indicadores serão calculados automaticamente após popular o histórico de preços.
                    </p>
                </CardContent>
            </Card>
        );
    }

    // Estado Real (com dados!)
    return (
        <Card className="border border-border/60 shadow-sm">
            <CardHeader className="pb-2 border-b border-border/40 bg-slate-50/50">
                <CardTitle className="text-sm font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                    <BarChart3 size={16} className="text-slate-500" />
                    Indicadores de Performance
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 border border-slate-200 rounded-lg bg-white">
                        <span className="text-xs text-muted-foreground block mb-1">Sharpe Ratio</span>
                        <p className="text-3xl font-bold text-emerald-600">{metrics.sharpe.toFixed(2)}</p>
                        <span className="text-[10px] text-muted-foreground">Retorno ajustado</span>
                    </div>
                    <div className="p-4 border border-slate-200 rounded-lg bg-white">
                        <span className="text-xs text-muted-foreground block mb-1">Beta</span>
                        <p className="text-3xl font-bold text-blue-600">{metrics.beta.toFixed(2)}</p>
                        <span className="text-[10px] text-muted-foreground">vs. Mercado</span>
                    </div>
                    <div className="p-4 border border-slate-200 rounded-lg bg-white">
                        <span className="text-xs text-muted-foreground block mb-1">Volatilidade</span>
                        <p className="text-3xl font-bold text-amber-600">{metrics.volatility.toFixed(1)}%</p>
                        <span className="text-[10px] text-muted-foreground">Anualizada</span>
                    </div>
                    <div className="p-4 border border-slate-200 rounded-lg bg-white">
                        <span className="text-xs text-muted-foreground block mb-1">Sortino</span>
                        <p className="text-3xl font-bold text-purple-600">{metrics.sortino.toFixed(2)}</p>
                        <span className="text-[10px] text-muted-foreground">Downside risk</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
