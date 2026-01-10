'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import { useMemo } from 'react';

interface DividendsSummaryProps {
    transactions: any[];
}

export function DividendsSummary({ transactions }: DividendsSummaryProps) {
    const { total, data } = useMemo(() => {
        if (!transactions || transactions.length === 0) {
            return { total: 0, data: [] };
        }

        const totalValue = transactions.reduce((acc, t) => acc + (Number(t.total) || 0), 0);

        // Group by Month (YYYY-MM)
        const grouped = transactions.reduce((acc, t) => {
            const dateObj = new Date(t.date);
            const key = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
            const label = `${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`;

            if (!acc[key]) {
                acc[key] = { date: label, value: 0, rawDate: dateObj };
            }
            acc[key].value += Number(t.total);
            return acc;
        }, {} as Record<string, any>);

        const chartData = Object.values(grouped).sort((a: any, b: any) => a.rawDate - b.rawDate);

        return { total: totalValue, data: chartData };
    }, [transactions]);

    return (
        <Card className="border border-border/60 shadow-sm">
            <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Left: Stats */}
                    <div className="flex flex-col gap-6 min-w-[240px]">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-slate-500 uppercase">Histórico de Proventos</h3>
                            <div className="flex gap-2">
                                <Select defaultValue="total">
                                    <SelectTrigger className="h-8 w-24 text-xs">
                                        <SelectValue placeholder="Total" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="total">Total</SelectItem>
                                        <SelectItem value="mensal">Mensal</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <span className="text-xs text-slate-500">Total acumulado</span>
                            <div className="flex items-baseline gap-2">
                                <h2 className="text-4xl font-bold text-slate-900">
                                    {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </h2>
                            </div>
                        </div>

                        <div>
                            <span className="text-xs font-bold text-orange-500 block mb-1">Proventos</span>
                            <div className="h-1.5 w-full bg-orange-100 rounded-full overflow-hidden">
                                <div className="h-full bg-orange-500 w-full rounded-full"></div>
                            </div>
                            <span className="text-[10px] text-orange-600 mt-1 block">
                                {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} (100,00%)
                            </span>
                        </div>
                    </div>

                    {/* Right: Chart */}
                    <div className="flex-1 h-[240px] w-full border-l border-dashed border-border/40 pl-0 md:pl-8">
                        {data.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data} barSize={40}>
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        formatter={(value: any) => [`R$ ${value.toFixed(2)}`, 'Proventos']}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <Bar dataKey="value" fill="#f97316" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground border border-dashed rounded-lg bg-slate-50/50">
                                <p className="text-sm">Nenhum provento registrado</p>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
