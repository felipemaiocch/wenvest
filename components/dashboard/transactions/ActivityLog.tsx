'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

const logs = [
    { id: 1, action: 'Consolidação', date: '08/01/2026 19:31', status: 'Concluído' },
    { id: 2, action: 'Consolidação', date: '02/01/2026 18:02', status: 'Concluído' },
    { id: 3, action: 'Consolidação', date: '02/01/2026 17:58', status: 'Concluído' },
    { id: 4, action: 'Consolidação', date: '02/01/2026 17:55', status: 'Concluído' },
    { id: 5, action: 'Consolidação', date: '02/01/2026 17:52', status: 'Concluído' },
];

export function ActivityLog() {
    return (
        <Card className="border border-border/60 shadow-sm bg-slate-50/30">
            <CardHeader className="pb-2 border-b border-border/40">
                <CardTitle className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                    Últimas atividades
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <table className="w-full text-xs text-left">
                    <tbody className="divide-y divide-border/40">
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-3 w-10 text-slate-400">
                                    <History size={16} />
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-slate-700">{log.action}</span>
                                        <span className="text-[10px] text-muted-foreground">{log.date}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <span className={log.status === 'Concluído' ? 'text-emerald-600 font-medium' : 'text-slate-500'}>
                                        {log.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="p-2 border-t border-border/40 flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-6 w-6" disabled><ChevronLeft size={14} /></Button>
                    <span className="text-xs font-bold text-slate-900">1</span>
                    <span className="text-xs text-slate-500">2</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6"><ChevronRight size={14} /></Button>
                </div>
            </CardContent>
        </Card>
    );
}
