'use client';

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { AppSidebar } from './AppSidebar';
import Image from 'next/image';

export function MobileHeader() {
    return (
        <header className="md:hidden sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center px-4 gap-4">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-64">
                        <AppSidebar />
                    </SheetContent>
                </Sheet>
                <div className="bg-slate-900 px-3 py-1.5 rounded-lg">
                    <Image
                        src="https://www.wenvestadvisor.com.br/assets/images/logo-wenvest-304x96.webp"
                        alt="Wenvest"
                        width={100}
                        height={32}
                        className="object-contain"
                        priority
                    />
                </div>
            </div>
        </header>
    );
}
