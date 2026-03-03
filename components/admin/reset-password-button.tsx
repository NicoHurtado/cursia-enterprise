"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResetPasswordButtonProps {
  userId: string;
  userName?: string | null;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
}

export function ResetPasswordButton({
  userId,
  userName,
  className,
  size = "icon",
}: ResetPasswordButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleReset = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    setCopied(false);

    try {
      const res = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al restablecer contraseña");
      }

      const textToCopy = userName
        ? `Hola ${userName}, tu nueva contraseña de Cursia es: ${data.password}\n\nÚsala para iniciar sesión en la plataforma.`
        : `Nueva contraseña: ${data.password}\n\nEmail: ${data.email}`;

      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      router.refresh();

      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Error al restablecer contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size={size}
      className={className}
      onClick={handleReset}
      disabled={loading}
      title="Restablecer contraseña (se copia al portapapeles)"
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <KeyRound className="h-4 w-4" />
      )}
    </Button>
  );
}
