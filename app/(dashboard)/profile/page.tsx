import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, User, Calendar, Shield } from "lucide-react";

export default async function ProfilePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return <div>Não autenticado</div>;
    }

    // Get initials for avatar
    const userEmail = user.email || "";
    const initials = userEmail.substring(0, 2).toUpperCase();

    // Format created_at date
    const memberSince = new Date(user.created_at).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    return (
        <div className="flex flex-col gap-6 max-w-4xl">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Meu Perfil</h1>

            <div className="grid gap-6 md:grid-cols-[240px_1fr]">
                {/* Sidebar / Photo */}
                <Card className="h-fit border-border/60 shadow-sm">
                    <CardContent className="pt-6 flex flex-col items-center text-center">
                        <Avatar className="h-24 w-24 mb-4">
                            <AvatarImage src={user.user_metadata?.avatar_url} />
                            <AvatarFallback className="text-xl bg-slate-100 text-slate-600">{initials}</AvatarFallback>
                        </Avatar>
                        <h2 className="text-lg font-semibold text-slate-900 truncate w-full" title={user.email}>
                            {user.user_metadata?.full_name || user.email?.split('@')[0]}
                        </h2>
                        <span className="text-sm text-muted-foreground mb-4">Advisor</span>
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                            Conta Ativa
                        </Badge>
                    </CardContent>
                </Card>

                {/* Details */}
                <div className="flex flex-col gap-6">
                    <Card className="border-border/60 shadow-sm">
                        <CardHeader className="pb-4 border-b border-border/40 bg-slate-50/50">
                            <CardTitle className="text-base font-semibold text-slate-800">Informações da Conta</CardTitle>
                            <CardDescription>Detalhes do seu cadastro na Wenvest.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 grid gap-6">

                            <div className="grid gap-2">
                                <label className="text-xs font-medium text-muted-foreground uppercase">Email</label>
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-md border border-slate-100 text-slate-900">
                                    <Mail size={16} className="text-slate-400" />
                                    <span>{user.email}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <label className="text-xs font-medium text-muted-foreground uppercase">User ID</label>
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-md border border-slate-100 text-slate-500 text-xs font-mono truncate">
                                        <User size={16} className="text-slate-400 flex-shrink-0" />
                                        <span className="truncate">{user.id}</span>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-xs font-medium text-muted-foreground uppercase">Membro Desde</label>
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-md border border-slate-100 text-slate-900">
                                        <Calendar size={16} className="text-slate-400" />
                                        <span>{memberSince}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <label className="text-xs font-medium text-muted-foreground uppercase">Autenticação</label>
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-md border border-slate-100 text-slate-900">
                                    <Shield size={16} className="text-slate-400" />
                                    <span>Provedor: {user.app_metadata?.provider || 'Email'}</span>
                                </div>
                            </div>

                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
