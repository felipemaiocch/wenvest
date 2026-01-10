'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ProfitabilityHeader() {
    const topAssets = [
        { name: "Kapitalo K10 Seleção Multimercado", return: "18.49%", type: "FIF CIC RL" },
        { name: "Absolute Atenas Icatu Previdência", return: "12.14%", type: "FIF Cotas FI RF" },
        { name: "SPX Seahawk PLUS Previdenciário", return: "11.99%", type: "Itaú FIF CIC" },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Total Performance Card */}
            <Card className="col-span-1 border border-border/60 shadow-sm bg-slate-50/50">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                        Rentabilidade Atual da Carteira
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-2 mt-2">
                        <div className="text-5xl font-bold tracking-tight text-emerald-500">
                            13,84%
                        </div>
                        <span className="text-sm text-muted-foreground font-medium">
                            Acumulada no período
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Top Assets Card */}
            <Card className="col-span-1 lg:col-span-2 border border-border/60 shadow-sm">
                <CardHeader className="pb-2 border-b border-border/40 bg-slate-50/50 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                        Ativos Mais Rentáveis
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="text-xs h-7">Ver todos</Button>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                    {topAssets.map((asset, idx) => (
                        <div key={idx} className="flex flex-col gap-1 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100">
                            <span className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight">
                                {idx + 1}. {asset.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground uppercase">{asset.type}</span>
                            <div className="mt-2 flex items-center gap-1 text-emerald-600 font-bold text-sm">
                                <ArrowUpRight size={14} />
                                {asset.return}
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
