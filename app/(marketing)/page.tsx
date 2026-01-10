import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#0f172a] text-white flex flex-col">
            {/* Navbar */}
            <nav className="p-6 flex items-center justify-between max-w-7xl mx-auto w-full">
                <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
                    Wenvest
                </div>
                <div className="flex gap-4">
                    <Link href="/login">
                        <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/10">
                            Entrar
                        </Button>
                    </Link>
                    <Link href="/login">
                        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium">
                            Começar Agora
                        </Button>
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="max-w-4xl space-y-8 animate-in fade-in zoom-in duration-700">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
                        Gestão de Patrimônio Global
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
                        Seu patrimônio, <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
                            unificado e inteligente.
                        </span>
                    </h1>

                    <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Tenha uma visão 360º dos seus investimentos no Brasil e no exterior.
                        Análises avançadas, consolidação automática e insights em tempo real.
                    </p>

                    <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/login">
                            <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold h-12 px-8 text-lg shadow-lg shadow-emerald-500/20">
                                Acessar Plataforma
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Button size="lg" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white h-12 px-8 text-lg">
                            Conhecer Funcionalidades
                        </Button>
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
