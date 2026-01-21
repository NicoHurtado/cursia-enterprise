"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";

export function PasswordChangeForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Las contraseñas nuevas no coinciden");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Contraseña actualizada correctamente");
        setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setError(data.error || "Ocurrió un error al cambiar la contraseña");
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-8">
      <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#0066FF] flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">Seguridad de la Cuenta</CardTitle>
              <CardDescription>Actualiza tu contraseña para mantener tu cuenta segura.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="max-w-md space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Contraseña Actual</Label>
              <div className="relative">
                <Input
                  type={showCurrent ? "text" : "password"}
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  className="pr-10 h-12 rounded-xl bg-slate-50 focus:bg-white border-slate-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Nueva Contraseña</Label>
              <div className="relative">
                <Input
                  type={showNew ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  className="pr-10 h-12 rounded-xl bg-slate-50 focus:bg-white border-slate-200"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Mínimo 6 caracteres.</p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Confirmar Nueva Contraseña</Label>
              <Input
                type={showNew ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="h-12 rounded-xl bg-slate-50 focus:bg-white border-slate-200"
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="font-medium">{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 text-emerald-600 text-sm border border-emerald-100">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <p className="font-medium">{success}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-14 rounded-2xl bg-[#0066FF] hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Actualizando..." : "Actualizar Contraseña"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm rounded-3xl bg-slate-50/50 p-6 border border-slate-100">
        <div className="flex items-start gap-4 text-slate-500">
          <ShieldCheck className="w-5 h-5 text-[#0066FF] mt-1" />
          <p className="text-sm">
            Tu contraseña se cifra de forma segura antes de guardarse. Te recomendamos usar contraseñas únicas que no utilices en otros servicios.
          </p>
        </div>
      </Card>
    </div>
  );
}
