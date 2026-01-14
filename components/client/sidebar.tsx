"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, BarChart3, Settings } from "lucide-react";

const navItems = [
  { href: "/client", label: "Dashboard", icon: LayoutDashboard },
  { href: "/client/employees", label: "Empleados", icon: Users },
  { href: "/client/reports", label: "Reportes", icon: BarChart3 },
  { href: "/client/settings", label: "Configuración", icon: Settings },
];

export function ClientSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-card border-r min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          <span className="text-black">Curs</span>
          <span className="text-cursia-blue">ia</span>
        </h1>
        <p className="text-sm text-muted-foreground">Dashboard Cliente</p>
      </div>
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
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
      </nav>
    </div>
  );
}

