"use client";

import { usePathname } from "next/navigation";
import { AdminSidebar } from "./sidebar";
import { AdminHeader } from "./header";

export function AdminLayoutClient({
  children,
  userName,
}: {
  children: React.ReactNode;
  userName?: string;
}) {
  const pathname = usePathname();
  const isTestPage = pathname.includes("/test");

  // Hide sidebar on test page
  if (isTestPage) {
    return (
      <div className="flex min-h-screen w-full">
        <div className="flex-1 flex flex-col">
          <AdminHeader userName={userName} />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader userName={userName} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}



