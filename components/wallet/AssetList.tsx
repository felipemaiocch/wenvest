'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { AssetDetailDrawer } from './AssetDetailDrawer';
import { FilterPills } from './FilterPills';

// Mock Data
const mockAssets = [
    { ticker: 'AAPL', name: 'Apple Inc.', qty: 10, currentPrice: 185.50, avgPrice: 150.00, currency: 'USD', type: 'stocks-us' },
    { ticker: 'PETR4', name: 'Petrobras PN', qty: 200, currentPrice: 38.90, avgPrice: 32.40, currency: 'BRL', type: 'stocks-br' },
    { ticker: 'HGLG11', name: 'CSHG Logística', qty: 15, currentPrice: 162.50, avgPrice: 158.00, currency: 'BRL', type: 'fii' },
    { ticker: 'BTC', name: 'Bitcoin', qty: 0.15, currentPrice: 42000.00, avgPrice: 35000.00, currency: 'USD', type: 'crypto' },
    { ticker: 'MGLU3', name: 'Magalu', qty: 1000, currentPrice: 2.15, avgPrice: 15.00, currency: 'BRL', type: 'stocks-br' },
    { ticker: 'AMZN', name: 'Amazon', qty: 5, currentPrice: 145.20, avgPrice: 130.00, currency: 'USD', type: 'stocks-us' },
] as const;

type Asset = typeof mockAssets[number];

export function AssetList() {
    const [filter, setFilter] = useState('all');
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const filteredAssets = mockAssets.filter(asset => filter === 'all' || asset.type === filter);

    const handleAssetClick = (asset: Asset) => {
        setSelectedAsset(asset);
        setIsDrawerOpen(true);
    };

    const formatCurrency = (val: number, currency: string) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(val);
    };

    return (
        <div className="flex flex-col gap-4 h-full">
            <FilterPills currentFilter={filter} onFilterChange={setFilter} />

            <div className="flex flex-col gap-3 px-5 pb-20">
                {filteredAssets.map((asset) => (
                    <Card
                        key={asset.ticker}
                        className="border-none bg-card/60 active:bg-accent/50 transition-colors shadow-sm cursor-pointer"
                        onClick={() => handleAssetClick(asset)}
                    >
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 bg-muted rounded-full">
                                    <AvatarFallback className="font-bold text-[10px]">{asset.ticker.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="font-bold text-sm text-foreground">{asset.ticker}</span>
                                    <span className="text-xs text-muted-foreground">{asset.qty} un.</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="font-bold text-sm text-foreground">
                                    {formatCurrency(asset.qty * asset.currentPrice, asset.currency)}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {formatCurrency(asset.currentPrice, asset.currency)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <AssetDetailDrawer
                asset={selectedAsset}
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
            />
        </div>
    );
}
