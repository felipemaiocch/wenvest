'use client';

import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import { Home, Wallet, Plus, FileText, User, Settings, LogOut, TrendingUp, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export function AppSidebar({ className }: { className?: string }) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.refresh();
        router.push('/login');
    };

    const isActive = (path: string) => pathname === path;

    // Navigation Items
    const navItems = [
        { label: 'Clientes', icon: Users, href: '/dashboard' },
    ];

    const secondaryItems = [
        { label: 'Perfil', icon: User, href: '/profile' },
        { label: 'Configurações', icon: Settings, href: '/settings' },
    ];

    return (
        <aside className={cn("flex flex-col h-full bg-[#020617] text-slate-300 border-r border-[#1e293b]", className)}>
            {/* Logo Section */}
            <div className="h-16 flex items-center px-6 border-b border-[#1e293b]">
                <div className="flex items-center gap-3 text-white font-bold text-xl tracking-tight">
                    <Image
                        src="/wenvest-logo.png"
                        alt="Wenvest"
                        width={32}
                        height={32}
                        className="object-contain"
                    />
                    <span>Wenvest</span>
                </div>
                GlobalWealth
            </div>
        </div>

            {/* Main Navigation */ }
    <ScrollArea className="flex-1 py-6 px-4">
        <nav className="flex flex-col gap-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 px-2">Principal</div>
            {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                    <Button
                        variant="ghost"
                        className={cn(
                            "w-full justify-start gap-3 font-medium h-10 transition-all duration-200",
                            isActive(item.href)
                                ? "bg-[#fcbf18]/10 text-[#fcbf18] hover:bg-[#fcbf18]/20 hover:text-[#fcbf18] border-l-2 border-[#fcbf18] rounded-l-none"
                                : "hover:bg-[#1e293b]/50 hover:text-white border-l-2 border-transparent"
                        )}
                    >
                        <item.icon size={20} strokeWidth={isActive(item.href) ? 2.5 : 2} />
                        {item.label}
                    </Button>
                </Link>
            ))}

            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-6 mb-2 px-2">Conta</div>
            {secondaryItems.map((item) => (
                <Link key={item.href} href={item.href}>
                    <Button
                        variant="ghost"
                        className={cn(
                            "w-full justify-start gap-3 font-medium h-10 transition-all duration-200",
                            isActive(item.href)
                                ? "bg-[#fcbf18]/10 text-[#fcbf18]"
                                : "hover:bg-[#1e293b]/50 hover:text-white"
                        )}
                    >
                        <item.icon size={20} />
                        {item.label}
                    </Button>
                </Link>
            ))}
        </nav>
    </ScrollArea>

    {/* Footer / Logout */ }
    <div className="p-4 border-t border-[#1e293b]">
        <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
            onClick={handleLogout}
        >
            <LogOut size={20} />
            Sair
        </Button>
    </div>
        </aside >
    );
}
