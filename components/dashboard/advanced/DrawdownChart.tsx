'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, TrendingDown, Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { calculateDrawdown } from '@/actions/analytics';

interface DrawdownChartProps {
    portfolioId: string;
}

export function DrawdownChart({ portfolioId }: DrawdownChartProps) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        calculateDrawdown(portfolioId)
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
                        <TrendingDown size={16} className="text-slate-500" />
                        Drawdown (Queda Máxima)
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-[280px] flex flex-col items-center justify-center p-6 text-center gap-4">
                    <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center">
                        <TrendingDown className="text-slate-400" size={32} />
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-slate-700">Histórico Necessário</h4>
                        <p className="text-xs text-muted-foreground max-w-xs">
                            O cálculo de drawdown requer pelo menos 12 meses de histórico de preços diários.
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
                    <TrendingDown size={16} className="text-rose-500" />
                    Drawdown Máximo: {data.maxDrawdown}%
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={data.chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip
                            formatter={(value: number | undefined) => value ? [`${value.toFixed(2)}%`, 'Drawdown'] : ['0%', 'Drawdown']}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
                <div className="mt-2 text-xs text-muted-foreground text-center">
                    Pico: {data.peakDate} | Vale: {data.troughDate}
                </div>
            </CardContent>
        </Card>
    );
}
