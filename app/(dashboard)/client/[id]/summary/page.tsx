import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, FileText } from 'lucide-react';
import { SummaryMetrics } from '@/components/dashboard/advanced/SummaryMetrics';
import { CompositionSection } from '@/components/dashboard/advanced/CompositionSection';
import { PerformanceIndicators } from '@/components/dashboard/advanced/PerformanceIndicators';
import { RiskReturnScatter } from '@/components/dashboard/advanced/RiskReturnScatter';
import { DrawdownChart } from '@/components/dashboard/advanced/DrawdownChart';
import { CorrelationMatrix } from '@/components/dashboard/advanced/CorrelationMatrix';
import { getPortfolioSummary } from "@/actions/dashboard";

export default async function ClientSummaryPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const summary = await getPortfolioSummary(id);

    // Transform summary assets for composition
    // summary.assets is sorted by value desc
    const assetsForDonut = summary.assets.map((a: any) => ({
        name: a.ticker,
        value: a.currentValue,
        color: '#10b981' // Simplification for MVP
    }));

    // Group by type for specific donut
    const typeMap = new Map<string, number>();
    summary.assets.forEach((a: any) => {
        const current = typeMap.get(a.type) || 0;
        typeMap.set(a.type, current + a.currentValue);
    });

    const classesForDonut = Array.from(typeMap.entries()).map(([name, value]) => ({
        name: name.toUpperCase(),
        value,
        color: '#000'
    }));

    return (
        <div className="flex flex-col gap-8 pb-10">

            {/* 0. Context Actions */}
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Resumo da Carteira</h2>
                <div className="flex gap-2">
                    <Link href={`/client/${id}/transactions`}>
                        <Button variant="outline" className="gap-2">
                            <FileText size={16} />
                            Ver Extrato
                        </Button>
                    </Link>
                    <Link href={`/client/${id}/add`}>
                        <Button className="gap-2 bg-emerald-500 hover:bg-emerald-600">
                            <Plus size={16} />
                            Novo Aporte
                        </Button>
                    </Link>
                </div>
            </div>

            {/* 1. Main Metrics Cards (Net Worth, Variation, etc.) */}
            <section>
                <SummaryMetrics
                    netWorth={summary.netWorth}
                    variation={summary.variation}
                    profit={summary.profit}
                />
            </section>

            {/* 2. Key Performance Indicators */}
            <section>
                <PerformanceIndicators portfolioId={id} />
            </section>

            {/* 3. Portfolio Composition */}
            <section>
                <CompositionSection
                    assetData={assetsForDonut}
                    classData={classesForDonut}
                />
            </section>

            {/* 4. Advanced Risk Analytics */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <RiskReturnScatter portfolioId={id} />
                <DrawdownChart portfolioId={id} />
            </div>

            {/* 5. Correlation Matrix */}
            <section>
                <CorrelationMatrix portfolioId={id} />
            </section>

        </div>
    );
}
