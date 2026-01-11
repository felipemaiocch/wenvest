import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#0f172a] text-white flex flex-col">
            {/* Navbar */}
            <nav className="p-6 flex items-center justify-between max-w-7xl mx-auto w-full">
                <div className="bg-slate-900 px-4 py-2 rounded-lg">
                    <Image
                        src="https://www.wenvestadvisor.com.br/assets/images/logo-wenvest-304x96.webp"
                        alt="Wenvest"
                        width={140}
                        height={44}
                        className="object-contain"
                        priority
                    />
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/login">
                        <Button className="bg-[#fcbf18] hover:bg-[#e5ad15] text-slate-900 font-semibold">
                            Começar Agora
                        </Button>
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="max-w-4xl space-y-8 animate-in fade-in zoom-in duration-700">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-[#fcbf18]/10 border border-[#fcbf18]/20 text-[#fcbf18] text-sm font-medium mb-4">
                        Gestão de Patrimônio Global
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
                        Seu patrimônio, <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#fcbf18] to-yellow-300">
                            unificado e inteligente.
                        </span>
                    </h1>

                    <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Tenha uma visão 360º dos seus investimentos no Brasil e no exterior.
                        Análises avançadas, consolidação automática e insights em tempo real.
                    </p>

                    <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/login">
                            <Button size="lg" className="bg-[#fcbf18] hover:bg-[#e5ad15] text-slate-900 font-semibold h-12 px-8 text-lg shadow-lg shadow-[#fcbf18]/20">
                                Acessar Plataforma
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="p-8 text-center text-slate-600 text-sm">
                © 2026 Wenvest. Todos os direitos reservados.
            </footer>
        </div>
    );
}
