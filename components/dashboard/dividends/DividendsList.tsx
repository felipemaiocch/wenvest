'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, Search, Calendar, CheckCircle2, Clock, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const dividends = [
    {
        asset: 'BRST3',
        type: 'JRS CAP PROPRIO',
        status: 'Pago',
        dateCom: '06/01/2025',
        paymentDate: '13/05/2025',
        qty: 7000,
        value: 0.041095,
        totalGross: 287.67,
        totalNet: 244.52
    },
];

export function DividendsList() {

    return (
        <div className="flex flex-col gap-6">
            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-blue-50 border-blue-100 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center">
                            <Calendar size={18} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-blue-700 uppercase">Provisionado</span>
                            <span className="text-lg font-bold text-slate-900">R$ 0,00</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-amber-50 border-amber-100 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center">
                            <Clock size={18} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-amber-700 uppercase">Aguardando data com</span>
                            <span className="text-lg font-bold text-slate-900">R$ 0,00</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-emerald-50 border-emerald-100 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-emerald-200 text-emerald-700 flex items-center justify-center">
                            <CheckCircle2 size={18} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-emerald-700 uppercase">Pagos</span>
                            <span className="text-lg font-bold text-slate-900">R$ 244,52</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters & Table */}
            <Card className="border border-border/60 shadow-sm">
                <CardHeader className="pb-4 border-b border-border/40 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <CardTitle className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                        Proventos
                    </CardTitle>
                    <div className="flex items-center gap-2 w-full md:w-auto">
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
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-white uppercase bg-black">
                            <tr>
                                <th className="px-4 py-3 font-bold text-yellow-500">Ativo</th>
                                <th className="px-4 py-3 font-bold text-yellow-500">Tipo</th>
                                <th className="px-4 py-3 font-bold text-yellow-500">Status</th>
                                <th className="px-4 py-3 font-bold text-yellow-500">Data com</th>
                                <th className="px-4 py-3 font-bold text-yellow-500">Pagamento</th>
                                <th className="px-4 py-3 font-bold text-yellow-500 text-right">Qtde.</th>
                                <th className="px-4 py-3 font-bold text-yellow-500 text-right">Valor</th>
                                <th className="px-4 py-3 font-bold text-yellow-500 text-right">Total Bruto</th>
                                <th className="px-4 py-3 font-bold text-yellow-500 text-right">Total Líquido</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {dividends.map((div, idx) => (
                                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3 font-bold text-slate-900">{div.asset}</td>
                                    <td className="px-4 py-3 text-xs text-muted-foreground uppercase">{div.type}</td>
                                    <td className="px-4 py-3">
                                        <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm gap-1">
                                            <CheckCircle2 size={10} />
                                            {div.status}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-slate-600">{div.dateCom}</td>
                                    <td className="px-4 py-3 text-xs text-slate-600">{div.paymentDate}</td>
                                    <td className="px-4 py-3 text-right text-xs text-slate-600">{div.qty.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right text-xs text-slate-600">R$ {div.value.toFixed(6)}</td>
                                    <td className="px-4 py-3 text-right text-xs font-medium text-slate-500">R$ {div.totalGross.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-right text-sm font-bold text-slate-900">R$ {div.totalNet.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="p-4 border-t border-border/40 flex items-center justify-center text-xs text-muted-foreground bg-slate-50/30">
                        Mostrando 1 de 1
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
