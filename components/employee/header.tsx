"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function EmployeeHeader({ userName }: { userName?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const isCourseView = pathname.startsWith("/employee/courses/");

  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        {isCourseView ? (
          <Button
            variant="ghost"
            className="group flex items-center gap-2 text-muted-foreground hover:text-foreground pl-0 hover:bg-transparent"
            onClick={() => router.push("/employee")}
          >
            <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            <span className="font-medium">Volver a mis cursos</span>
          </Button>
        ) : (
          <h2 className="text-lg font-semibold">Mi Aprendizaje</h2>
        )}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <User className="w-4 h-4" />
          <span>{userName || "Empleado"}</span>
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

