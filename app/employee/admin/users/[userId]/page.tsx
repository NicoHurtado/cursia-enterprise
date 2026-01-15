
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatTime } from "@/lib/utils";
import { Clock, BookOpen, GraduationCap, ArrowLeft, Mail, Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EvaluationStatusDisplay } from "@/components/client/evaluation-status-display";

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
    return <div>Usuario no encontrado en tus contratos.</div>;
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
    <div className="space-y-8 p-6">
      <div className="flex items-center gap-4">
        <Link href="/employee/admin">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{targetUser.name || 'Usuario'}</h1>
          <div className="flex gap-4 text-muted-foreground mt-1 text-sm">
            <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {targetUser.email}</span>
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Unido el {new Date(targetUser.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {enrollments.map(enrollment => {
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

          // Use best attempt (if passed) or latest attempt for display? 
          // Usually best is preferred if we call them "Certified".
          const finalEvalAttempt = isCertified ? bestAttempt : enrollment.evaluationAttempts[0];

          return (
            <Card key={enrollment.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-muted/30 pb-8">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{enrollment.course.title}</CardTitle>
                  </div>
                  <Badge
                    variant={isCertified ? 'default' : enrollment.status === 'COMPLETED' ? 'destructive' : enrollment.status === 'IN_PROGRESS' ? 'default' : 'secondary'}
                    className={isCertified ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    {isCertified ? 'Certificado' : enrollment.status === 'COMPLETED' ? 'Finalizado (No Aprobado)' : enrollment.status === 'IN_PROGRESS' ? 'En Progreso' : 'Sin Iniciar'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="-mt-6">
                <Card className="shadow-sm mb-6 border-muted">
                  <CardContent className="p-4 grid md:grid-cols-3 gap-4 items-center">
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <BookOpen className="h-4 w-4" /> Progreso General
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={progressPercent} className="h-2" />
                        <span className="text-sm font-bold min-w-[3ch]">{progressPercent}%</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Clock className="h-4 w-4" /> Tiempo Dedicado
                      </div>
                      <div className="text-xl font-bold">{formatTime(enrollment.totalTimeSpent)}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" /> Evaluación Final
                      </div>
                      <div>
                        {finalEvalAttempt ? (
                          <EvaluationStatusDisplay
                            score={finalEvalAttempt.score}
                            passed={finalEvalAttempt.score >= passingScore}
                            aiScore={(finalEvalAttempt as any).aiScore}
                            aiReasoning={(finalEvalAttempt as any).aiReasoning}
                            answers={(finalEvalAttempt as any).answers}
                            userName={targetUser.name || targetUser.email}
                            courseTitle={enrollment.course.title}
                          />
                        ) : (
                          <span className="text-sm text-muted-foreground">No presentada</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold mb-4">Progreso por Módulo</h3>
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
                          <div key={module.id} className="flex flex-col gap-2 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">{module.title}</span>
                              {isModuleDone ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completado</Badge>
                              ) : (
                                <span className="text-xs text-muted-foreground">{modulePercent}%</span>
                              )}
                            </div>
                            <Progress value={modulePercent} className="h-1.5" />
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4">Evaluaciones por Lección</h3>
                    <div className="space-y-4">
                      {enrollment.course.modules.flatMap(m => m.lessons).filter(l => l.quizzes.length > 0).length === 0 ? (
                        <p className="text-sm text-muted-foreground">Este curso no tiene evaluaciones intermedias.</p>
                      ) : (
                        enrollment.course.modules.map(module => {
                          const lessonsWithQuizzes = module.lessons.filter(l => l.quizzes.length > 0);
                          if (lessonsWithQuizzes.length === 0) return null;

                          return (
                            <div key={module.id} className="space-y-2">
                              <h4 className="text-xs uppercase text-muted-foreground font-bold tracking-wider mb-2">{module.title}</h4>
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
                                  <div key={lesson.id} className="flex items-center justify-between p-3 border rounded-md">
                                    <span className="text-sm truncate max-w-[200px]" title={lesson.title}>{lesson.title}</span>
                                    <div className="flex items-center gap-2">
                                      <span className={`font-mono font-bold ${avgScore >= 80 ? 'text-green-600' : avgScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                        {avgScore}%
                                      </span>
                                    </div>
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
              </CardContent>
            </Card>
          )
        })}

        {enrollments.length === 0 && (
          <div className="text-center py-12 border rounded-lg bg-muted/10">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">Sin progreso disponible</h3>
            <p className="text-muted-foreground">No encontramos cursos activos asociados a tus contratos para este usuario.</p>
          </div>
        )}
      </div>
    </div>
  );
}
