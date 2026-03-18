"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut, User, Menu } from "lucide-react";

export function AdminHeader({ 
  userName, 
  onMenuClick 
}: { 
  userName?: string; 
  onMenuClick?: () => void;
}) {
  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-2 md:gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="w-5 h-5" />
        </Button>
        <h2 className="text-sm md:text-lg font-semibold truncate max-w-[200px] md:max-w-none">
          Panel de Administración
        </h2>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <div className="hidden sm:flex items-center gap-2 text-sm">
          <User className="w-4 h-4" />
          <span className="truncate max-w-[100px]">{userName || "Admin"}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="px-2 md:px-3"
          onClick={async () => {
            await signOut({ redirect: false });
            window.location.href = "/";
          }}
        >
          <LogOut className="w-4 h-4 mr-0 md:mr-2" />
          <span className="hidden md:inline">Salir</span>
        </Button>
      </div>
    </header>
  );
}

