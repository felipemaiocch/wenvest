import { ChangePasswordForm } from "@/components/settings/ChangePasswordForm";

export const dynamic = 'force-dynamic';
import { Info } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="flex flex-col gap-8 max-w-4xl">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Configurações</h1>
                <p className="text-slate-500">Gerencie suas preferências e segurança da conta.</p>
            </div>

            <div className="flex flex-col gap-6">

                {/* Security Section */}
                <section>
                    <div className="mb-4 flex items-center gap-2">
                        <h2 className="text-lg font-semibold text-slate-800">Segurança</h2>
                    </div>
                    <ChangePasswordForm />
                </section>

                {/* More sections can be added here later (Notifications, API Keys, etc.) */}
                <section className="mt-4 p-4 rounded-md border border-blue-100 bg-blue-50/50 flex gap-3 text-blue-700 max-w-xl">
                    <Info className="flex-shrink-0 mt-0.5" size={18} />
                    <div className="text-sm">
                        <p className="font-semibold mb-1">Mais configurações em breve</p>
                        <p className="opacity-90">Novas opções de personalização e integrações estarão disponíveis nas próximas atualizações do Wenvest.</p>
                    </div>
                </section>

            </div>
        </div>
    );
}
