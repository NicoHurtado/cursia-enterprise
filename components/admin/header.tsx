"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

export function AdminHeader({ userName }: { userName?: string }) {
  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-6">
      <h2 className="text-lg font-semibold">Panel de Administración</h2>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <User className="w-4 h-4" />
          <span>{userName || "Admin"}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Salir
        </Button>
      </div>
    </header>
  );
}

