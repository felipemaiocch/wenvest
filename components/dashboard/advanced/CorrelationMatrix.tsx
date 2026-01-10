'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Grid3x3, Loader2 } from "lucide-react";
import { calculateCorrelationMatrix } from '@/actions/analytics';

interface CorrelationMatrixProps {
    portfolioId: string;
}

export function CorrelationMatrix({ portfolioId }: CorrelationMatrixProps) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        calculateCorrelationMatrix(portfolioId).then(result => {
            setData(result);
            setLoading(false);
        });
    }, [portfolioId]);

    if (loading) {
        return (
            <Card className="border border-border/60 shadow-sm">
                <CardContent className="min-h-[300px] flex items-center justify-center">
                    <Loader2 className="animate-spin text-muted-foreground" size={24} />
                </CardContent>
            </Card>
        );
    }

    // Empty State
    if (!data) {
        return (
            <Card className="border border-border/60 shadow-sm">
                <CardHeader className="pb-2 border-b border-border/40 bg-slate-50/50">
                    <CardTitle className="text-sm font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                        <Grid3x3 size={16} className="text-slate-500" />
                        Matriz de Correlação
                    </CardTitle>
                </CardHeader>
                <CardContent className="min-h-[300px] flex flex-col items-center justify-center p-8 text-center gap-4">
                    <div className="h-20 w-20 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Grid3x3 className="text-slate-400" size={40} />
                    </div>
                    <div className="space-y-2 max-w-md">
                        <h4 className="text-base font-semibold text-slate-700">Correlação Entre Ativos</h4>
                        <p className="text-xs text-muted-foreground">
                            Esta matriz mostrará como os ativos da carteira se movem em relação uns aos outros,
                            permitindo identificar diversificação real.
                        </p>
                        <p className="text-xs text-slate-500 pt-2">
                            Requer: Histórico de preços diários de todos os ativos por pelo menos 6 meses.
                        </p>
                    </div>
                    <div className="mt-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-md">
                        <p className="text-[10px] text-blue-700 flex items-center gap-1.5">
                            <Info size={12} />
                            Ativação automática ao popular histórico
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Real Matrix
    const getColor = (value: number) => {
        if (value > 0.7) return 'bg-emerald-500 text-white';
        if (value > 0.4) return 'bg-emerald-300 text-slate-900';
        if (value > 0.1) return 'bg-yellow-200 text-slate-900';
        if (value > -0.1) return 'bg-slate-100 text-slate-900';
        if (value > -0.4) return 'bg-rose-200 text-slate-900';
        return 'bg-rose-400 text-white';
    };

    return (
        <Card className="border border-border/60 shadow-sm">
            <CardHeader className="pb-2 border-b border-border/40 bg-slate-50/50">
                <CardTitle className="text-sm font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                    <Grid3x3 size={16} className="text-emerald-500" />
                    Matriz de Correlação
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="p-2"></th>
                                {data.tickers.map((ticker: string) => (
                                    <th key={ticker} className="p-2 text-xs font-bold text-slate-700">
                                        {ticker}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.matrix.map((row: number[], i: number) => (
                                <tr key={i}>
                                    <td className="p-2 text-xs font-bold text-slate-700">
                                        {data.tickers[i]}
                                    </td>
                                    {row.map((value: number, j: number) => (
                                        <td key={j} className="p-1">
                                            <div
                                                className={`w-12 h-12 flex items-center justify-center rounded text-xs font-bold ${getColor(value)}`}
                                            >
                                                {value.toFixed(2)}
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-4 flex items-center justify-center gap-6 text-[10px] text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-emerald-500 rounded"></div>
                        <span>Alta correlação (+)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-slate-100 border rounded"></div>
                        <span>Sem correlação</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-rose-400 rounded"></div>
                        <span>Correlação inversa (-)</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
