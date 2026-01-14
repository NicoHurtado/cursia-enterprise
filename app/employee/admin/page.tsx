
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
      courses: true,
      users: {
        include: {
          enrollments: {
            include: {
              course: {
                include: {
                  finalEvaluation: true,
                  modules: {
                    include: {
                      lessons: true
                    }
                  }
                }
              },
              moduleProgress: true,
              lessonProgress: true,
              quizAttempts: true,
              evaluationAttempts: true
            }
          }
        }
      },
      _count: {
        select: { users: true, preRegisteredUsers: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
          Panel de Contratos
        </h1>
        <p className="text-muted-foreground mt-2">
          Gestiona el progreso y rendimiento de tus contratos activos.
        </p>
      </div>

      {managedContracts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-20 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium">No hay contratos activos</h3>
            <p className="text-muted-foreground mt-2">No tienes contratos asignados actualmente.</p>
          </CardContent>
        </Card>
      ) : (
        managedContracts.map((contract) => {
          // Calculate contract stats
          const totalUsers = contract.users.length;
          const relevantEnrollments = contract.users.flatMap(u =>
            u.enrollments.filter(e => contract.courses.some(c => c.id === e.courseId))
          );
          const totalEnrollments = relevantEnrollments.length;

          // Certification Rate (STRICT Score Check)
          const certifiedEnrollments = relevantEnrollments.filter(e => {
            const passingScore = e.course.finalEvaluation?.passingScore ?? 70;
            return e.evaluationAttempts && e.evaluationAttempts.some(att => att.score >= passingScore);
          }).length;

          const certificationRate = totalEnrollments > 0 ? Math.round((certifiedEnrollments / totalEnrollments) * 100) : 0;

          // Average Time
          const totalTime = relevantEnrollments.reduce((acc, curr) => acc + curr.totalTimeSpent, 0);
          const avgTime = totalEnrollments > 0 ? Math.round(totalTime / totalEnrollments) : 0;

          // Average Progress (Granular)
          const totalProgressSum = relevantEnrollments.reduce((acc, enrollment) => {
            // We can approximate total lessons from modules if fetched, or assuming we have them. 
            // Note: In headers we didn't fetch modules deep lessons count fully... Wait, we need course.modules.lessons.
            // We fetched `course: true`. But `course` type might not include modules/lessons by default unless included.
            // Let's rely on `moduleProgress` count vs `course.modules` count if simpler, or assume we fetch deep enough.
            // Actually, `course: true` usually just fetches scalars. We need `include: { course: { include: { modules: { include: { lessons: true } } } } }` to be precise.
            // To avoid massive deep fetch performance hit, let's stick to module-based or try to refine query.
            // USER ASKED FOR "progreso promedio de las lecciones".
            // Let's assume we update the fetch above to include course structure deeply? 
            // Or safer: Use module progress as proxy if deep fetch is too heavy? 
            // No, user wants accuracy. I'll update the fetch to include basic structure.
            return acc; // logic below will fix this
          }, 0);

          // RE-CALCULATING WITH BETTER DATA DOWNSTREAM
          // To calculate granular progress properly for "Avance Promedio", we need the lesson count.
          // Let's adjust the map calculation to iterate and sum properly if we have the data.
          // If we don't have deep course data, we might need to rely on module completion or simpler metric.
          // BUT wait, I can just update the include above!

          let progressSum = 0;
          relevantEnrollments.forEach(e => {
            // @ts-ignore - assuming we updated the include query
            const allLessons = e.course.modules?.flatMap(m => m.lessons) || [];
            const totalLessons = allLessons.length;
            if (totalLessons > 0) {
              const completedLessons = e.lessonProgress?.filter(lp => lp.completed).length || 0;
              progressSum += (completedLessons / totalLessons) * 100;
            }
          });
          const avgProgress = totalEnrollments > 0 ? Math.round(progressSum / totalEnrollments) : 0;


          return (
            <div key={contract.id} className="space-y-6">
              {/* Contract Header & Stats */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card className="col-span-full bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-none shadow-sm">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-2xl text-blue-900 dark:text-blue-100">{contract.company.name}</CardTitle>
                        <CardDescription>
                          Contrato del {format(contract.startDate, "dd/MM/yyyy")} al {format(contract.endDate, "dd/MM/yyyy")}
                        </CardDescription>
                      </div>
                      <Badge variant={contract.status === 'ACTIVE' ? 'default' : 'destructive'} className="text-sm px-3 py-1">
                        {contract.status === 'ACTIVE' ? 'Activo' : contract.status}
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Usuarios</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalUsers} <span className="text-muted-foreground text-sm font-normal">/ {contract.maxUsers || "∞"}</span></div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Cursos Activos</CardTitle>
                    <BookOpen className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{relevantEnrollments.length}</div>
                    <p className="text-xs text-muted-foreground">Inscripciones totales</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avance Promedio</CardTitle>
                    <TrendingUp className="h-4 w-4 text-indigo-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{avgProgress}%</div>
                    <p className="text-xs text-muted-foreground">Progreso de contenido</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tasa de Certificación</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{certificationRate}%</div>
                    <p className="text-xs text-muted-foreground">{certifiedEnrollments} usuarios certificados</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
                    <Clock className="h-4 w-4 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatTime(avgTime)}</div>
                    <p className="text-xs text-muted-foreground">Por curso completado</p>
                  </CardContent>
                </Card>
              </div>

              {/* Users Table */}
              <Card className="overflow-hidden shadow-md border-none">
                <CardHeader>
                  <CardTitle>Detalle de Usuarios</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Usuario</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Cursos Asignados</TableHead>
                        <TableHead>Estado General</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contract.users.map((user) => {
                        const userEnrollments = user.enrollments.filter(e => contract.courses.some(c => c.id === e.courseId));
                        const coursesCompleted = userEnrollments.filter(e => e.status === 'COMPLETED').length;

                        return (
                          <TableRow key={user.id} className="hover:bg-muted/10 transition-colors">
                            <TableCell className="font-medium">
                              <div className="flex flex-col">
                                <span>{user.name}</span>
                                <span className="text-xs text-muted-foreground md:hidden">{user.email}</span>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                {userEnrollments.slice(0, 2).map(e => (
                                  <span key={e.courseId} className="text-xs truncate max-w-[150px]">{e.course.title}</span>
                                ))}
                                {userEnrollments.length > 2 && <span className="text-xs text-muted-foreground">+{userEnrollments.length - 2} más</span>}
                                {userEnrollments.length === 0 && <span className="text-xs text-muted-foreground">-</span>}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Badge variant={coursesCompleted > 0 ? 'default' : 'secondary'}>
                                  {coursesCompleted}/{userEnrollments.length} Completados
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Link href={`/employee/admin/users/${user.id}`}>
                                <Button variant="ghost" size="sm" className="hover:text-blue-600">Ver Perfil</Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                      {contract.users.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No hay usuarios registrados en este contrato aún.
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
