
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, BookOpen, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { formatTime } from "@/lib/utils";

export default async function ContractAdminPage() {
  const session = await auth();

  if (!session || session.user.role !== "CONTRACT_ADMIN") {
    redirect("/");
  }

  const managedContracts = await prisma.contract.findMany({
    where: { adminId: session.user.id },
    include: {
      company: true,
      courses: {
        include: {
          finalEvaluation: { select: { passingScore: true } },
          modules: {
            include: { lessons: { select: { id: true } } }
          }
        }
      },
      users: {
        include: {
          enrollments: {
            include: {
              lessonProgress: true,
              evaluationAttempts: { select: { score: true, passed: true } },
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
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-8 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent tracking-tight">
            Panel de Gestión Corporativa
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Supervisión de contratos, progreso y certificaciones.
          </p>
        </div>
      </div>

      {managedContracts.length === 0 ? (
        <Card className="border-dashed rounded-[2rem] py-20">
          <CardContent className="text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-black text-slate-800">No hay contratos activos</h3>
            <p className="text-muted-foreground mt-2 font-medium">No tienes contratos asignados actualmente bajo tu gestión.</p>
          </CardContent>
        </Card>
      ) : (
        managedContracts.map((contract) => {
          // Calculate contract stats
          const relevantUsers = contract.users;
          const totalEnrollmentsAcrossUsers = relevantUsers.reduce((acc, u) =>
            acc + u.enrollments.filter(e => contract.courses.some(c => c.id === e.courseId)).length, 0
          );

          // Average Progress (Lesson based)
          let totalLessonsSeen = 0;
          let totalProgressSum = 0;
          let enrollmentCountForProgress = 0;

          relevantUsers.forEach(u => {
            const contractEnrollments = u.enrollments.filter(e => contract.courses.some(c => c.id === e.courseId));
            contractEnrollments.forEach(e => {
              const allLessons = e.course.modules.flatMap(m => m.lessons);
              if (allLessons.length > 0) {
                const completed = e.lessonProgress.filter(lp => lp.completed).length;
                totalProgressSum += (completed / allLessons.length) * 100;
                enrollmentCountForProgress++;
              }
            });
          });

          const avgProgress = enrollmentCountForProgress > 0 ? Math.round(totalProgressSum / enrollmentCountForProgress) : 0;

          // Certification Rate
          let certifiedCount = 0;
          relevantUsers.forEach(u => {
            const contractEnrollments = u.enrollments.filter(e => contract.courses.some(c => c.id === e.courseId));
            if (contractEnrollments.some(e => {
              const passingScore = e.course.finalEvaluation?.passingScore ?? 70;
              return e.evaluationAttempts.some(att => att.score >= passingScore);
            })) {
              certifiedCount++;
            }
          });

          const certificationRate = relevantUsers.length > 0 ? Math.round((certifiedCount / relevantUsers.length) * 100) : 0;

          const stats = [
            { title: "Usuarios", value: relevantUsers.length, icon: Users, color: "bg-blue-500", desc: `de ${contract.maxUsers || "∞"} cupos` },
            { title: "Cursos", value: contract.courses.length, icon: BookOpen, color: "bg-violet-500", desc: "en este contrato" },
            { title: "Progreso", value: `${avgProgress}%`, icon: TrendingUp, color: "bg-indigo-500", desc: "promedio de lecciones" },
            { title: "Certificación", value: `${certificationRate}%`, icon: CheckCircle, color: "bg-green-500", desc: `${certifiedCount} certificados` },
          ];

          return (
            <div key={contract.id} className="space-y-8 pb-12 border-b border-slate-100 last:border-0">
              <div className="flex justify-between items-end px-4">
                <div className="space-y-1">
                  <Badge className="bg-blue-50 text-blue-600 border-blue-100 font-bold uppercase tracking-widest text-[10px] py-1 px-3">
                    Contrato Activo
                  </Badge>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">{contract.company.name}</h2>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-tighter">
                    {format(contract.startDate, "dd MMM yyyy")} — {format(contract.endDate, "dd MMM yyyy")}
                  </p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-4">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <Card key={stat.title} className="overflow-hidden border-none shadow-xl shadow-slate-200/40 relative group rounded-[2rem]">
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
                          {stat.desc}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl font-black text-slate-800">Detalle de Colaboradores</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-slate-50/30">
                      <TableRow className="hover:bg-transparent border-slate-100">
                        <TableHead className="py-5 pl-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Usuario</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cursos</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Progreso Promedio</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Certificación</TableHead>
                        <TableHead className="text-right pr-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Perfil</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contract.users.map((user) => {
                        const userEnrollments = user.enrollments.filter(e => contract.courses.some(c => c.id === e.courseId));

                        let userProgressSum = 0;
                        userEnrollments.forEach(e => {
                          const lessons = e.course.modules.flatMap(m => m.lessons);
                          if (lessons.length > 0) {
                            userProgressSum += (e.lessonProgress.filter(lp => lp.completed).length / lessons.length) * 100;
                          }
                        });
                        const avgUserProgress = userEnrollments.length > 0 ? Math.round(userProgressSum / userEnrollments.length) : 0;

                        const isUserCertified = userEnrollments.some(e => {
                          const passingScore = e.course.finalEvaluation?.passingScore ?? 70;
                          return e.evaluationAttempts.some(att => att.score >= passingScore);
                        });

                        return (
                          <TableRow key={user.id} className="hover:bg-slate-50/50 border-slate-100 transition-colors group">
                            <TableCell className="py-5 pl-8">
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-700">{user.name || 'Sin nombre'}</span>
                                <span className="text-xs text-slate-400 font-medium">{user.email}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="rounded-lg bg-slate-100/50 border-slate-200 font-bold text-slate-600">
                                {userEnrollments.length} {userEnrollments.length === 1 ? 'Curso' : 'Cursos'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-24">
                                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full transition-all duration-500 rounded-full ${avgUserProgress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                      style={{ width: `${avgUserProgress}%` }}
                                    />
                                  </div>
                                </div>
                                <span className="text-xs font-black text-slate-600">{avgUserProgress}%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {isUserCertified ? (
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
                              <Link href={`/employee/admin/users/${user.id}`}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="rounded-xl hover:bg-white hover:text-blue-600 hover:shadow-lg hover:shadow-blue-500/10 transition-all"
                                >
                                  <TrendingUp className="h-4 w-4" />
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                      {contract.users.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-16 text-slate-400 font-medium italic">
                            No hay usuarios asignados a este contrato.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )
        })
      )}
    </div>
  );
}
