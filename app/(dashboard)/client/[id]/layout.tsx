```
import { ClientHeader } from "@/components/client/ClientHeader";
import { getPortfolios } from "@/actions/portfolio";

export default async function ClientLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    
    // Fetch portfolio to get the real name
    const portfolios = await getPortfolios();
    const portfolio = portfolios.find(p => p.id === id);
    const clientName = portfolio?.name || 'Cliente';

    return (
        <div className="flex flex-col animate-in fade-in duration-500">
            <ClientHeader clientId={id} clientName={clientName} />
            {children}
        </div>
    );
}
