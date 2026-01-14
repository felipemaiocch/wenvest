import { getPortfolioPerformance } from "@/actions/portfolioSummary";
import { ProfitabilityChart } from "@/components/dashboard/performance/ProfitabilityChart";
import { Info } from "lucide-react";

export default async function PerformancePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    let performance: any[] = [];
    try {
        performance = await getPortfolioPerformance(id);
    } catch (err) {
        console.error('Performance load error', err);
        performance = [];
    }

    return (
        <div className="flex flex-col gap-8 pb-10 max-w-4xl">

            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-md flex items-center gap-3">
                <Info className="text-amber-500" size={18} />
                <p className="text-xs text-amber-700">
                    Modo "Evolução do Patrimônio". A rentabilidade de mercado será ativada em breve.
                </p>
            </div>

            {/* 1. Main Chart */}
            <section>
                <ProfitabilityChart performance={performance || []} />
            </section>

        </div>
    );
}
