
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatTime } from "@/lib/utils";
import { Clock, BookOpen, GraduationCap, ArrowLeft, Mail, Calendar, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EvaluationAnalysis } from "@/components/client/evaluation-analysis";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.email) {
    return <div>No autorizado</div>;
  }

  const { userId } = await params;

  // Verify the viewer is the admin of the user's company
  const viewer = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { companies: true },
  });

  if (!viewer || viewer.companies.length === 0) {
    return <div>No autorizado</div>;
  }

  const viewerCompanyIds = viewer.companies.map(c => c.id);

  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      companies: { some: { id: { in: viewerCompanyIds } } }
    },
    include: {
      enrollments: {
        where: { companyId: { in: viewerCompanyIds } },
        include: {
          course: {
            include: {
              modules: {
                orderBy: { order: 'asc' },
                include: { lessons: { include: { quizzes: true } } }
              },
              finalEvaluation: true
            }
          },
          moduleProgress: true,
          lessonProgress: true,
          quizAttempts: true,
          evaluationAttempts: { orderBy: { completedAt: 'desc' } }
        }
      }
    }
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center gap-4">
        <Link href="/client">
          <Button variant="outline" size="icon" className="rounded-xl">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{user.name || 'Usuario'}</h1>
          <div className="flex gap-4 text-slate-500 mt-1 text-sm font-medium">
            <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> {user.email}</span>
            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Miembro desde {new Date(user.createdAt).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-8">
        {user.enrollments.map(enrollment => {
          // Granular Progress Calculation (Lesson based)
          const allLessons = enrollment.course.modules.flatMap(m => m.lessons);
          const totalLessons = allLessons.length;
          const completedLessons = enrollment.lessonProgress.filter(lp => lp.completed).length;
          const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

          // STRICT CERTIFICATION: Find the attempt that passed, or default to the latest
          const passingScore = enrollment.course.finalEvaluation?.passingScore ?? 70;

          // Find best attempt (highest score) to determine certification status display
          const bestAttempt = [...enrollment.evaluationAttempts].sort((a, b) => b.score - a.score)[0];

          // Check if best attempt passed
          const isCertified = bestAttempt && bestAttempt.score >= passingScore;

          // Use best attempt (if passed) or latest attempt for display
          const finalEvalAttempt = isCertified ? bestAttempt : enrollment.evaluationAttempts[0];

          return (
            <Card key={enrollment.id} className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl font-black text-slate-900">{enrollment.course.title}</CardTitle>
                    <CardDescription className="text-slate-500 font-medium">Análisis detallado de progreso y desempeño.</CardDescription>
                  </div>
                  <Badge
                    variant={isCertified ? 'default' : enrollment.status === 'COMPLETED' ? 'destructive' : enrollment.status === 'IN_PROGRESS' ? 'default' : 'secondary'}
                    className={`px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider ${isCertified ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" : ""}`}
                  >
                    {isCertified ? 'Certificado' : enrollment.status === 'COMPLETED' ? 'Finalizado (No Aprobado)' : enrollment.status === 'IN_PROGRESS' ? 'En Progreso' : 'Sin Iniciar'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-8">
                <Tabs defaultValue="overview" className="space-y-8">
                  <TabsList className="bg-slate-100/50 p-1.5 rounded-2xl h-auto gap-1">
                    <TabsTrigger value="overview" className="rounded-xl px-6 py-2.5 font-bold text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#0066FF] data-[state=active]:shadow-sm">
                      <BookOpen className="w-4 h-4 mr-2" /> Resumen
                    </TabsTrigger>
                    <TabsTrigger value="evaluation" className="rounded-xl px-6 py-2.5 font-bold text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#0066FF] data-[state=active]:shadow-sm">
                      <GraduationCap className="w-4 h-4 mr-2" /> Análisis de Evaluación
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-8 animate-in fade-in duration-500">
                    <div className="grid md:grid-cols-3 gap-6">
                      <Card className="border-none bg-slate-50/50 rounded-3xl p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-[#0066FF] flex items-center justify-center text-white">
                            <BookOpen className="w-6 h-6" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progreso Total</p>
                            <div className="flex items-center gap-3">
                              <span className="text-2xl font-black text-slate-900">{progressPercent}%</span>
                              <Progress value={progressPercent} className="h-2 w-24" />
                            </div>
                          </div>
                        </div>
                      </Card>

                      <Card className="border-none bg-slate-50/50 rounded-3xl p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white">
                            <Clock className="w-6 h-6" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiempo de Estudio</p>
                            <span className="text-2xl font-black text-slate-900">{formatTime(enrollment.totalTimeSpent)}</span>
                          </div>
                        </div>
                      </Card>

                      <Card className="border-none bg-slate-50/50 rounded-3xl p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-purple-500 flex items-center justify-center text-white">
                            <GraduationCap className="w-6 h-6" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nota Evaluación</p>
                            <span className="text-2xl font-black text-slate-900">{finalEvalAttempt ? `${finalEvalAttempt.score}%` : 'N/A'}</span>
                          </div>
                        </div>
                      </Card>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-[#0066FF]" /> Progreso por Módulo
                        </h3>
                        <div className="space-y-4">
                          {enrollment.course.modules.map(module => {
                            const moduleLessons = module.lessons;
                            const moduleTotal = moduleLessons.length;
                            const moduleCompleted = moduleLessons.filter(l =>
                              enrollment.lessonProgress.some(lp => lp.lessonId === l.id && lp.completed)
                            ).length;
                            const modulePercent = moduleTotal > 0 ? Math.round((moduleCompleted / moduleTotal) * 100) : 0;
                            const isModuleDone = modulePercent === 100;

                            return (
                              <div key={module.id} className="p-4 rounded-2xl border border-slate-100 bg-white hover:border-[#0066FF]/20 transition-all group">
                                <div className="flex justify-between items-center mb-3">
                                  <span className="text-sm font-bold text-slate-700">{module.title}</span>
                                  {isModuleDone ? (
                                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold uppercase text-[9px]">Completado</Badge>
                                  ) : (
                                    <span className="text-[10px] font-bold text-slate-400">{modulePercent}%</span>
                                  )}
                                </div>
                                <Progress value={modulePercent} className="h-1.5 shadow-inner" />
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      <div className="space-y-6">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <Search className="w-5 h-5 text-purple-500" /> Pruebas de Lección
                        </h3>
                        <div className="space-y-4">
                          {enrollment.course.modules.flatMap(m => m.lessons).filter(l => l.quizzes.length > 0).length === 0 ? (
                            <div className="p-10 text-center rounded-3xl bg-slate-50 border border-dashed border-slate-200">
                              <p className="text-sm text-slate-400 font-medium">No hay evaluaciones intermedias en este curso.</p>
                            </div>
                          ) : (
                            enrollment.course.modules.map(module => {
                              const lessonsWithQuizzes = module.lessons.filter(l => l.quizzes.length > 0);
                              if (lessonsWithQuizzes.length === 0) return null;

                              return (
                                <div key={module.id} className="space-y-3">
                                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">{module.title}</h4>
                                  {lessonsWithQuizzes.map(lesson => {
                                    const totalQuestions = lesson.quizzes.length;
                                    let totalScoreSum = 0;
                                    lesson.quizzes.forEach(q => {
                                      const attempts = enrollment.quizAttempts.filter(qa => qa.quizId === q.id);
                                      const bestScore = attempts.length > 0 ? Math.max(...attempts.map(a => a.score)) : 0;
                                      totalScoreSum += bestScore;
                                    });
                                    const avgScore = totalQuestions > 0 ? Math.round(totalScoreSum / totalQuestions) : 0;

                                    return (
                                      <div key={lesson.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl bg-white hover:bg-slate-50 transition-colors">
                                        <span className="text-sm font-bold text-slate-700 truncate max-w-[200px]">{lesson.title}</span>
                                        <span className={`font-mono font-black ${avgScore >= 80 ? 'text-emerald-500' : avgScore >= 60 ? 'text-amber-500' : 'text-red-500'}`}>
                                          {avgScore}%
                                        </span>
                                      </div>
                                    )
                                  })}
                                </div>
                              )
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="evaluation" className="animate-in slide-in-from-bottom-4 duration-500">
                    {finalEvalAttempt ? (
                      <EvaluationAnalysis
                        score={finalEvalAttempt.score}
                        passed={finalEvalAttempt.passed}
                        aiScore={(finalEvalAttempt as any).aiScore}
                        aiReasoning={(finalEvalAttempt as any).aiReasoning}
                        answers={(finalEvalAttempt as any).answers}
                        questions={(enrollment.course.finalEvaluation?.questions as any[]) || []}
                        userName={user.name || user.email}
                      />
                    ) : (
                      <div className="p-20 text-center rounded-[3rem] bg-slate-50 border border-dashed border-slate-200">
                        <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mx-auto mb-6 shadow-xl text-slate-300">
                          <GraduationCap className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">Evaluación Pendiente</h3>
                        <p className="text-slate-500 max-w-xs mx-auto">
                          El estudiante aún no ha presentado la evaluación final de este curso.
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )
        })}

        {user.enrollments.length === 0 && (
          <div className="text-center py-20 rounded-[3rem] border border-dashed border-slate-200 bg-slate-50/50">
            <BookOpen className="h-16 w-16 text-slate-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-slate-800">Sin cursos asignados</h3>
            <p className="text-slate-500 max-w-sm mx-auto mt-2">Este usuario aún no tiene inscripciones activas configuradas por la organización.</p>
          </div>
        )}
      </div>
    </div>
  );
}

