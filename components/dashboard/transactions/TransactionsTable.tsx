'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Filter, Download, Trash2, Edit2, Eye, Plus } from "lucide-react";
import { deleteTransaction } from "@/actions/transaction"; // We will wire this fully next
import { useState } from "react";
import dayjs from "dayjs";

type Transaction = {
    id: string;
    ticker: string;
    type: string;
    date: string; // ISO string from DB
    qty: number;
    price: number;
    total: number;
    origin: string;
    // other fields..
}

export function TransactionsTable({ initialData, portfolioId }: { initialData: any[], portfolioId: string }) {
    const [data, setData] = useState(initialData);

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza?")) return;
        try {
            await deleteTransaction(id);
            // Optimistic update or wait for revalidate
            // Since revalidatePath is in action, this component will re-render if it was SC or we refresh
            // For Client Component receiving props, router.refresh() is needed usually
            window.location.reload(); // Simple refresh for MVP
        } catch (e) {
            alert("Erro ao excluir");
        }
    }

    return (
        <Card className="border border-border/60 shadow-sm">
            <CardHeader className="pb-4 border-b border-border/40 bg-slate-50/50 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                        Todas as transações ({data.length})
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        {/* Add Button logic could be here or global header */}
                    </div>
                </div>

                {/* ... Filters omitted for brevity, keeping existing UI structure ... */}
                <div className="flex flex-col md:flex-row gap-2">
                    <Button variant="secondary" size="sm" className="text-xs text-muted-foreground w-full md:w-auto justify-start bg-slate-200/50" disabled>
                        <Trash2 size={14} className="mr-2" />
                        Excluir selecionadas
                    </Button>
                    <div className="flex items-center gap-2 w-full md:w-auto ml-auto">
                        <Button variant="outline" size="sm" className="gap-2 bg-white">
                            <Filter size={14} />
                            Filtrar
                        </Button>
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Procure por ativo"
                                className="pl-8 bg-white h-9 text-xs"
                            />
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-xs text-left">
                    <thead className="text-[10px] text-yellow-500 uppercase bg-black font-bold">
                        <tr>
                            <th className="px-4 py-3 w-8">
                                <Checkbox className="border-slate-500 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500" />
                            </th>
                            <th className="px-4 py-3">Ativo</th>
                            <th className="px-4 py-3">Tipo</th>
                            <th className="px-4 py-3">Data</th>
                            <th className="px-4 py-3 text-right">Qtde.</th>
                            <th className="px-4 py-3 text-right">Valor Unit.</th>
                            <th className="px-4 py-3 text-right">Valor Total</th>
                            <th className="px-4 py-3">Origem</th>
                            <th className="px-4 py-3 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                        {data.map((tx) => (
                            <tr key={tx.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-4 py-3">
                                    <Checkbox className="border-slate-300" />
                                </td>
                                <td className="px-4 py-3 font-medium text-slate-900">{tx.ticker}</td>
                                <td className="px-4 py-3 text-slate-500">
                                    <span className={tx.type === 'BUY' ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>
                                        {tx.type}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-slate-600 font-medium">{dayjs(tx.date).format('DD/MM/YYYY')}</td>
                                <td className="px-4 py-3 text-right font-medium text-slate-600">
                                    {Number(tx.qty).toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-right text-slate-600">
                                    R$ {Number(tx.price).toFixed(2)}
                                </td>
                                <td className="px-4 py-3 text-right font-bold text-slate-900">
                                    R$ {Number(tx.total).toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-slate-500">{tx.origin}</td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-slate-400 hover:text-rose-600"
                                            onClick={() => handleDelete(tx.id)}
                                        >
                                            <Trash2 size={12} />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr>
                                <td colSpan={9} className="p-8 text-center text-muted-foreground">
                                    Nenhuma transação encontrada. Adicione uma nova transação acima.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </CardContent>
        </Card>
    );
}
