'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const data = [
    { year: 2026, months: [0.28, null, null, null, null, null, null, null, null, null, null, null], yearTotal: 0.28, accum: 13.84 },
    { year: 2025, months: [0.91, 1.07, 0.65, 1.45, 1.16, 1.21, 1.09, 1.37, 0.89, 0.69, 1.08, 1.15], yearTotal: 13.52, accum: 13.52 },
];

const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export function MonthlyReturnsTable() {

    const getCellColor = (value: number | null) => {
        if (value === null) return "text-slate-300";
        if (value >= 0) return "text-emerald-600 font-medium";
        return "text-rose-600 font-medium";
    };

    return (
        <Card className="border border-border/60 shadow-sm">
            <CardHeader className="pb-2 border-b border-border/40 bg-slate-50/50">
                <CardTitle className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                    Rentabilidade Histórica
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-100/50 border-b border-border/40">
                        <tr>
                            <th className="px-4 py-3 bg-slate-900 text-white font-bold w-16">Ano</th>
                            {months.map(m => <th key={m} className="px-2 py-3 text-center">{m}</th>)}
                            <th className="px-4 py-3 text-center bg-slate-100 font-bold border-l border-border/40">No Ano</th>
                            <th className="px-4 py-3 text-center bg-slate-100 font-bold">Acum.</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row) => (
                            <tr key={row.year} className="border-b border-border/40 hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-3 font-bold text-slate-900 bg-slate-50">{row.year}</td>
                                {row.months.map((val, idx) => (
                                    <td key={idx} className={cn("px-2 py-3 text-center", getCellColor(val))}>
                                        {val !== null ? `${val}%` : '-'}
                                    </td>
                                ))}
                                <td className="px-4 py-3 text-center font-bold text-slate-900 bg-slate-50 border-l border-border/40">
                                    {row.yearTotal}%
                                </td>
                                <td className="px-4 py-3 text-center font-bold text-slate-900 bg-slate-50/50">
                                    {row.accum}%
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </CardContent>
        </Card>
    );
}
