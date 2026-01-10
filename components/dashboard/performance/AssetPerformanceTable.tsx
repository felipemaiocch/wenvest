'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const assets = [
    { name: 'Kapitalo K10 Seleção Multimercado FIF CIC RL', value: 449253.83, avg: 17.33, ret: 18.49, res: 75430.50 },
    { name: 'Absolute Atenas Icatu Previdência FIF Cotas FI RF', value: 331502.23, avg: 1.32, ret: 12.14, res: 45200.12 },
    { name: 'SPX Seahawk PLUS Previdenciário Itaú FIF CIC', value: 513088.72, avg: 1.43, ret: 11.99, res: 52100.00 },
    { name: 'LCA ITAÚ PRÉ', value: 1815.78, avg: 45.04, ret: 11.85, res: 215.10 },
    { name: 'CDB DI', value: 26392.80, avg: 88.07, ret: 11.82, res: 2890.30 },
    { name: 'LCA ITAÚ DI', value: 9577.63, avg: 58.32, ret: 11.74, res: 980.50 },
    { name: 'TREND Ibov FIC RF Simples RL', value: 9.01, avg: 1.53, ret: 11.24, res: 1.10 },
    { name: 'CDB - BANCO XP S/A', value: 7332.13, avg: 88.57, ret: 11.19, res: 780.20 },
    { name: 'Valora Prev XP Seguros FIC RF CP RL', value: 617868.20, avg: 1.52, ret: 10.32, res: 55430.80 },
    { name: 'Genoa Capital Cruise Prev FIC FIM', value: 520595.59, avg: 1.50, ret: 7.58, res: 35120.90 },
];

export function AssetPerformanceTable() {

    const formatMoney = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    return (
        <Card className="border border-border/60 shadow-sm">
            <CardHeader className="pb-2 border-b border-border/40 bg-slate-50/50">
                <CardTitle className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                    Rentabilidade por Ativo
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-black text-white">
                        <tr>
                            <th className="px-4 py-3 font-bold">Ativo</th>
                            <th className="px-4 py-3 text-right">Valor Atual</th>
                            <th className="px-4 py-3 text-right">Preço Médio</th>
                            <th className="px-4 py-3 text-right text-emerald-400">Rent. Ajustada</th>
                            <th className="px-4 py-3 text-right text-emerald-400">Resultado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                        {assets.map((asset, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-3 font-medium text-slate-900 line-clamp-1">{asset.name}</td>
                                <td className="px-4 py-3 text-right font-medium text-slate-700">{formatMoney(asset.value)}</td>
                                <td className="px-4 py-3 text-right text-muted-foreground">R$ {asset.avg.toFixed(2)}</td>
                                <td className="px-4 py-3 text-right font-bold text-emerald-600">{asset.ret}%</td>
                                <td className="px-4 py-3 text-right font-bold text-emerald-600">{formatMoney(asset.res)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* Simple Pagination */}
                <div className="flex items-center justify-end p-2 gap-2 border-t border-border/40">
                    <Button variant="ghost" size="icon" className="h-8 w-8" disabled><ChevronLeft size={16} /></Button>
                    <div className="bg-slate-900 text-white text-xs h-6 w-6 flex items-center justify-center rounded-sm">1</div>
                    <div className="text-xs text-slate-500">2</div>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><ChevronRight size={16} /></Button>
                </div>
            </CardContent>
        </Card>
    );
}
