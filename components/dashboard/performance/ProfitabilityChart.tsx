'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    BarChart,
    Bar,
    Legend
} from 'recharts';
import { useMemo } from 'react';

interface PerformancePoint {
    date: string;
    value: number;
    invested: number;
    return: number;
}

interface ProfitabilityChartProps {
    performance: PerformancePoint[];
}

export function ProfitabilityChart({ performance }: ProfitabilityChartProps) {
    const { mainSeries, monthly, yearly } = useMemo(() => {
        if (!performance || performance.length === 0) {
            return { mainSeries: [], monthly: [], yearly: [] };
        }

        const main = performance.map(p => ({
            date: new Date(p.date).toLocaleDateString('pt-BR'),
            invested: Number(p.invested),
            value: Number(p.value),
            variation: Number(p.return)
        }));

        const monthlyMap = new Map<string, { date: string; ret: number }>();
        performance.forEach(p => {
            const d = new Date(p.date);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            monthlyMap.set(key, { date: `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`, ret: p.return });
        });

        const yearlyMap = new Map<string, { date: string; ret: number }>();
        performance.forEach(p => {
            const d = new Date(p.date);
            const key = `${d.getFullYear()}`;
            yearlyMap.set(key, { date: key, ret: p.return });
        });

        return {
            mainSeries: main,
            monthly: Array.from(monthlyMap.values()),
            yearly: Array.from(yearlyMap.values())
        };
    }, [performance]);

    if (mainSeries.length === 0) {
        return (
            <Card className="border border-border/60 shadow-sm h-[400px]">
                <CardHeader className="pb-2 border-b border-border/40 bg-slate-50/50">
                    <CardTitle className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                        Evolução Patrimonial
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-full flex flex-col items-center justify-center text-muted-foreground bg-slate-50/20">
                    <p className="text-sm">Gráfico aparecerá após os primeiros aportes.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border border-border/60 shadow-sm">
            <CardHeader className="pb-4 border-b border-border/40 bg-slate-50/50 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                        Evolução do Patrimônio vs. Investido
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-8 p-4">
                <div className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={mainSeries}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} minTickGap={24} />
                            <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                formatter={(value: number | undefined, name) => {
                                    if (name === 'variation') return [`${(value || 0).toFixed(2)}%`, 'Variação'];
                                    return [`R$ ${(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, name === 'value' ? 'Valor de Mercado' : 'Investido'];
                                }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="invested" name="Investido" stroke="#94a3b8" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="value" name="Valor de Mercado" stroke="#10b981" strokeWidth={3} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border border-border/60 shadow-sm">
                        <CardHeader className="pb-2 border-b border-border/40 bg-slate-50/50">
                            <CardTitle className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                Rentabilidade Mensal
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-[220px] p-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthly}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                        <Tooltip formatter={(v?: number) => [`${(v ?? 0).toFixed(2)}%`, 'Rentabilidade'] as [string, string]} />
                                    <Bar dataKey="ret" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="border border-border/60 shadow-sm">
                        <CardHeader className="pb-2 border-b border-border/40 bg-slate-50/50">
                            <CardTitle className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                Rentabilidade Anual
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-[220px] p-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={yearly}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                                    <Tooltip formatter={(v?: number) => [`${(v ?? 0).toFixed(2)}%`, 'Rentabilidade'] as [string, string]} />
                                    <Bar dataKey="ret" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </CardContent>
        </Card>
    );
}
