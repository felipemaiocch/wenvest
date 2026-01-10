import { AppSidebar } from "@/components/layout/AppSidebar";
import { MobileHeader } from "@/components/layout/MobileHeader";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex flex-col md:flex-row h-dvh w-screen overflow-hidden">
            {/* Desktop Sidebar (Hidden on Mobile) */}
            <div className="hidden md:flex w-64 flex-col h-full shrink-0">
                <AppSidebar />
            </div>

            {/* Mobile Header (Hidden on Desktop) */}
            <MobileHeader />

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide relative bg-[#f3f4f6]">
                <div className="p-4 md:p-8 w-full max-w-7xl mx-auto pb-24 md:pb-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
