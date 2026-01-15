"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Download, Eye } from "lucide-react";
import { formatTime, formatPercentage } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Bot } from "lucide-react";

interface Employee {
  id: string;
  name: string | null;
  email: string;
  enrollments: Array<{
    id: string;
    status: string;
    totalTimeSpent: number;
    course: {
      title: string;
      modules: Array<{
        _count: { lessons: number }
      }>;
    };
    moduleProgress: Array<{ completed: boolean }>;
    lessonProgress: Array<{ completed: boolean }>;
    quizAttempts: Array<{ score: number }>;
    evaluationAttempts: Array<{
      score: number;
      passed: boolean;
      aiScore?: number | null;
      answers: any;
    }>;
  }>;
}

interface EvaluationDetail {
  questionIndex: number;
  score: number;
  feedback: string;
  suspectedAI?: boolean;
  aiSuspicionReason?: string;
}

interface GradingResult {
  questionResults: EvaluationDetail[];
  overallFeedback: string;
  overallScore: number;
}

interface EmployeeTableProps {
  employees: Employee[];
}

export function EmployeeTable({ employees }: EmployeeTableProps) {
  const [selectedEvaluation, setSelectedEvaluation] = useState<{
    userName: string;
    courseTitle: string;
    score: number;
    passed: boolean;
    answers: { rawAnswers: string[], grading: GradingResult }
  } | null>(null);

  const getEnrollmentStatus = (status: string) => {
    const statusMap = {
      NOT_STARTED: { label: "No Iniciado", color: "bg-gray-500" },
      IN_PROGRESS: { label: "En Curso", color: "bg-yellow-500" },
      COMPLETED: { label: "Completado", color: "bg-green-500" },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.NOT_STARTED;
  };

  const calculateProgress = (enrollment: Employee["enrollments"][0]) => {
    const totalLessons = enrollment.course.modules.reduce(
      (acc, mod) => acc + mod._count.lessons,
      0
    );
    const completedLessons = enrollment.lessonProgress.filter(
      (lp) => lp.completed
    ).length;
    return formatPercentage(completedLessons, totalLessons);
  };

  const getAverageQuizScore = (enrollment: Employee["enrollments"][0]) => {
    if (enrollment.quizAttempts.length === 0) return null;
    const total = enrollment.quizAttempts.reduce(
      (sum, attempt) => sum + attempt.score,
      0
    );
    return Math.round(total / enrollment.quizAttempts.length);
  };

  const handleExport = async (employeeId: string) => {
    // TODO: Implement export functionality
    alert("Función de exportación próximamente");
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Empleado</TableHead>
            <TableHead>Curso</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Progreso</TableHead>
            <TableHead>Tiempo</TableHead>
            <TableHead>Promedio Quizzes</TableHead>
            <TableHead>Evaluación Final</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) =>
            employee.enrollments.map((enrollment) => {
              const status = getEnrollmentStatus(enrollment.status);
              const progress = calculateProgress(enrollment);
              const avgQuizScore = getAverageQuizScore(enrollment);
              const finalEval = enrollment.evaluationAttempts[0];

              return (
                <TableRow key={enrollment.id}>
                  <TableCell className="font-medium">
                    {employee.name || employee.email}
                  </TableCell>
                  <TableCell>{enrollment.course.title}</TableCell>
                  <TableCell>
                    <Badge className={status.color}>{status.label}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Progress value={progress} className="w-24" />
                      <span className="text-sm text-muted-foreground">
                        {progress}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatTime(enrollment.totalTimeSpent)}
                  </TableCell>
                  <TableCell>
                    {avgQuizScore !== null ? `${avgQuizScore}%` : "N/A"}
                  </TableCell>
                  <TableCell>
                    {finalEval ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <span className="text-sm">
                            {finalEval.score}%
                          </span>
                          {finalEval.aiScore && finalEval.aiScore >= 70 && (
                            <span title={`Sospecha de IA: ${finalEval.aiScore}%`} className="cursor-help">
                              ⚠️
                            </span>
                          )}
                        </div>
                        <Badge
                          className={
                            finalEval.passed
                              ? "bg-green-500"
                              : "bg-red-500"
                          }
                        >
                          {finalEval.passed ? "Aprobado" : "Reprobado"}
                        </Badge>
                      </div>
                    ) : (
                      "No completada"
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (finalEval) {
                            setSelectedEvaluation({
                              userName: employee.name || employee.email,
                              courseTitle: enrollment.course.title,
                              score: finalEval.score,
                              passed: finalEval.passed,
                              answers: finalEval.answers as any,
                            });
                          }
                        }}
                        disabled={!finalEval}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleExport(employee.id)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {employees.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No hay empleados registrados
        </div>
      )}

      <Dialog open={!!selectedEvaluation} onOpenChange={(open) => !open && setSelectedEvaluation(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Detalle de Evaluación Final</DialogTitle>
            <DialogDescription>
              {selectedEvaluation?.userName} - {selectedEvaluation?.courseTitle}
            </DialogDescription>
          </DialogHeader>

          {selectedEvaluation && (
            <div className="flex-1 overflow-hidden flex flex-col gap-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Nota Final</p>
                  <p className="text-2xl font-bold">{selectedEvaluation.score}%</p>
                </div>
                <Badge variant={selectedEvaluation.passed ? "default" : "destructive"}>
                  {selectedEvaluation.passed ? "Aprobado" : "Reprobado"}
                </Badge>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-900">
                <p className="font-semibold mb-1">Feedback General:</p>
                {selectedEvaluation.answers.grading.overallFeedback}
              </div>

              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-6">
                  {selectedEvaluation.answers.grading.questionResults?.map((result, idx) => (
                    <div key={idx} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">Pregunta {idx + 1}</h4>
                        <Badge variant="outline">Puntaje: {result.score}/100</Badge>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground font-medium">Respuesta del estudiante:</p>
                        <p className="text-sm bg-muted p-2 rounded">{selectedEvaluation.answers.rawAnswers[idx]}</p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground font-medium">Feedback:</p>
                        <p className="text-sm">{result.feedback}</p>
                      </div>

                      {result.suspectedAI && (
                        <Alert variant="destructive" className="bg-red-50 border-red-200">
                          <Bot className="h-4 w-4" />
                          <AlertTitle>Sospecha de contenido generado por IA</AlertTitle>
                          <AlertDescription className="text-xs mt-1">
                            {result.aiSuspicionReason || "El patrón de escritura sugiere uso de herramientas de IA."}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div >
  );
}

