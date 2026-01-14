
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { formatTime } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function ClientDashboard() {
  const session = await auth();
  if (!session?.user?.email) {
    return <div>No autorizado</div>;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { companies: true },
  });

  if (!user || user.companies.length === 0) {
    return <div>No hay empresa asociada</div>;
  }

  const companyIds = user.companies.map((c) => c.id);

  // Fetch stats and employees in parallel
  const [totalEmployees, totalEnrollments, certifiedEnrollments, avgTimeSpent, employees, allEnrollmentsWithProgress] =
    await Promise.all([
      prisma.user.count({
        where: {
          companies: { some: { id: { in: companyIds } } },
          role: "EMPLOYEE",
        },
      }),
      prisma.enrollment.count({
        where: { companyId: { in: companyIds } },
      }),
      prisma.enrollment.count({
        where: {
          companyId: { in: companyIds },
          evaluationAttempts: { some: { passed: true } }
        },
      }),
      prisma.enrollment.aggregate({
        where: { companyId: { in: companyIds } },
        _avg: { totalTimeSpent: true },
      }),
      prisma.user.findMany({
        where: {
          companies: { some: { id: { in: companyIds } } },
          role: "EMPLOYEE",
        },
        include: {
          // Include enough for the user table logic
          _count: {
            select: { enrollments: true }
          },
          enrollments: {
            where: { companyId: { in: companyIds } },
            select: {
              status: true,
              totalTimeSpent: true,
              evaluationAttempts: {
                where: { passed: true },
                select: { id: true }
              }
            }
          }
        },
        take: 10, // Limit to 10 for the dashboard view
        orderBy: { createdAt: 'desc' }
      }),
      // Fetch data for Average Progress calculation
      prisma.enrollment.findMany({
        where: { companyId: { in: companyIds } },
        include: {
          lessonProgress: true,
          evaluationAttempts: true,
          course: {
            include: {
              finalEvaluation: true,
              modules: {
                include: { lessons: true }
              }
            }
          }
        }
      })
    ]);

  // Calculate Certification Rate manually to be strict
  const strictCertifiedCount = allEnrollmentsWithProgress.filter(e => {
    const passingScore = e.course.finalEvaluation?.passingScore ?? 70; // Default to 70 if missing
    return e.evaluationAttempts.some(att => att.score >= passingScore);
  }).length;

  const certificationRate =
    totalEnrollments > 0
      ? Math.round((strictCertifiedCount / totalEnrollments) * 100)
      : 0;

  // Calculate Average Progress
  let totalProgress = 0;
  allEnrollmentsWithProgress.forEach(e => {
    const allLessons = e.course.modules.flatMap(m => m.lessons);
    const totalLessons = allLessons.length;
    if (totalLessons > 0) {
      const completedLessons = e.lessonProgress.filter(lp => lp.completed).length;
      totalProgress += (completedLessons / totalLessons) * 100;
    }
  });
  const avgProgress = totalEnrollments > 0 ? Math.round(totalProgress / totalEnrollments) : 0;

  const stats = [
    {
      title: "Total Empleados",
      value: totalEmployees,
      icon: Users,
      description: "Empleados registrados",
      color: "bg-blue-500",
    },
    {
      title: "Cursos Asignados",
      value: totalEnrollments,
      icon: BookOpen,
      description: "Total de inscripciones",
      color: "bg-violet-500",
    },
    {
      title: "Avance Promedio",
      value: `${avgProgress}%`,
      icon: TrendingUp,
      description: "Progreso de contenido",
      color: "bg-indigo-500",
    },
    {
      title: "Tasa de Certificación",
      value: `${certificationRate}%`,
      icon: CheckCircle,
      description: `${strictCertifiedCount} certificaciones`,
      color: "bg-green-500",
    },
    {
      title: "Tiempo Promedio",
      value: formatTime(Math.round(avgTimeSpent._avg.totalTimeSpent || 0)),
      icon: Clock,
      description: "Por curso",
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="space-y-8 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">Dashboard Corporativo</h1>
          <p className="text-muted-foreground mt-2">
            Resumen de actividad y progreso de {user.companies[0].name}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="overflow-hidden border-none shadow-lg relative group">
              <div className={`absolute inset-0 opacity-10 ${stat.color} group-hover:opacity-20 transition-opacity`} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 z-10">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.color} bg-opacity-20`}>
                  <Icon className={`h-4 w-4 ${stat.color.replace('bg-', 'text-')}`} />
                </div>
              </CardHeader>
              <CardContent className="z-10">
                <div className="text-3xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle>Empleados Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Cursos</TableHead>
                <TableHead>Progreso General</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => {
                const certifiedCount = employee.enrollments.filter(e => e.evaluationAttempts.length > 0).length;
                const totalEnrollments = employee.enrollments.length;
                const completionPercent = totalEnrollments > 0 ? Math.round((certifiedCount / totalEnrollments) * 100) : 0;

                return (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.name || 'Sin nombre'}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee._count.enrollments}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant={completionPercent === 100 ? "default" : "secondary"} className={completionPercent === 100 ? "bg-green-500 hover:bg-green-600" : ""}>
                          {completionPercent}% Finalizado
                        </Badge>
                        <span className="text-xs text-muted-foreground">{certifiedCount} de {totalEnrollments} certificados</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/client/users/${employee.id}`}>
                        <Button variant="ghost" size="sm">Ver Perfil</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                )
              })}
              {employees.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No se encontraron empleados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
