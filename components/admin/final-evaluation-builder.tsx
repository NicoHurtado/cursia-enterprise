"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Save } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface FinalEvaluationBuilderProps {
  courseId: string;
  initialData?: {
    id: string;
    questions: Array<{
      question: string;
      idealAnswer: string;
    }>;
    passingScore: number;
    timeLimit?: number | null;
  };
  onSaved?: () => void;
}

export function FinalEvaluationBuilder({ courseId, initialData, onSaved }: FinalEvaluationBuilderProps) {
  const [questions, setQuestions] = useState<Array<{
    id?: string;
    question: string;
    idealAnswer: string;
  }>>(initialData?.questions || []);
  const [passingScore, setPassingScore] = useState(initialData?.passingScore || 70);
  const [timeLimit, setTimeLimit] = useState<number | undefined>(initialData?.timeLimit || undefined);
  const [saving, setSaving] = useState(false);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        idealAnswer: "",
      },
    ]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/courses/${courseId}/evaluation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questions,
          passingScore,
          timeLimit,
        }),
      });

      if (response.ok) {
        alert("Evaluación guardada exitosamente");
        if (onSaved) {
          onSaved();
        }
      }
    } catch (error) {
      console.error("Error saving evaluation:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Evaluación Final</CardTitle>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Guardando..." : "Guardar Evaluación"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Puntaje Mínimo de Aprobación (%)</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={passingScore}
              onChange={(e) => setPassingScore(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Límite de Tiempo (minutos)</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="1"
                placeholder="Sin límite"
                value={timeLimit || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setTimeLimit(val ? Number(val) : undefined);
                }}
              />
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {timeLimit ? `${timeLimit} min` : "Ilimitado"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Deja vacío para no poner límite de tiempo.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Preguntas</h3>

          </div>

          {questions.map((q, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Pregunta {index + 1}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const newQuestions = questions.filter((_, i) => i !== index);
                      setQuestions(newQuestions);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Pregunta</Label>
                  <Input
                    value={q.question}
                    onChange={(e) => {
                      const newQuestions = [...questions];
                      newQuestions[index].question = e.target.value;
                      setQuestions(newQuestions);
                    }}
                    placeholder="Escribe la pregunta aquí..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Respuesta Ideal / Criterios de Evaluación</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Describe cuál sería una respuesta correcta. La IA usará esto para calificar al estudiante.
                  </p>
                  <textarea
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={q.idealAnswer}
                    onChange={(e) => {
                      const newQuestions = [...questions];
                      newQuestions[index].idealAnswer = e.target.value;
                      setQuestions(newQuestions);
                    }}
                    placeholder="Ejemplo: La respuesta debe mencionar X, Y y Z..."
                  />
                </div>
              </CardContent>
            </Card>
          ))}

          <Button onClick={handleAddQuestion} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Agregar Pregunta
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

