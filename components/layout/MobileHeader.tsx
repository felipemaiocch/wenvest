'use client';

import { Menu, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { AppSidebar } from './AppSidebar';

export function MobileHeader() {
    return (
        <header className="md:hidden flex items-center justify-between px-5 h-16 bg-[#1e293b] text-white border-b border-[#334155] sticky top-0 z-50">
            <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
                <div className="h-6 w-6 bg-emerald-500 rounded-md flex items-center justify-center text-white">
                    <TrendingUp size={16} strokeWidth={3} />
                </div>
                GlobalWealth
            </div>

            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="hover:bg-white/10 text-white">
                        <Menu size={24} />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 border-r-[#334155] bg-[#1e293b] w-72">
                    <AppSidebar className="border-none" />
                </SheetContent>
            </Sheet>
        </header>
    );
}
