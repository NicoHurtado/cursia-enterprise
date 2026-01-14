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

interface Employee {
  id: string;
  name: string | null;
  email: string;
  enrollments: Array<{
    id: string;
    status: string;
    totalTimeSpent: number;
    course: { title: string };
    moduleProgress: Array<{ completed: boolean }>;
    lessonProgress: Array<{ completed: boolean }>;
    quizAttempts: Array<{ score: number }>;
    evaluationAttempts: Array<{ score: number; passed: boolean }>;
  }>;
}

interface EmployeeTableProps {
  employees: Employee[];
}

export function EmployeeTable({ employees }: EmployeeTableProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  const getEnrollmentStatus = (status: string) => {
    const statusMap = {
      NOT_STARTED: { label: "No Iniciado", color: "bg-gray-500" },
      IN_PROGRESS: { label: "En Curso", color: "bg-yellow-500" },
      COMPLETED: { label: "Completado", color: "bg-green-500" },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.NOT_STARTED;
  };

  const calculateProgress = (enrollment: Employee["enrollments"][0]) => {
    const totalLessons = enrollment.lessonProgress.length;
    const completedLessons = enrollment.lessonProgress.filter(
      (lp) => lp.completed
    ).length;
    return totalLessons > 0
      ? formatPercentage(completedLessons, totalLessons)
      : 0;
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
                        <span className="text-sm">
                          {finalEval.score}%
                        </span>
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
                        onClick={() => setSelectedEmployee(employee.id)}
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
    </div>
  );
}

