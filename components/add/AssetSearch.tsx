'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { searchAssets } from '@/actions/finance';

interface SearchResult {
    ticker: string;
    name: string;
    market: 'US' | 'BR' | 'CRYPTO';
}

interface AssetSearchProps {
    onSelect: (ticker: string) => void;
}

export function AssetSearch({ onSelect }: AssetSearchProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length < 2) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                const data = await searchAssets(query);
                // Type safety check or cast if needed, action returns matching shape
                setResults(data as any);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [query]);

    return (
        <div className="flex flex-col gap-4">
            <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Busque por ativo (ex: Apple, AAPL)..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10 h-12 text-lg bg-card/50 border-primary/20 focus-visible:ring-primary"
                    autoFocus
                />
                {loading && <Loader2 className="absolute right-3 top-3 h-5 w-5 animate-spin text-muted-foreground" />}
            </div>

            <div className="flex flex-col gap-2">
                {results.map((result) => (
                    <Card
                        key={result.ticker}
                        className="cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => onSelect(result.ticker)}
                    >
                        <CardContent className="p-3 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="font-bold text-base">{result.ticker}</span>
                                <span className="text-xs text-muted-foreground">{result.name}</span>
                            </div>
                            <span className="text-xs font-semibold bg-muted px-2 py-1 rounded">
                                {result.market}
                            </span>
                        </CardContent>
                    </Card>
                ))}
                {query.length > 1 && results.length === 0 && (
                    <div className="text-center text-muted-foreground py-4">Nenhum ativo encontrado.</div>
                )}
            </div>
        </div>
    );
}
