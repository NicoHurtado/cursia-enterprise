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
  ClipboardCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Leads", icon: UserPlus },
  { href: "/admin/companies", label: "Empresas", icon: Building2 },
  { href: "/admin/courses", label: "Cursos", icon: BookOpen },
  { href: "/admin/assessments", label: "Evaluaciones", icon: ClipboardCheck },
  { href: "/admin/pitchs", label: "Pitchs", icon: Presentation },
  { href: "/admin/users", label: "Usuarios", icon: Users },
  { href: "/admin/settings", label: "Configuración", icon: Settings },
];

export function AdminSidebar({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className={cn(
      "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-300 lg:static lg:translate-x-0 overflow-y-auto",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl md:text-2xl font-bold whitespace-nowrap">
              <span className="text-black">Curs</span>
              <span className="text-cursia-blue">ia</span>
              <span className="text-black"> Ent</span>
            </h1>
            <p className="text-xs text-muted-foreground whitespace-nowrap">Panel de Administración</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        <nav className="space-y-1 md:space-y-2">
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
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 md:px-4 rounded-lg transition-all text-sm md:text-base",
                  isActive
                    ? "bg-slate-900 text-white font-medium shadow-sm"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <Icon className="w-4 h-4 md:w-5 md:h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

