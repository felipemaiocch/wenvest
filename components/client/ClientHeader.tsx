'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Download, Plus } from 'lucide-react';

interface ClientHeaderProps {
    clientId: string;
    clientName: string;
}

export function ClientHeader({ clientId, clientName }: ClientHeaderProps) {
    const pathname = usePathname();

    const tabs = [
        { label: 'Resumo', href: `/client/${clientId}/summary` },
        { label: 'Rentabilidade', href: `/client/${clientId}/performance` },
        { label: 'Proventos', href: `/client/${clientId}/dividends` },
        { label: 'Transações', href: `/client/${clientId}/transactions` },
    ];

    const isActive = (href: string) => pathname === href;

    return (
        <div className="flex flex-col gap-6 mb-6">
            {/* Top Row: Name and Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">{clientName}</h1>
                    <p className="text-sm text-muted-foreground">Carteira Consolidada</p>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2 text-muted-foreground">
                        <Download size={16} />
                        Baixar .PDF
                    </Button>
                    <Button size="sm" className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white">
                        <Plus size={16} />
                        Nova Transação
                    </Button>
                </div>
            </div>

            {/* Tabs Row */}
            <div className="border-b border-border/60">
                <nav className="flex gap-6 overflow-x-auto scrollbar-hide -mb-px">
                    {tabs.map((tab) => (
                        <Link key={tab.href} href={tab.href}>
                            <div
                                className={cn(
                                    "pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                                    isActive(tab.href)
                                        ? "border-emerald-500 text-emerald-600"
                                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-slate-300"
                                )}
                            >
                                {tab.label}
                            </div>
                        </Link>
                    ))}
                </nav>
            </div>
        </div>
    );
}
