'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMemo } from 'react';

interface DividendsMatrixProps {
    transactions: any[];
}

export function DividendsMatrix({ transactions }: DividendsMatrixProps) {
    const { matrixData, years, totals } = useMemo(() => {
        if (!transactions || transactions.length === 0) return { matrixData: {}, years: [], totals: {} };

        const yearsSet = new Set<number>();
        const data: Record<number, Record<number, number>> = {};
        const yearTotals: Record<number, number> = {};

        transactions.forEach(t => {
            const date = new Date(t.date);
            const year = date.getFullYear();
            const month = date.getMonth(); // 0-11
            const val = Number(t.total) || 0;

            yearsSet.add(year);

            if (!data[year]) data[year] = {};
            if (!data[year][month]) data[year][month] = 0;

            data[year][month] += val;

            if (!yearTotals[year]) yearTotals[year] = 0;
            yearTotals[year] += val;
        });

        const sortedYears = Array.from(yearsSet).sort((a, b) => b - a); // Descending

        return { matrixData: data, years: sortedYears, totals: yearTotals };
    }, [transactions]);

    const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

    if (years.length === 0) {
        return null; // Don't show if empty
    }

    return (
        <Card className="border border-border/60 shadow-sm">
            <CardHeader className="pb-4 border-b border-border/40 bg-slate-50/50 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                    Proventos ao longo dos anos
                </CardTitle>
                <Select defaultValue="BRL">
                    <SelectTrigger className="h-8 w-28 text-xs bg-white">
                        <SelectValue placeholder="Moeda" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="BRL">Valor (R$)</SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-xs text-center">
                    <thead className="bg-black text-white uppercase font-bold">
                        <tr>
                            <th className="px-2 py-3 text-yellow-500 text-left pl-4">ANO</th>
                            {months.map(m => (
                                <th key={m} className="px-2 py-3">{m}</th>
                            ))}
                            <th className="px-2 py-3 text-yellow-500">TOTAL</th>
                            <th className="px-2 py-3 text-yellow-500 text-right pr-4">MÉDIA</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 font-mono">
                        {years.map(year => {
                            const row = matrixData[year] || {};
                            const total = totals[year] || 0;
                            const avg = total / 12;

                            return (
                                <tr key={year} className="hover:bg-slate-50">
                                    <td className="px-2 py-3 font-bold text-slate-900 text-left pl-4">{year}</td>
                                    {months.map((_, idx) => (
                                        <td key={idx} className="px-2 py-3 text-slate-600">
                                            {row[idx] ? `R$ ${row[idx].toFixed(2)}` : '-'}
                                        </td>
                                    ))}
                                    <td className="px-2 py-3 font-bold text-slate-900">R$ {total.toFixed(2)}</td>
                                    <td className="px-2 py-3 font-bold text-slate-900 text-right pr-4">R$ {avg.toFixed(2)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </CardContent>
        </Card>
    );
}
