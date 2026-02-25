"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Credenciales inválidas");
      } else {
        // Fetch session to determine role-based redirect
        const response = await fetch("/api/auth/session");
        const session = await response.json();

        let dashboardUrl = '/';
        if (session?.user?.role === 'ADMIN') dashboardUrl = '/admin';
        else if (session?.user?.role === 'CLIENT' || session?.user?.role === 'CONTRACT_ADMIN') dashboardUrl = '/employee/admin';
        else if (session?.user?.role === 'EMPLOYEE') dashboardUrl = '/employee';

        router.push(dashboardUrl);
        router.refresh();
      }
    } catch (err) {
      setError("Error al iniciar sesión");
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
            Inicia sesión en tu cuenta
          </CardDescription>

          <div className="mt-4 p-4 rounded-2xl bg-blue-50 border border-blue-100 text-[13px] text-slate-600 leading-snug">
            <p>
              <span className="font-bold text-[#0066FF]">Aviso:</span> Si tu empresa aún no ha realizado la reunión estratégica inicial, no verás cursos disponibles. Si ya son clientes, usa tu <strong>correo corporativo</strong> para sincronizar tu contenido automáticamente.
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
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
            <div className="text-center text-sm">
              ¿No tienes cuenta?{" "}
              <Link href="/auth/signup" className="text-primary hover:underline">
                Regístrate
              </Link>
            </div>
          </form>

          {/* Development Quick Login */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-8 pt-6 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase mb-3 text-center">
                Acceso Rápido
              </p>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                  onClick={() =>
                    signIn("credentials", {
                      email: "admin@cursia.com",
                      password: "admin123",
                      callbackUrl: "/admin",
                    })
                  }
                >
                  Admin (Super Admin)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                  onClick={() =>
                    signIn("credentials", {
                      email: "admin@empresa.com",
                      password: "password123",
                      callbackUrl: "/employee/admin",
                    })
                  }
                >
                  Admin Empresa
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                  onClick={() =>
                    signIn("credentials", {
                      email: "pedrosaldafo1@gmail.com",
                      password: "password123",
                      callbackUrl: "/employee",
                    })
                  }
                >
                  Estudiante (Pedro)
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

