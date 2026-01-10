'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { createBrowserClient } from '@supabase/ssr';
// Removed toast import as sonner is not definitely installed/configured, using alert for now or simple state
// If user says "complete", I should arguably try to use toast if available, but to be safe/robust:
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export function ChangePasswordForm() {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus('idle');
        setMessage('');

        if (password.length < 6) {
            setStatus('error');
            setMessage('A senha deve ter pelo menos 6 caracteres.');
            setLoading(false);
            return;
        }

        const { error } = await supabase.auth.updateUser({
            password: password
        });

        if (error) {
            setStatus('error');
            setMessage(error.message);
        } else {
            setStatus('success');
            setMessage('Senha atualizada com sucesso!');
            setPassword('');
        }
        setLoading(false);
    };

    return (
        <Card className="border-border/60 shadow-sm max-w-xl">
            <CardHeader className="pb-4 border-b border-border/40 bg-slate-50/50">
                <CardTitle className="text-base font-semibold text-slate-800">Alterar Senha</CardTitle>
                <CardDescription>Atualize sua senha de acesso à plataforma.</CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdatePassword}>
                <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="new-password">Nova Senha</Label>
                        <Input
                            id="new-password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {status === 'success' && (
                        <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 p-3 rounded-md border border-emerald-100">
                            <CheckCircle2 size={16} />
                            {message}
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 p-3 rounded-md border border-rose-100">
                            <AlertCircle size={16} />
                            {message}
                        </div>
                    )}

                </CardContent>
                <CardFooter className="bg-slate-50/30 border-t border-border/40 py-4 flex justify-end">
                    <Button type="submit" disabled={loading} className="bg-slate-900 hover:bg-slate-800">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Atualizar Senha
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
