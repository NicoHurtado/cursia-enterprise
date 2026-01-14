import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";
import { ReportsGenerator } from "@/components/client/reports-generator";

async function getReportData(companyId: string) {
  const employees = await prisma.user.findMany({
    where: { companies: { some: { id: companyId } }, role: "EMPLOYEE" },
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
  });

  return employees;
}

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user.companyId) {
    return <div>No hay empresa asociada</div>;
  }

  const reportData = await getReportData(session.user.companyId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reportes</h1>
        <p className="text-muted-foreground">
          Genera y descarga reportes detallados de progreso
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generar Reporte</CardTitle>
          <CardDescription>
            Exporta datos de empleados en formato Excel o PDF
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReportsGenerator data={reportData} />
        </CardContent>
      </Card>
    </div>
  );
}

