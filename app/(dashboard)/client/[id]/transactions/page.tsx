import { TransactionsTable } from "@/components/dashboard/transactions/TransactionsTable";
import { TransactionsChart } from "@/components/dashboard/transactions/TransactionsChart";
import { getTransactions } from "@/actions/transaction";

export default async function TransactionsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const transactions = await getTransactions(id);

    return (
        <div className="flex flex-col gap-8 pb-10">
            {/* 1. History Chart */}
            <section>
                <TransactionsChart transactions={transactions || []} />
            </section>

            {/* 2. Main Data Grid */}
            <section>
                <TransactionsTable
                    initialData={transactions || []}
                    portfolioId={id}
                />
            </section>
        </div>
    );
}
