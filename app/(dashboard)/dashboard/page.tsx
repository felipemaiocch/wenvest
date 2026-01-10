import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ChevronRight, Folder, Plus } from 'lucide-react';
import { getPortfolios } from '@/actions/portfolio';
import { getPortfolioSummary } from '@/actions/dashboard';
import { CreatePortfolioDialog } from '@/components/dashboard/CreatePortfolioDialog';

export const dynamic = 'force-dynamic';

export default async function PortfolioListPage() {
  const portfolios = await getPortfolios();

  // Fetch summaries for value display using Promise.all
  // Handling potential empty list to avoid Promise.all issue? No, empty array is fine.
  const portfoliosWithSummary = await Promise.all(portfolios.map(async (p: any) => {
    // getPortfolioSummary assumes transactions exist, handled gracefully?
    // It returns default object if no transactions.
    const summary = await getPortfolioSummary(p.id);
    return {
      ...p,
      value: summary.netWorth,
    };
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Meus Clientes</h1>
          <p className="text-sm text-muted-foreground">Gerencie as carteiras dos seus clientes</p>
        </div>
        <CreatePortfolioDialog />
      </div>

      <div className="grid grid-cols-1 gap-3">
        {portfoliosWithSummary.length === 0 ? (
          <div className="text-center py-10 opacity-50 border-2 border-dashed rounded-lg">
            <p className="mb-2">Nenhum cliente encontrado.</p>
            <p className="text-sm">Clique em "Nova Carteira" para começar.</p>
          </div>
        ) : (
          portfoliosWithSummary.map((portfolio: any) => (
            <Link key={portfolio.id} href={`/client/${portfolio.id}/summary`}>
              <Card className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <Folder size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 group-hover:text-primary-foreground/80 transition-colors">{portfolio.name}</span>
                      <span className="text-xs text-muted-foreground">{portfolio.type} • Criado em: {new Date(portfolio.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end hidden md:flex">
                      <span className="font-bold text-slate-900">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(portfolio.value)}
                      </span>
                      <span className="text-xs text-muted-foreground">Patrimônio</span>
                    </div>
                    <Button variant="ghost" size="icon" className="text-muted-foreground group-hover:text-primary">
                      <ChevronRight size={20} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
