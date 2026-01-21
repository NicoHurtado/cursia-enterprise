
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatTime } from "@/lib/utils";
import { Clock, BookOpen, GraduationCap, ArrowLeft, Mail, Calendar, Target, AlertTriangle, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EvaluationAnalysis } from "@/components/admin/evaluation-analysis";

export default async function ContractAdminUserPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "CONTRACT_ADMIN") {
    redirect("/");
  }

  const { userId } = await params;

  // Verify the viewer manages a contract that includes this user
  const managedContracts = await prisma.contract.findMany({
    where: { adminId: session.user.id },
    select: { id: true, companyId: true }
  });

  const contractIds = managedContracts.map(c => c.id);
  const companyIds = Array.from(new Set(managedContracts.map(c => c.companyId)));

  const targetUser = await prisma.user.findFirst({
    where: {
      id: userId,
      contracts: { some: { id: { in: contractIds } } }
    },
    include: {
      contracts: {
        where: { id: { in: contractIds } },
        include: { courses: true }
      }
    }
  });

  if (!targetUser) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold">Usuario no encontrado</h2>
        <p className="text-muted-foreground mt-2">No tienes permisos para ver el perfil de este usuario o no existe.</p>
        <Link href="/employee/admin" className="mt-4 inline-block">
          <Button variant="outline">Volver al panel</Button>
        </Link>
      </div>
    );
  }

  const relevantCourseIds = targetUser.contracts.flatMap(c => c.courses.map(course => course.id));

  const enrollments = await prisma.enrollment.findMany({
    where: {
      userId: userId,
      courseId: { in: relevantCourseIds },
      companyId: { in: companyIds }
    },
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
  });

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/employee/admin">
            <Button variant="ghost" size="icon" className="rounded-2xl bg-white shadow-xl shadow-slate-200/50 hover:bg-slate-50 border-none transition-all">
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">{targetUser.name || 'Usuario'}</h1>
            <div className="flex flex-wrap gap-4 text-slate-400 mt-2 text-xs font-bold uppercase tracking-widest">
              <span className="flex items-center gap-2 bg-slate-100/50 px-3 py-1 rounded-full"><Mail className="h-3 w-3" /> {targetUser.email}</span>
              <span className="flex items-center gap-2 bg-slate-100/50 px-3 py-1 rounded-full"><Calendar className="h-3 w-3" /> Miembro desde {new Date(targetUser.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="summary" className="space-y-8">
        <TabsList className="bg-slate-100/50 p-1 rounded-2xl border border-slate-100 h-14 w-fit">
          <TabsTrigger value="summary" className="rounded-xl px-8 h-full data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:shadow-slate-200/50 font-black text-[10px] uppercase tracking-widest">
            <Target className="w-3.5 h-3.5 mr-2" /> Resumen de Progreso
          </TabsTrigger>
          <TabsTrigger value="evaluation" className="rounded-xl px-8 h-full data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:shadow-slate-200/50 font-black text-[10px] uppercase tracking-widest">
            <TrendingUp className="w-3.5 h-3.5 mr-2" /> Análisis de Evaluación
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-8 mt-0 focus-visible:outline-none">
          <div className="grid gap-8">
            {enrollments.map(enrollment => {
              const allLessons = enrollment.course.modules.flatMap(m => m.lessons);
              const progressPercent = allLessons.length > 0 ? Math.round((enrollment.lessonProgress.filter(lp => lp.completed).length / allLessons.length) * 100) : 0;
              const passingScore = enrollment.course.finalEvaluation?.passingScore ?? 70;
              const bestAttempt = [...enrollment.evaluationAttempts].sort((a, b) => b.score - a.score)[0];
              const isCertified = bestAttempt && bestAttempt.score >= passingScore;

              return (
                <Card key={enrollment.id} className="border-none shadow-2xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden">
                  <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl font-black text-slate-800">{enrollment.course.title}</CardTitle>
                        <CardDescription className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Estado del curso</CardDescription>
                      </div>
                      <Badge
                        className={`rounded-xl px-4 py-1 font-black text-[10px] uppercase tracking-widest border-none shadow-lg ${isCertified ? 'bg-emerald-50 text-emerald-600 shadow-emerald-100' :
                          enrollment.status === 'COMPLETED' ? 'bg-amber-50 text-amber-600 shadow-amber-100' :
                            'bg-blue-50 text-blue-600 shadow-blue-100'
                          }`}
                      >
                        {isCertified ? 'Certificado' : enrollment.status === 'COMPLETED' ? 'Finalizado' : 'En Curso'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="grid lg:grid-cols-3 gap-8 mb-12">
                      <div className="p-6 rounded-[2rem] bg-blue-50/50 border border-blue-100/50 space-y-4">
                        <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                          <Target className="w-3 h-3" /> Progreso de Lecciones
                        </div>
                        <div className="flex items-center gap-4">
                          <Progress value={progressPercent} className="h-2 bg-blue-100" />
                          <span className="text-xl font-black text-blue-600">{progressPercent}%</span>
                        </div>
                      </div>
                      <div className="p-6 rounded-[2rem] bg-violet-50/50 border border-violet-100/50 space-y-4">
                        <div className="text-[10px] font-black text-violet-400 uppercase tracking-widest flex items-center gap-2">
                          <Clock className="w-3 h-3" /> Tiempo Total
                        </div>
                        <div className="text-2xl font-black text-violet-600">{formatTime(enrollment.totalTimeSpent)}</div>
                      </div>
                      <div className="p-6 rounded-[2rem] bg-indigo-50/50 border border-indigo-100/50 space-y-4">
                        <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                          <GraduationCap className="w-3 h-3" /> Mejor Calificación
                        </div>
                        <div className="text-2xl font-black text-indigo-600">{bestAttempt ? `${bestAttempt.score}/100` : '--/--'}</div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12">
                      <div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Desglose por Módulo</h3>
                        <div className="space-y-4">
                          {enrollment.course.modules.map(module => {
                            const modLessons = module.lessons;
                            const completed = modLessons.filter(l => enrollment.lessonProgress.some(lp => lp.lessonId === l.id && lp.completed)).length;
                            const modPercent = modLessons.length > 0 ? Math.round((completed / modLessons.length) * 100) : 0;
                            return (
                              <div key={module.id} className="p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm font-bold text-slate-700">{module.title}</span>
                                  <span className="text-xs font-black text-slate-400">{modPercent}%</span>
                                </div>
                                <Progress value={modPercent} className="h-1 bg-slate-100" />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Exámenes de Lección</h3>
                        <div className="space-y-4">
                          {enrollment.course.modules.flatMap(m => m.lessons).filter(l => l.quizzes.length > 0).map(lesson => {
                            const attempts = enrollment.quizAttempts.filter(qa => lesson.quizzes.some(q => q.id === qa.quizId));
                            const bestQuizScore = attempts.length > 0 ? Math.max(...attempts.map(a => a.score)) : 0;
                            return (
                              <div key={lesson.id} className="flex justify-between items-center p-4 border border-slate-100 rounded-2xl shadow-sm">
                                <span className="text-sm font-bold text-slate-600">{lesson.title}</span>
                                <Badge className={`rounded-lg font-black text-[10px] ${bestQuizScore >= 80 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                  {bestQuizScore}%
                                </Badge>
                              </div>
                            );
                          })}
                          {enrollment.course.modules.flatMap(m => m.lessons).filter(l => l.quizzes.length > 0).length === 0 && (
                            <div className="text-center py-8 text-slate-300 font-medium italic">Sin evaluaciones previas</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="evaluation" className="mt-0 focus-visible:outline-none">
          <div className="grid gap-8">
            {enrollments.map(enrollment => {
              const latestAttempt = enrollment.evaluationAttempts[0];
              const questions = enrollment.course.finalEvaluation?.questions as any[] || [];

              return (
                <div key={`eval-${enrollment.id}`}>
                  {latestAttempt ? (
                    <EvaluationAnalysis
                      score={latestAttempt.score}
                      passed={latestAttempt.passed}
                      aiScore={latestAttempt.aiScore}
                      aiReasoning={latestAttempt.aiReasoning}
                      answers={latestAttempt.answers}
                      questions={questions}
                      userName={targetUser.name || 'Estudiante'}
                    />
                  ) : (
                    <Card className="border-none shadow-2xl rounded-[2.5rem] py-20 text-center">
                      <AlertTriangle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                      <h3 className="text-xl font-black text-slate-800">Evaluación aún no realizada</h3>
                      <p className="text-slate-400 font-medium">El estudiante no ha presentado el examen final de este curso.</p>
                    </Card>
                  )}
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
