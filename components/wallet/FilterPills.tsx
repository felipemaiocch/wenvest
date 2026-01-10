'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FilterPillsProps {
    currentFilter: string;
    onFilterChange: (filter: string) => void;
}

const filters = [
    { id: 'all', label: 'Tudo' },
    { id: 'stocks-br', label: 'Ações BR' },
    { id: 'stocks-us', label: 'Stocks' },
    { id: 'fii', label: 'FIIs' },
    { id: 'crypto', label: 'Crypto' },
    { id: 'reits', label: 'REITs' },
];

export function FilterPills({ currentFilter, onFilterChange }: FilterPillsProps) {
    return (
        <div className="w-full overflow-x-auto scrollbar-hide py-2">
            <div className="flex gap-2 px-5 w-max">
                {filters.map((filter) => (
                    <Button
                        key={filter.id}
                        variant="outline"
                        size="sm"
                        onClick={() => onFilterChange(filter.id)}
                        className={cn(
                            "rounded-full border-border h-8 transition-all duration-200",
                            currentFilter === filter.id
                                ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                                : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                    >
                        {filter.label}
                    </Button>
                ))}
            </div>
        </div>
    );
}
