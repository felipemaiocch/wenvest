'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState(''); // Optional, focusing on Magic Link usually better for modern apps
    const [loading, setLoading] = useState(false);
    const supabase = createClient()
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                alert('Erro ao entrar: ' + error.message);
            } else {
                router.refresh(); // Refresh to update server components with new cookie
                router.push('/dashboard');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleMagicLink = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) alert('Erro: ' + error.message);
        else alert('Cheque seu email para o link mágico!');
        setLoading(false);
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
            <Card className="w-full max-w-md shadow-2xl border-0">
                <CardHeader className="space-y-4 pb-6">
                    {/* Logo with dark background for contrast */}
                    <div className="flex justify-center mb-2">
                        <div className="bg-slate-900 px-6 py-3 rounded-lg">
                            <Image
                                src="https://www.wenvestadvisor.com.br/assets/images/logo-wenvest-304x96.webp"
                                alt="Wenvest"
                                width={180}
                                height={57}
                                className="object-contain"
                                priority
                            />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-center text-slate-900">
                        Bem-vindo de volta
                    </CardTitle>
                    <CardDescription className="text-center text-slate-600">
                        Entre para gerenciar seu patrimônio
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Senha</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button
                        className="w-full h-11 text-base font-semibold bg-[#fcbf18] hover:bg-[#e5ad15] text-slate-900"
                        onClick={handleLogin}
                        disabled={loading}
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Entrar
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
