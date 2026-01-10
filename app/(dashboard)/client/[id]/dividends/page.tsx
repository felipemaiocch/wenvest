import { getTransactions } from "@/actions/transaction";
import { TransactionsTable } from "@/components/dashboard/transactions/TransactionsTable";
import { DividendsSummary } from "@/components/dashboard/dividends/DividendsSummary";
import { DividendsMatrix } from "@/components/dashboard/dividends/DividendsMatrix";
import { DividendsByAsset } from "@/components/dashboard/dividends/DividendsByAsset";
import { Info } from "lucide-react";

export default async function DividendsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const allTransactions = await getTransactions(id);
    const dividends = allTransactions?.filter((t: any) => t.type === 'DIVIDEND') || [];

    return (
        <div className="flex flex-col gap-8 pb-10">

            {/* Info */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-md flex items-center gap-3">
                <Info className="text-blue-500" size={18} />
                <p className="text-xs text-blue-700">
                    Aqui você verá os proventos (Dividendos/JCP) cadastrados manualmente.
                    Os gráficos aparecerão automaticamente assim que houver dados.
                </p>
            </div>

            {/* 1. History Summary (Chart + Total) */}
            <section>
                <DividendsSummary transactions={dividends} />
            </section>

            {/* 2. Yearly Matrix */}
            <section>
                <DividendsMatrix transactions={dividends} />
            </section>

            {/* 4. Asset Breakdown */}
            <section>
                <DividendsByAsset transactions={dividends} />
            </section>

            {/* Data Grid */}
            <section>
                <div className="flex flex-col gap-4">
                    <h2 className="text-lg font-bold text-slate-800">Histórico Detalhado</h2>
                    <TransactionsTable
                        initialData={dividends}
                        portfolioId={id}
                    />
                </div>
            </section>

        </div>
    );
}
