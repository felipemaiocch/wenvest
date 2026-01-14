'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, ActivitySquare, Loader2 } from "lucide-react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';
import { calculateRiskReturn } from '@/actions/analytics';

interface RiskReturnScatterProps {
    portfolioId: string;
}

export function RiskReturnScatter({ portfolioId }: RiskReturnScatterProps) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        calculateRiskReturn(portfolioId)
            .then(result => {
                setData(result);
                setLoading(false);
            })
            .catch(() => {
                setData(null);
                setLoading(false);
            });
    }, [portfolioId]);

    if (loading) {
        return (
            <Card className="border border-border/60 shadow-sm h-full">
                <CardContent className="h-[280px] flex items-center justify-center">
                    <Loader2 className="animate-spin text-muted-foreground" size={24} />
                </CardContent>
            </Card>
        );
    }

    // Empty State
    if (!data) {
        return (
            <Card className="border border-border/60 shadow-sm h-full">
                <CardHeader className="pb-2 border-b border-border/40 bg-slate-50/50">
                    <CardTitle className="text-sm font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                        <ActivitySquare size={16} className="text-slate-500" />
                        Risco x Retorno
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-[280px] flex flex-col items-center justify-center p-6 text-center gap-4">
                    <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center">
                        <ActivitySquare className="text-slate-400" size={32} />
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-slate-700">Análise Estatística Pendente</h4>
                        <p className="text-xs text-muted-foreground max-w-xs">
                            A análise de risco vs retorno requer série temporal de preços para calcular volatilidade e correlação.
                        </p>
                    </div>
                    <div className="mt-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-md">
                        <p className="text-[10px] text-blue-700 flex items-center gap-1">
                            <Info size={12} />
                            Ativação automática ao popular histórico
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Real Chart
    return (
        <Card className="border border-border/60 shadow-sm h-full">
            <CardHeader className="pb-2 border-b border-border/40 bg-slate-50/50">
                <CardTitle className="text-sm font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                    <ActivitySquare size={16} className="text-emerald-500" />
                    Risco x Retorno
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                <ResponsiveContainer width="100%" height={220}>
                    <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                            type="number"
                            dataKey="risk"
                            name="Risco"
                            unit="%"
                            tick={{ fontSize: 10 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            type="number"
                            dataKey="return"
                            name="Retorno"
                            unit="%"
                            tick={{ fontSize: 10 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <ZAxis range={[100, 400]} />
                        <Tooltip
                            cursor={{ strokeDasharray: '3 3' }}
                            formatter={(value: number | undefined) => value ? `${value.toFixed(1)}%` : '0%'}
                            labelFormatter={(label) => data.find((d: any) => d.risk === label)?.ticker || ''}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Scatter name="Ativos" data={data} fill="#10b981" />
                    </ScatterChart>
                </ResponsiveContainer>
                <div className="mt-2 text-[10px] text-muted-foreground text-center">
                    Cada ponto representa um ativo da carteira
                </div>
            </CardContent>
        </Card>
    );
}
