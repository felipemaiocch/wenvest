'use client';

import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface Asset {
    ticker: string;
    name: string;
    qty: number;
    currentPrice: number;
    avgPrice: number;
    currency: 'BRL' | 'USD';
    type: string;
}

interface AssetDetailDrawerProps {
    asset: Asset | null;
    isOpen: boolean;
    onClose: () => void;
}

export function AssetDetailDrawer({ asset, isOpen, onClose }: AssetDetailDrawerProps) {
    if (!asset) return null;

    const totalValue = asset.qty * asset.currentPrice;
    const gainLoss = (asset.currentPrice - asset.avgPrice) * asset.qty;
    const gainLossPercent = ((asset.currentPrice - asset.avgPrice) / asset.avgPrice) * 100;

    const isProfit = gainLoss >= 0;

    const formatCurrency = (val: number, currency: string) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(val);
    };

    return (
        <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DrawerContent className="bg-card border-t border-border/50 max-h-[85vh]">
                <div className="mx-auto w-full max-w-sm">
                    <DrawerHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col items-start">
                                <DrawerTitle className="text-2xl font-bold">{asset.ticker}</DrawerTitle>
                                <DrawerDescription>{asset.name}</DrawerDescription>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-medium text-muted-foreground">Valor Atual</div>
                                <div className="text-xl font-bold">{formatCurrency(totalValue, asset.currency)}</div>
                            </div>
                        </div>
                    </DrawerHeader>

                    <div className="p-4 flex flex-col gap-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1 p-3 rounded-lg bg-muted/50">
                                <span className="text-xs text-muted-foreground">Quantidade</span>
                                <span className="font-semibold">{asset.qty}</span>
                            </div>
                            <div className="flex flex-col gap-1 p-3 rounded-lg bg-muted/50">
                                <span className="text-xs text-muted-foreground">Preço Médio</span>
                                <span className="font-semibold">{formatCurrency(asset.avgPrice, asset.currency)}</span>
                            </div>
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Rentabilidade</span>
                            <div className="flex flex-col items-end">
                                <span className={isProfit ? "text-emerald-500 font-bold" : "text-rose-500 font-bold"}>
                                    {isProfit ? '+' : ''}{formatCurrency(gainLoss, asset.currency)}
                                </span>
                                <span className={isProfit ? "text-emerald-500 text-xs" : "text-rose-500 text-xs"}>
                                    {isProfit ? '+' : ''}{gainLossPercent.toFixed(2)}%
                                </span>
                            </div>
                        </div>

                        <Button className="w-full font-semibold" size="lg">
                            Comprar Mais
                        </Button>
                    </div>

                    <DrawerFooter>
                        <DrawerClose asChild>
                            <Button variant="outline">Fechar</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
