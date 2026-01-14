import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ClientSidebar } from "@/components/client/sidebar";
import { ClientHeader } from "@/components/client/header";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user.role !== "CLIENT") {
    redirect("/auth/signin");
  }

  return (
    <div className="flex min-h-screen">
      <ClientSidebar />
      <div className="flex-1 flex flex-col">
        <ClientHeader userName={session.user.name || undefined} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

