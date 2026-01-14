import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { DeleteButton } from "@/components/admin/delete-button";

export default async function CompaniesPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/auth/signin");
  }

  const companies = await prisma.company.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { users: true, courses: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Empresas</h1>
        <Link href="/admin/companies/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Empresa
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <div key={company.id} className="relative group">
            <Link href={`/admin/companies/${company.id}`}>
              <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
                <CardHeader>
                  <CardTitle>{company.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <p>{company._count.users} Usuarios</p>
                    <p>{company._count.courses} Cursos</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <DeleteButton
                id={company.id}
                endpoint="/api/admin/companies"
                itemName="empresa"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
