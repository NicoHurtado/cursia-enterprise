"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, FileText } from "lucide-react";

interface ReportsGeneratorProps {
  data: any[];
}

export function ReportsGenerator({ data }: ReportsGeneratorProps) {
  const [loading, setLoading] = useState(false);

  const handleExportExcel = async () => {
    setLoading(true);
    try {
      // TODO: Implement Excel export
      // For now, we'll create a CSV
      const csv = generateCSV(data);
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reporte-empleados-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
    } catch (error) {
      console.error("Error exporting:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    setLoading(true);
    try {
      // TODO: Implement PDF export
      alert("Exportación PDF próximamente");
    } catch (error) {
      console.error("Error exporting:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateCSV = (data: any[]) => {
    const headers = [
      "Empleado",
      "Email",
      "Curso",
      "Estado",
      "Progreso %",
      "Tiempo Total",
      "Promedio Quizzes",
      "Evaluación Final",
    ];

    const rows = data.flatMap((employee) =>
      employee.enrollments.map((enrollment: any) => {
        const progress =
          enrollment.lessonProgress.length > 0
            ? Math.round(
                (enrollment.lessonProgress.filter((lp: any) => lp.completed)
                  .length /
                  enrollment.lessonProgress.length) *
                  100
              )
            : 0;

        const avgQuiz =
          enrollment.quizAttempts.length > 0
            ? Math.round(
                enrollment.quizAttempts.reduce(
                  (sum: number, q: any) => sum + q.score,
                  0
                ) / enrollment.quizAttempts.length
              )
            : null;

        const finalEval = enrollment.evaluationAttempts[0];

        return [
          employee.name || employee.email,
          employee.email,
          enrollment.course.title,
          enrollment.status,
          progress,
          formatTimeSeconds(enrollment.totalTimeSpent),
          avgQuiz || "N/A",
          finalEval
            ? `${finalEval.score}% (${finalEval.passed ? "Aprobado" : "Reprobado"})`
            : "No completada",
        ];
      })
    );

    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  };

  const formatTimeSeconds = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Button
          onClick={handleExportExcel}
          disabled={loading}
          className="flex-1"
        >
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Exportar Excel (CSV)
        </Button>
        <Button
          onClick={handleExportPDF}
          disabled={loading}
          variant="outline"
          className="flex-1"
        >
          <FileText className="w-4 h-4 mr-2" />
          Exportar PDF
        </Button>
      </div>
      {loading && (
        <p className="text-sm text-muted-foreground">
          Generando reporte...
        </p>
      )}
    </div>
  );
}

