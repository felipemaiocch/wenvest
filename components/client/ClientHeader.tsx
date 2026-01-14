'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface ClientHeaderProps {
    clientId: string;
    clientName: string;
}

export function ClientHeader({ clientId, clientName }: ClientHeaderProps) {
    const pathname = usePathname();
    const router = useRouter();

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
            </div>

            {/* Tabs Row */}
            <div className="border-b border-border/60">
                <nav className="flex gap-6 overflow-x-auto scrollbar-hide -mb-px">
                    {tabs.map((tab) => (
                        <button
                            key={tab.href}
                            onClick={() => router.push(tab.href)}
                            className={cn(
                                "pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap bg-transparent",
                                isActive(tab.href)
                                    ? "border-emerald-500 text-emerald-600"
                                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-slate-300"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
        </div>
    );
}
