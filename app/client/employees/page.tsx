import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { EmployeeTable } from "@/components/client/employee-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

async function getEmployees(companyId: string) {
  return prisma.user.findMany({
    where: {
      companies: { some: { id: companyId } },
      role: "EMPLOYEE",
    },
    include: {
      enrollments: {
        include: {
          course: { select: { title: true } },
          moduleProgress: true,
          lessonProgress: true,
          quizAttempts: true,
          evaluationAttempts: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });
}

export default async function EmployeesPage() {
  const session = await auth();
  if (!session?.user.companyId) {
    return <div>No hay empresa asociada</div>;
  }

  const employees = await getEmployees(session.user.companyId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Empleados</h1>
        <p className="text-muted-foreground">
          Monitorea el progreso de tus empleados
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Empleados</CardTitle>
          <CardDescription>
            Detalles de progreso, tiempo y calificaciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmployeeTable employees={employees} />
        </CardContent>
      </Card>
    </div>
  );
}

