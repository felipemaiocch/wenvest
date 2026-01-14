'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { searchAssetUnified } from '@/actions/cvmApi';

interface SearchResult {
    symbol: string;
    name: string;
    type: string;
}

interface AssetSearchProps {
    onSelect: (ticker: string) => void;
}

export function AssetSearch({ onSelect }: AssetSearchProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!query || query.length < 2) {
            setResults([]);
            setLoading(false);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const found = await searchAssetUnified(query);
                setResults(found || []);
            } catch (error) {
                console.error('Search error:', error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [query]);

    return (
        <div className="flex flex-col gap-4">
            <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Buscar por ticker, nome ou CNPJ (ex: WEGE3, AAPL, 52.239.457/0001-57)"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10 bg-card/50 border-primary/20 focus-visible:ring-primary"
                    autoFocus
                />
                {loading && <Loader2 className="absolute right-3 top-3 h-5 w-5 animate-spin text-muted-foreground" />}
            </div>

            <div className="flex flex-col gap-2">
                {results.map((result) => (
                    <Card
                        key={result.symbol}
                        className="cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => onSelect(result.symbol)}
                    >
                        <CardContent className="p-3 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="font-bold text-base">{result.symbol}</span>
                                <span className="text-xs text-muted-foreground">{result.name}</span>
                            </div>
                            <span className="text-xs font-semibold bg-muted px-2 py-1 rounded">
                                {result.type}
                            </span>
                        </CardContent>
                    </Card>
                ))}
                {query.length > 1 && results.length === 0 && !loading && (
                    <div className="text-center text-muted-foreground py-4">Nenhum ativo encontrado.</div>
                )}
            </div>
        </div>
    );
}
