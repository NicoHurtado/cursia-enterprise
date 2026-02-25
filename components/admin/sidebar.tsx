"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  LayoutDashboard,
  Users,
  Settings,
  Building2,
  UserPlus,
  Presentation,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Leads", icon: UserPlus },
  { href: "/admin/companies", label: "Empresas", icon: Building2 },
  { href: "/admin/courses", label: "Cursos", icon: BookOpen },
  { href: "/admin/pitchs", label: "Pitchs", icon: Presentation },
  { href: "/admin/users", label: "Usuarios", icon: Users },
  { href: "/admin/settings", label: "Configuración", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-card border-r min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          <span className="text-black">Curs</span>
          <span className="text-cursia-blue">ia</span>
          <span className="text-black"> Enterprise</span>
        </h1>
        <p className="text-sm text-muted-foreground">Panel de Administración</p>
      </div>
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          // More precise active detection
          let isActive = false;
          if (item.href === "/admin") {
            // Dashboard is active only if pathname is exactly /admin
            isActive = pathname === "/admin";
          } else {
            // Other items are active if pathname starts with their href
            isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2 rounded-md transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "hover:bg-accent"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

