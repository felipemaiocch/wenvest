'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';
import { useMemo } from 'react';

interface Transaction {
    id: string;
    type: string;
    date: string;
    total: number;
}

interface TransactionsChartProps {
    transactions: Transaction[];
}

export function TransactionsChart({ transactions }: TransactionsChartProps) {
    const data = useMemo(() => {
        if (!transactions || transactions.length === 0) return [];

        // 1. Group by Month (YYYY-MM)
        const grouped = transactions.reduce((acc, tx) => {
            const dateObj = new Date(tx.date);
            const key = `${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`; // e.g. "1/2026"

            if (!acc[key]) {
                acc[key] = { date: key, buy: 0, sell: 0, sortDate: dateObj.getTime() };
            }

            if (tx.type === 'BUY') {
                acc[key].buy += Number(tx.total);
            } else if (tx.type === 'SELL') {
                // Display as negative for visual contrast, similar to original design
                acc[key].sell -= Number(tx.total);
            }

            return acc;
        }, {} as Record<string, { date: string, buy: number, sell: number, sortDate: number }>);

        // 2. Convert to array and Sort by Date
        return Object.values(grouped).sort((a, b) => a.sortDate - b.sortDate);
    }, [transactions]);

    if (data.length === 0) {
        return null; // Or show empty state
    }

    return (
        <Card className="border border-border/60 shadow-sm">
            <CardHeader className="pb-2 border-b border-border/40 bg-slate-50/50 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                        Histórico de Movimentações
                    </CardTitle>
                    <Info size={14} className="text-muted-foreground cursor-help" />
                </div>
                {/* Simplified: Removed period selector for MVP, auto-shows all history grouped by month */}
            </CardHeader>
            <CardContent className="h-[300px] p-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(val) => `R$ ${Math.abs(val) / 1000}k`} />
                        <Tooltip
                            formatter={(value: any) => [`R$ ${Math.abs(value).toLocaleString('pt-BR')}`, value > 0 ? 'Compra' : 'Venda']}
                            labelStyle={{ color: '#64748b' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            cursor={{ fill: '#f8fafc' }}
                        />
                        <Legend verticalAlign="top" height={36} iconType="circle" />
                        <Bar dataKey="buy" name="Compra" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        <Bar dataKey="sell" name="Venda" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                </ResponsiveContainer>
                <div className="mt-2 text-[10px] text-muted-foreground text-center">
                    * Valores agrupados mensalmente.
                </div>
            </CardContent>
        </Card>
    );
}
