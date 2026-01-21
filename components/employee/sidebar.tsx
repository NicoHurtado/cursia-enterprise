"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BookOpen, Home, Award, LayoutDashboard, Settings } from "lucide-react";

const navItems = [
  { href: "/employee", label: "Mis Cursos", icon: Home },
  { href: "/employee/certificates", label: "Certificados", icon: Award },
  { href: "/employee/settings", label: "Configuración", icon: Settings },
];

interface EmployeeSidebarProps {
  userRole?: string;
}

export function EmployeeSidebar({ userRole }: EmployeeSidebarProps) {
  const pathname = usePathname();

  if (pathname.startsWith("/employee/courses/")) {
    return null;
  }

  return (
    <div className="w-64 bg-card border-r min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          <span className="text-black">Curs</span>
          <span className="text-cursia-blue">ia</span>
        </h1>
        <p className="text-sm text-muted-foreground">Mi Aprendizaje</p>
      </div>
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (pathname.startsWith(item.href + "/") &&
              (item.href !== "/employee" ||
                (!pathname.startsWith("/employee/certificates") &&
                  !pathname.startsWith("/employee/admin"))));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2 rounded-md transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {userRole === "CONTRACT_ADMIN" && (
          <Link
            href="/employee/admin"
            className={cn(
              "flex items-center gap-3 px-4 py-2 rounded-md transition-colors",
              pathname.startsWith("/employee/admin")
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent"
            )}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Panel Admin</span>
          </Link>
        )}
      </nav>
    </div>
  );
}

