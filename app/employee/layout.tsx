import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { EmployeeSidebar } from "@/components/employee/sidebar";
import { EmployeeHeader } from "@/components/employee/header";

export default async function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || (session.user.role !== "EMPLOYEE" && session.user.role !== "CONTRACT_ADMIN" && session.user.role !== "CLIENT")) {
    redirect("/auth/signin");
  }

  return (
    <div className="flex min-h-screen">
      <EmployeeSidebar userRole={session.user.role} />
      <div className="flex-1 flex flex-col">
        <EmployeeHeader userName={session.user.name || undefined} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

