'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { useMemo } from 'react';

interface ProfitabilityChartProps {
    transactions: any[];
}

export function ProfitabilityChart({ transactions }: ProfitabilityChartProps) {
    const data = useMemo(() => {
        if (!transactions || transactions.length === 0) return [];

        // Sort by date ascending
        const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Create cumulative sum line
        let cumulative = 0;
        const lineData: any[] = [];

        sorted.forEach(t => {
            const val = Number(t.total);
            if (t.type === 'BUY') cumulative += val;
            if (t.type === 'SELL') cumulative -= val;
            // Dividend doesn't change "Invested Capital" strictly speaking, but increases "Cash". 
            // For now let's track "Invested/Cash Flow" so maybe ignore DIVIDEND or treat as cash in?
            // User likely sees "Balance" chart. Let's include DIVIDEND as positive flow if we want "Total Value" proxy, 
            // or exclude if we want "Cost Basis".
            // Let's stick to "Cost Basis" (Money In vs Money Out)

            lineData.push({
                date: new Date(t.date).toLocaleDateString('pt-BR'),
                rawDate: new Date(t.date).getTime(),
                value: cumulative
            });
        });

        // Group by day to avoid jagged multiple points per day? For MVP just push all.
        // Better: just take the last value of the day if multiple txs.

        return lineData;
    }, [transactions]);

    if (data.length === 0) {
        return (
            <Card className="border border-border/60 shadow-sm h-[400px]">
                <CardHeader className="pb-2 border-b border-border/40 bg-slate-50/50">
                    <CardTitle className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                        Evolução Patrimonial (Aportes)
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
                        Evolução do Patrimônio Investido
                    </CardTitle>
                </div>
                <div className="flex gap-2">
                    <Select defaultValue="all">
                        <SelectTrigger className="h-8 text-xs w-28 bg-white">
                            <SelectValue placeholder="Período" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Desde o início</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent className="h-[400px] p-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{
                            top: 10,
                            right: 10,
                            left: 0,
                            bottom: 0,
                        }}
                    >
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 10, fill: '#64748b' }}
                            axisLine={false}
                            tickLine={false}
                            minTickGap={30}
                        />
                        <YAxis
                            tick={{ fontSize: 10, fill: '#64748b' }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            formatter={(value: number | undefined) => value ? [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Investido'] : ['R$ 0,00', 'Investido']}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#10b981"
                            strokeWidth={2}
                            fill="url(#colorValue)"
                        />
                    </AreaChart>
                </ResponsiveContainer>

                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-100 rounded text-[10px] text-yellow-700 text-center">
                    * Este gráfico mostra a evolução dos seus aportes acumulados. A variação de mercado (rentabilidade real) será ativada em breve.
                </div>
            </CardContent>
        </Card>
    );
}
