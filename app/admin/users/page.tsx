import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/admin/delete-button";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    include: {
      companies: true,
      contracts: {
        where: { status: "ACTIVE" },
        include: { company: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Usuarios</h1>
          <p className="text-muted-foreground">
            Gestiona los usuarios y sus empresas asociadas
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Empresas</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.name || "Sin nombre"}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(() => {
                        // Combine direct companies and companies from active contracts
                        const allCompanies = [
                          ...user.companies,
                          ...user.contracts.map((c) => c.company),
                        ];
                        // Deduplicate by ID
                        const uniqueCompanies = Array.from(
                          new Map(allCompanies.map((c) => [c.id, c])).values()
                        );

                        return uniqueCompanies.length > 0 ? (
                          uniqueCompanies.map((company) => (
                            <Badge key={company.id} variant="secondary">
                              {company.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            Sin empresa
                          </span>
                        );
                      })()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DeleteButton
                      id={user.id}
                      itemName="Usuario"
                      endpoint="/api/admin/users"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
