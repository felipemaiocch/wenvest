'use client';

import { useState } from 'react';
import { Eye, EyeOff, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function NetWorthCard() {
    const [isVisible, setIsVisible] = useState(true);

    // Mock data - replace with specific hook later
    const totalBalance = 125430.50;
    const variation = 1250.00;
    const variationPercent = 1.01;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    return (
        <Card className="border border-border/40 bg-card shadow-sm overflow-hidden relative">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Patrimônio Total
                </CardTitle>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    onClick={() => setIsVisible(!isVisible)}
                >
                    {isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                </Button>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-2">
                    <div className="text-4xl font-bold tracking-tight text-foreground">
                        {isVisible ? formatCurrency(totalBalance) : '••••••'}
                    </div>

                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "flex items-center gap-1 text-sm font-bold px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-500",
                            variation < 0 && "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-500"
                        )}>
                            <TrendingUp size={16} />
                            {variation > 0 ? '+' : ''}{variationPercent}%
                        </div>
                        <span className="text-sm text-muted-foreground font-medium">
                            {isVisible ? `${variation > 0 ? '+' : ''}${formatCurrency(variation)} hoje` : '••••'}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
