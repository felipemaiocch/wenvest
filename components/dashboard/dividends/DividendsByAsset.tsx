'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useMemo } from 'react';

interface DividendsByAssetProps {
    transactions: any[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

export function DividendsByAsset({ transactions }: DividendsByAssetProps) {
    const { data } = useMemo(() => {
        if (!transactions || transactions.length === 0) return { data: [] };

        const grouped = transactions.reduce((acc, t) => {
            const ticker = t.ticker || 'Outros';
            if (!acc[ticker]) acc[ticker] = 0;
            acc[ticker] += Number(t.total);
            return acc;
        }, {} as Record<string, number>);

        const chartData = Object.entries(grouped)
            .map(([name, value]) => ({ name, value: value as number }))
            .sort((a, b) => b.value - a.value);

        return { data: chartData };
    }, [transactions]);

    if (data.length === 0) return null;

    return (
        <Card className="border border-border/60 shadow-sm h-full">
            <CardHeader className="pb-4 border-b border-border/40 bg-slate-50/50 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                    Proventos por Ativo
                </CardTitle>
                <div className="flex gap-2">
                    <Select defaultValue="mtd">
                        <SelectTrigger className="h-7 text-[10px] w-auto gap-1 bg-white">
                            <span className="text-slate-500">Filtrar:</span>
                            <SelectValue placeholder="Período" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="mtd">Todo o Período</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

                {/* Donut Chart */}
                <div className="h-[200px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(val: number) => `R$ ${val.toFixed(2)}`} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center text-center pointer-events-none">
                        <span className="text-xs text-muted-foreground w-20">Distribuição por Ativo</span>
                    </div>
                </div>

                {/* Legend/List */}
                <div className="flex flex-col gap-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                    {data.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                <span className="font-semibold text-slate-700">{item.name}</span>
                            </div>
                            <span className="text-slate-500 font-mono">
                                R$ {item.value.toFixed(2)}
                            </span>
                        </div>
                    ))}
                </div>

            </CardContent>
        </Card>
    );
}
