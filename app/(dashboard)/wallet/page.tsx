import { AssetList } from "@/components/wallet/AssetList";

export const dynamic = 'force-dynamic';

export default function WalletPage() {
    return (
        <div className="flex flex-col h-full pt-6">
            <h1 className="text-2xl font-bold px-5 mb-4">Clientes</h1>
            <AssetList />
        </div>
    );
}
