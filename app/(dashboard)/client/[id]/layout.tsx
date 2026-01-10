import { ClientHeader } from "@/components/client/ClientHeader";

export default async function ClientLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    // In a real app, fetch client name by ID using params.id
    // For MVP, we mock "Arnaldo Lunardi"
    const clientName = "Arnaldo Lunardi";

    return (
        <div className="flex flex-col animate-in fade-in duration-500">
            <ClientHeader clientId={id} clientName={clientName} />
            {children}
        </div>
    );
}
