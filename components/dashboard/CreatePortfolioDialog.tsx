'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Loader2 } from 'lucide-react';
import { createPortfolio } from '@/actions/portfolio';
import { toast } from 'sonner';

export function CreatePortfolioDialog() {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [type, setType] = useState('Pessoal');
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!name) return;
        setLoading(true);
        try {
            await createPortfolio(name, type);
            // toast.success("Carteira criada com sucesso!");
            setOpen(false);
            setName('');
        } catch (error) {
            console.error(error);
            // toast.error("Erro ao criar carteira");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-slate-900 gap-2 font-bold">
                    <Plus size={18} />
                    Nova Carteira
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Nova Carteira de Cliente</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nome do Cliente / Carteira</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Ex: Ana Silva - Pessoal"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="type">Tipo</Label>
                        <Input
                            id="type"
                            value={type}
                            onChange={e => setType(e.target.value)}
                            placeholder="Ex: Pessoal, Holding, Offshore"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button onClick={handleCreate} disabled={loading} className="bg-primary text-slate-900">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Criar Carteira
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
