import { PasswordChangeForm } from "@/components/auth/password-change-form";

export function SettingsPageShell() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Configuración</h1>
        <p className="text-slate-500 mt-2">Gestiona tu seguridad y preferencias de cuenta.</p>
      </div>

      <PasswordChangeForm />
    </div>
  );
}
