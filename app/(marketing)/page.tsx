import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { TechLines } from "@/components/landing/TechLines";
import { LeadDiagnostic } from "@/components/landing/LeadDiagnostic";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#0a0f1f] text-white flex flex-col relative overflow-hidden">
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(252,191,24,0.12),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(37,99,235,0.12),transparent_35%),linear-gradient(135deg,#0c1428,#0a0f1f_45%,#0b1325)]" />
                <TechLines className="absolute inset-0 opacity-70 mix-blend-screen" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0f1f]/40 to-[#0a0f1f]" />
            </div>

            {/* Navbar */}
            <nav className="relative z-10 p-6 flex items-center justify-between max-w-7xl mx-auto w-full">
                <div className="bg-slate-900/60 px-4 py-2 rounded-lg border border-white/5 backdrop-blur">
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
                        <Button className="bg-[#fcbf18] hover:bg-[#e5ad15] text-slate-900 font-semibold shadow-lg shadow-[#fcbf18]/30">
                            Começar Agora
                        </Button>
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="max-w-4xl space-y-8 animate-in fade-in zoom-in duration-700">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#fcbf18] text-sm font-medium mb-4 shadow-lg shadow-[#fcbf18]/15">
                        Inteligência em gestão de patrimônio global
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight drop-shadow-xl">
                        Seu patrimônio, <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#fcbf18] via-amber-200 to-white">
                            unificado, modelado e vivo.
                        </span>
                    </h1>

                    <p className="text-xl text-slate-200/80 max-w-2xl mx-auto leading-relaxed">
                        Consolide ativos onshore e offshore, acompanhe risco x retorno em tempo real e entregue visão 360º para seus clientes.
                    </p>

                    <div className="pt-6" />
                </div>
            </main>

            <section className="relative z-10 pb-16 px-4 -mt-16 md:-mt-24">
                <LeadDiagnostic />
            </section>

            {/* Footer */}
            <footer className="relative z-10 p-8 text-center text-slate-400 text-sm">
                © 2026 Wenvest. Todos os direitos reservados.
            </footer>
        </div>
    );
}
