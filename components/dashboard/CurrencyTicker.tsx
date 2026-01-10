'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Currency {
    code: string;
    name: string;
    value: number;
    variation: number;
}

const currencies: Currency[] = [
    { code: 'USD', name: 'Dólar', value: 5.15, variation: 0.5 },
    { code: 'EUR', name: 'Euro', value: 5.58, variation: -0.2 },
    { code: 'BTC', name: 'Bitcoin', value: 345000, variation: 1.2 },
    { code: 'IFIX', name: 'Índice FII', value: 3350, variation: 0.1 },
];

export function CurrencyTicker() {
    return (
        <div className="w-full overflow-x-auto scrollbar-hide py-2">
            <div className="flex gap-3 px-4 w-max">
                {currencies.map((currency) => (
                    <Card key={currency.code} className="bg-card/50 backdrop-blur-sm border-border min-w-[120px]">
                        <CardContent className="p-3 flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-muted-foreground">{currency.code}</span>
                                <span className={cn(
                                    "text-[10px] flex items-center gap-0.5",
                                    currency.variation >= 0 ? "text-emerald-500" : "text-rose-500"
                                )}>
                                    {currency.variation >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                    {Math.abs(currency.variation)}%
                                </span>
                            </div>
                            <div className="text-sm font-semibold">
                                R$ {currency.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
