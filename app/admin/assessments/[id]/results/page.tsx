import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, XCircle, Bot, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { AssessmentCopyLink } from "@/components/admin/assessment-copy-link";

async function getAssessment(id: string) {
  return prisma.freeAssessment.findUnique({
    where: { id },
    include: {
      attempts: {
        orderBy: { completedAt: "desc" },
      },
    },
  });
}

export default async function AssessmentResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const assessment = await getAssessment(id);

  if (!assessment) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Evaluación no encontrada</p>
      </div>
    );
  }

  const questions = assessment.questions as Array<{ question: string; idealAnswer: string }>;
  const totalAttempts = assessment.attempts.length;
  const passedAttempts = assessment.attempts.filter((a) => a.passed).length;
  const avgScore = totalAttempts > 0
    ? Math.round(assessment.attempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/assessments">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{assessment.title}</h1>
          <p className="text-muted-foreground">Resultados de la evaluación</p>
        </div>
        <AssessmentCopyLink assessmentId={assessment.id} />
        <Link href={`/admin/assessments/${id}`}>
          <Button variant="outline">Editar Evaluación</Button>
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Intentos</p>
            <p className="text-3xl font-bold">{totalAttempts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Aprobados</p>
            <p className="text-3xl font-bold text-green-600">{passedAttempts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Reprobados</p>
            <p className="text-3xl font-bold text-red-600">{totalAttempts - passedAttempts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Promedio General</p>
            <p className="text-3xl font-bold">{avgScore}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Attempts List */}
      {assessment.attempts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Aún no hay intentos. Comparte el link de la evaluación para que las personas la respondan.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {assessment.attempts.map((attempt) => {
            const answersData = attempt.answers as any;
            const grading = answersData?.grading;
            const questionResults = grading?.questionResults || [];
            const rawAnswers = answersData?.rawAnswers || {};

            return (
              <Card key={attempt.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${attempt.passed ? "bg-green-100" : "bg-red-100"}`}>
                        {attempt.passed ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{attempt.participantName}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {new Date(attempt.completedAt).toLocaleDateString("es-CO", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={attempt.passed ? "bg-green-500" : "bg-red-500"}>
                        {attempt.passed ? "Aprobado" : "Reprobado"}
                      </Badge>
                      <span className={`text-2xl font-bold ${attempt.passed ? "text-green-600" : "text-red-600"}`}>
                        {attempt.score}%
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Overall Feedback */}
                  {grading?.overallFeedback && (
                    <div className="bg-slate-50 p-4 rounded-lg mb-4 flex items-start gap-3">
                      <Bot className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-slate-700 mb-1">Evaluación de la IA</p>
                        <p className="text-sm text-slate-600">{grading.overallFeedback}</p>
                      </div>
                    </div>
                  )}

                  {/* Question-by-question results */}
                  <div className="space-y-3">
                    {questions.map((q, qIndex) => {
                      const result = questionResults.find((r: any) => r.questionIndex === qIndex);
                      const answer = rawAnswers[qIndex] || rawAnswers[qIndex.toString()] || "Sin respuesta";
                      const score = result?.score || 0;

                      return (
                        <div key={qIndex} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <p className="font-medium text-sm">
                              <span className="text-muted-foreground">P{qIndex + 1}:</span> {q.question}
                            </p>
                            <Badge variant="outline" className={score >= assessment.passingScore ? "border-green-500 text-green-600" : "border-red-500 text-red-600"}>
                              {score}%
                            </Badge>
                          </div>
                          <div className="bg-white border rounded p-3 mb-2">
                            <p className="text-sm text-slate-700">{answer}</p>
                          </div>
                          {result?.feedback && (
                            <p className="text-xs text-muted-foreground">{result.feedback}</p>
                          )}
                          {result?.suspectedAI && (
                            <div className="flex items-center gap-2 mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Sospecha de IA: {result.aiSuspicionReason}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
