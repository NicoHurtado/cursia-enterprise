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
    <Card className="border-0 md:border shadow-none md:shadow-sm">
      <CardHeader className="sticky top-0 z-20 bg-white border-b px-4 py-3 md:px-6 md:py-4">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-lg md:text-xl truncate">Evaluación Final</CardTitle>
          <Button onClick={handleSave} disabled={saving} size="sm" className="md:h-10 md:px-4 md:py-2">
            <Save className="w-4 h-4 mr-1.5 md:mr-2" />
            <span className="hidden xs:inline">{saving ? "Guardando..." : "Guardar"}</span>
            <span className="xs:hidden">{saving ? "..." : "OK"}</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-1.5 md:space-y-2">
            <Label className="text-sm">Puntaje Mínimo (%)</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={passingScore}
              onChange={(e) => setPassingScore(Number(e.target.value))}
              className="h-9 md:h-10"
            />
          </div>
          <div className="space-y-1.5 md:space-y-2">
            <Label className="text-sm">Tiempo (minutos)</Label>
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
                className="h-9 md:h-10"
              />
              <span className="text-xs md:text-sm text-muted-foreground whitespace-nowrap">
                {timeLimit ? `${timeLimit}m` : "∞"}
              </span>
            </div>
            <p className="text-[10px] md:text-xs text-muted-foreground italic">
              Vacio = Ilimitado
            </p>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-base md:text-lg font-semibold">Preguntas</h3>
          </div>

          {questions.map((q, index) => (
            <Card key={index} className="bg-slate-50/50">
              <CardHeader className="p-3 md:p-4 border-b bg-white/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm md:text-base font-medium">Pregunta {index + 1}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      const newQuestions = questions.filter((_, i) => i !== index);
                      setQuestions(newQuestions);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4 p-3 md:p-4">
                <div className="space-y-1.5 md:space-y-2">
                  <Label className="text-xs md:text-sm">Enunciado</Label>
                  <Input
                    value={q.question}
                    onChange={(e) => {
                      const newQuestions = [...questions];
                      newQuestions[index].question = e.target.value;
                      setQuestions(newQuestions);
                    }}
                    placeholder="Escribe la pregunta..."
                    className="h-9 md:h-10"
                  />
                </div>
                <div className="space-y-1.5 md:space-y-2">
                  <Label className="text-xs md:text-sm">Respuesta Ideal / Criterios</Label>
                  <textarea
                    className="flex min-h-[80px] md:min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={q.idealAnswer}
                    onChange={(e) => {
                      const newQuestions = [...questions];
                      newQuestions[index].idealAnswer = e.target.value;
                      setQuestions(newQuestions);
                    }}
                    placeholder="La IA usará esto para calificar..."
                  />
                </div>
              </CardContent>
            </Card>
          ))}

          <Button onClick={handleAddQuestion} variant="outline" className="w-full h-10 md:h-12 border-dashed border-2 hover:bg-slate-50">
            <Plus className="w-4 h-4 mr-2" />
            Agregar Pregunta
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

