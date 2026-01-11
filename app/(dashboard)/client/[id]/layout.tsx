import { ClientHeader } from "@/components/client/ClientHeader";

export default async function ClientLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    // Fetch real portfolio name from database
    const portfolio = await getPortfolioSummary(id);
    const clientName = portfolio?.name || 'Cliente';

    return (
        <div className="flex flex-col animate-in fade-in duration-500">
            <ClientHeader clientId={id} clientName={clientName} />
            {children}
        </div>
    );
}
