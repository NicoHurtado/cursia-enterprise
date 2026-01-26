"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        // Auto login after registration
        const result = await signIn("credentials", {
          redirect: false,
          email: formData.email,
          password: formData.password,
        });

        if (result?.error) {
          setError("Cuenta creada pero error al iniciar sesión automática");
          router.push("/auth/signin");
        } else {
          // Fetch session to determine role-based redirect
          const response = await fetch("/api/auth/session");
          const session = await response.json();

          let dashboardUrl = '/';
          if (session?.user?.role === 'ADMIN') dashboardUrl = '/admin';
          else if (session?.user?.role === 'CLIENT' || session?.user?.role === 'CONTRACT_ADMIN') dashboardUrl = '/employee/admin';
          else if (session?.user?.role === 'EMPLOYEE') dashboardUrl = '/employee';

          router.push(dashboardUrl);
        }
      } else {
        const data = await res.json();
        setError(data.error || "Error al registrarse");
      }
    } catch (err) {
      setError("Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            <span className="text-black">Curs</span>
            <span className="text-cursia-blue">ia</span>
          </CardTitle>
          <CardDescription className="text-center">
            Crea tu cuenta para acceder a tus cursos
          </CardDescription>

          <div className="mt-4 p-4 rounded-2xl bg-blue-50 border border-blue-100 text-[13px] text-slate-600 leading-snug">
            <p>
              <span className="font-bold text-[#0066FF]">Importante:</span> Solo verás cursos si tu organización ya tuvo la sesión estratégica inicial. Asegúrate de registrarte con tu <strong>correo corporativo</strong> para habilitar tu capacitación.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Registrando..." : "Registrarse"}
            </Button>
            <div className="text-center text-sm">
              ¿Ya tienes cuenta?{" "}
              <Link href="/auth/signin" className="text-primary hover:underline">
                Inicia sesión
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
