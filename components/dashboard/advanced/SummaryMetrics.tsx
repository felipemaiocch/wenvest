'use client';

import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, DollarSign, Wallet, PiggyBank, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryMetricsProps {
    currentValue: number;
    totalVariation: number;
    totalVariationValue?: number;
}

export function SummaryMetrics({ currentValue, totalVariation, totalVariationValue }: SummaryMetricsProps) {
    const isPositive = totalVariation >= 0;

    const metrics = [
        {
            label: "Patrimônio Atual",
            value: currentValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            icon: Wallet,
            color: "text-slate-600",
            bg: "bg-slate-100",
        },
        {
            label: "Variação Total",
            value: `${isPositive ? '+' : ''}${totalVariation.toFixed(2)}%`,
            subValue: totalVariationValue ? totalVariationValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : undefined,
            icon: isPositive ? TrendingUp : ArrowDownRight,
            color: isPositive ? "text-emerald-600" : "text-rose-600",
            bg: isPositive ? "bg-emerald-100" : "bg-rose-100",
            trend: isPositive ? "up" : "down"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric, idx) => (
                <Card key={idx} className="border border-border/60 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-semibold text-muted-foreground uppercase">{metric.label}</span>
                            <div className="text-xl font-bold tracking-tight text-slate-900">{metric.value}</div>
                            {metric.subValue && (
                                <span className={cn(
                                    "text-xs font-medium",
                                    metric.trend === 'up' ? "text-emerald-600" : (metric.trend === 'down' ? "text-rose-600" : "text-muted-foreground")
                                )}>
                                    {metric.subValue}
                                </span>
                            )}
                        </div>
                        <div className={cn("h-10 w-10 rounded-full flex items-center justify-center", metric.bg, metric.color)}>
                            <metric.icon size={20} />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
