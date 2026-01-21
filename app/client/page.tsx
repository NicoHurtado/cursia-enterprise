
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
          _count: {
            select: { enrollments: true }
          },
          enrollments: {
            where: { companyId: { in: companyIds } },
            include: {
              lessonProgress: true,
              evaluationAttempts: {
                select: { score: true, passed: true }
              },
              course: {
                include: {
                  finalEvaluation: { select: { passingScore: true } },
                  modules: {
                    include: { lessons: { select: { id: true } } }
                  }
                }
              }
            }
          }
        },
        take: 10,
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
    const passingScore = e.course.finalEvaluation?.passingScore ?? 70;
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
          <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent tracking-tight">Dashboard Corporativo</h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Resumen de actividad y progreso de {user.companies[0].name}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="overflow-hidden border-none shadow-xl shadow-slate-200/50 relative group rounded-[2rem]">
              <div className={`absolute inset-0 opacity-10 ${stat.color} group-hover:opacity-20 transition-opacity`} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 z-10">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-xl ${stat.color} bg-opacity-20`}>
                  <Icon className={`h-4 w-4 ${stat.color.replace('bg-', 'text-')}`} />
                </div>
              </CardHeader>
              <CardContent className="z-10">
                <div className="text-3xl font-black">{stat.value}</div>
                <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-tighter">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
          <CardTitle className="text-xl font-black text-slate-800">Estado de la Plantilla</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/30">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="py-5 pl-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Nombre</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cursos</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Progreso Promedio</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Certificación</TableHead>
                <TableHead className="text-right pr-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Perfil</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => {
                // Calculate average progress across all enrollments
                let totalProgressSum = 0;
                const totalEnrollments = employee.enrollments.length;

                employee.enrollments.forEach(e => {
                  const allLessons = e.course.modules.flatMap(m => m.lessons);
                  const totalLessons = allLessons.length;
                  if (totalLessons > 0) {
                    const completed = e.lessonProgress.filter(lp => lp.completed).length;
                    totalProgressSum += (completed / totalLessons) * 100;
                  }
                });

                const avgEmployeeProgress = totalEnrollments > 0 ? Math.round(totalProgressSum / totalEnrollments) : 0;

                // Determine if they have AT LEAST one certificate
                const isCertified = employee.enrollments.some(e => {
                  const passingScore = e.course.finalEvaluation?.passingScore ?? 70;
                  return e.evaluationAttempts.some(att => att.score >= passingScore);
                });

                return (
                  <TableRow key={employee.id} className="hover:bg-slate-50/50 border-slate-100 transition-colors group">
                    <TableCell className="py-5 pl-8">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700">{employee.name || 'Sin nombre'}</span>
                        <span className="text-xs text-slate-400 font-medium">{employee.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-lg bg-slate-100/50 border-slate-200 font-bold text-slate-600">
                        {totalEnrollments} {totalEnrollments === 1 ? 'Curso' : 'Cursos'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-24">
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 rounded-full ${avgEmployeeProgress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                              style={{ width: `${avgEmployeeProgress}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-xs font-black text-slate-600">{avgEmployeeProgress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {isCertified ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 shadow-none font-black text-[9px] uppercase tracking-tighter px-3">
                          <CheckCircle className="w-3 h-3 mr-1" /> Certificado
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-200 shadow-none font-bold text-[9px] uppercase tracking-tighter px-3">
                          Pendiente
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <Link href={`/client/users/${employee.id}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-xl hover:bg-white hover:text-[#0066FF] hover:shadow-lg hover:shadow-blue-500/10 transition-all"
                        >
                          <TrendingUp className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                )
              })}
              {employees.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-slate-400 font-medium">
                    No se encontraron empleados registrados.
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
