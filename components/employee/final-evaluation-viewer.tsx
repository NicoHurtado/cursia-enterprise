"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface FinalEvaluationViewerProps {
  evaluation: {
    id: string;
    questions: Array<{
      question: string;
      idealAnswer: string;
    }>;
    passingScore: number;
  };
  enrollmentId: string;
}

export function FinalEvaluationViewer({
  evaluation,
  enrollmentId,
}: FinalEvaluationViewerProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [passed, setPassed] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = async () => {
    setSubmitted(true);
    setIsGrading(true);

    try {
      // Submit to API for AI Grading
      const response = await fetch(`/api/enrollments/${enrollmentId}/evaluation/${evaluation.id}/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: answers,
        }),
      });

      if (!response.ok) {
        throw new Error("Error submitting evaluation");
      }

      const result = await response.json();

      setScore(result.score);
      setPassed(result.passed);
      setFeedback(result.feedback);

      // Mark enrollment as completed if passed (handled by backend now usually, but keeping for safety)
      if (result.passed) {
        await fetch(`/api/enrollments/${enrollmentId}/complete`, {
          method: "POST",
        });
      }
    } catch (error) {
      console.error("Error submitting evaluation:", error);
      alert("Hubo un error al enviar la evaluación. Por favor intenta de nuevo.");
      setSubmitted(false);
    } finally {
      setIsGrading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evaluación Final</CardTitle>
        <p className="text-sm text-muted-foreground">
          Puntaje mínimo para aprobar: {evaluation.passingScore}%
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {evaluation.questions.map((question, index) => (
          <div key={index} className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-semibold">
              Pregunta {index + 1}: {question.question}
            </h3>
            <div className="space-y-2">
              <Label htmlFor={`q${index}`}>Tu Respuesta</Label>
              <textarea
                id={`q${index}`}
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={answers[index] || ""}
                onChange={(e) =>
                  setAnswers({ ...answers, [index]: e.target.value })
                }
                disabled={submitted}
                placeholder="Escribe tu respuesta aquí..."
              />
            </div>
          </div>
        ))}

        {!submitted && (
          <Button onClick={handleSubmit} className="w-full" size="lg" disabled={Object.keys(answers).length !== evaluation.questions.length}>
            Enviar Evaluación
          </Button>
        )}

        {isGrading && (
          <div className="text-center p-8 space-y-4">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-lg font-medium">La IA está calificando tus respuestas...</p>
          </div>
        )}

        {!isGrading && submitted && score !== null && (
          <div className="p-6 border rounded-lg space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{score}%</div>
              <div className="flex items-center justify-center gap-2 mb-4">
                {passed ? (
                  <>
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                    <span className="text-lg font-semibold text-green-500">
                      ¡Aprobado!
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-6 h-6 text-red-500" />
                    <span className="text-lg font-semibold text-red-500">
                      No Aprobado
                    </span>
                  </>
                )}
              </div>
              {feedback && (
                <div className="bg-slate-50 p-4 rounded-lg text-left text-sm text-slate-700 mb-4">
                  <p className="font-bold mb-1">Retroalimentación de la IA:</p>
                  <p>{feedback}</p>
                </div>
              )}
            </div>
            <Button
              className="w-full"
              onClick={() => router.push("/employee")}
            >
              Volver a Mis Cursos
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

