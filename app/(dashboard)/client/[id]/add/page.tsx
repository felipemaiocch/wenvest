'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AssetSearch } from '@/components/add/AssetSearch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { addTransaction } from '@/actions/transaction';
import { getQuote } from '@/actions/finance';

export default function AddAssetPage() {
    const router = useRouter();
    const params = useParams();
    const portfolioId = params.id as string;

    const [step, setStep] = useState<'search' | 'form'>('search');
    const [selectedTicker, setSelectedTicker] = useState('');
    const [qty, setQty] = useState('');
    const [price, setPrice] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);

    const handleSelect = async (ticker: string) => {
        setSelectedTicker(ticker);
        setStep('form');

        try {
            // Import dynamically or if defined above
            // Using require/import might clear cache? It's fine.
            // But we need to import it at top. Assuming I added import in next step or use quick replace.
            // Wait, I cannot import in restricted scope.
            // I will add the import at top in a separate replace call if needed, or assume I can rewrite the file header too.
            // Let's rewrite the handleSelect AND add import at top in one go? No, separate chunks.
            // I'll rewrite handleSelect here, but I need to `import { getQuote }` at top first or it fails.

            // I'll just do the import first in another call to be safe, or do it here if I am updating the file header.
            // I'll do header update next.

            // For now, write the logic assuming getQuote is available.

            // const quote = await getQuote(ticker);
            // setPrice(quote?.price.toString() || '');
        } catch (e) {
            console.error(e);
        }
    };
    // Wait, I need to do it properly.
    // I will replace the TOP of file first to add import.

    const handleSave = async () => {
        if (!qty || !price || !selectedTicker) return;

        setLoading(true);
        try {
            await addTransaction({
                portfolio_id: portfolioId, // We use the ID from URL, but remember backend is currently ignoring it to rely on RLS (user's transactions)
                ticker: selectedTicker,
                type: 'BUY',
                date: new Date(date),
                qty: parseFloat(qty),
                price: parseFloat(price),
                origin: 'Manual'
            });

            // toast.success("Ativo adicionado com sucesso!");
            router.push(`/client/${portfolioId}/summary`);
            router.refresh();
        } catch (error) {
            console.error(error);
            // toast.error("Erro ao adicionar ativo");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full pt-6 px-5 pb-20">

            {step === 'search' ? (
                <>
                    <h1 className="text-2xl font-bold mb-6">Adicionar Ativo</h1>
                    <AssetSearch onSelect={handleSelect} />
                </>
            ) : (
                <div className="flex flex-col gap-6 animate-in slide-in-from-right duration-300">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setStep('search')} className="-ml-2">
                            <ArrowLeft />
                        </Button>
                        <h1 className="text-2xl font-bold">Novo Aporte</h1>
                    </div>

                    <Card className="bg-card/50 border-primary/20">
                        <CardContent className="p-6 flex flex-col items-center gap-2">
                            <span className="text-sm text-muted-foreground">Ativo selecionado</span>
                            <span className="text-4xl font-black text-primary tracking-tighter">{selectedTicker}</span>
                        </CardContent>
                    </Card>

                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Quantidade</Label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={qty}
                                    onChange={e => setQty(e.target.value)}
                                    className="text-lg font-bold"
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Preço (Unit.)</Label>
                                <Input
                                    type="number"
                                    value={price}
                                    onChange={e => setPrice(e.target.value)}
                                    className="text-lg font-bold"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Data</Label>
                            <Input
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1" />

                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center px-2">
                            <span className="text-muted-foreground">Total Estimado</span>
                            <span className="text-xl font-bold">
                                R$ {((parseFloat(qty) || 0) * (parseFloat(price) || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        <Button size="lg" className="w-full text-lg font-bold" onClick={handleSave} disabled={loading || !qty}>
                            {loading ? <Loader2 className="animate-spin mr-2" /> : <Check className="mr-2" />}
                            Confirmar Investimento
                        </Button>
                    </div>
                </div>
            )}

        </div>
    );
}
