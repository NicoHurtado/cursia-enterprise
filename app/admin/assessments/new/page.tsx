"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewAssessmentPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Array<{ question: string; idealAnswer: string }>>([
    { question: "", idealAnswer: "" },
  ]);
  const [passingScore, setPassingScore] = useState(70);
  const [timeLimit, setTimeLimit] = useState<number | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  const handleAddQuestion = () => {
    setQuestions([...questions, { question: "", idealAnswer: "" }]);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert("El título es requerido");
      return;
    }
    if (questions.some((q) => !q.question.trim() || !q.idealAnswer.trim())) {
      alert("Todas las preguntas deben tener pregunta y respuesta ideal");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/admin/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          questions,
          passingScore,
          timeLimit,
        }),
      });

      if (response.ok) {
        router.push("/admin/assessments");
        router.refresh();
      } else {
        alert("Error al crear la evaluación");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al crear la evaluación");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/assessments">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Nueva Evaluación</h1>
          <p className="text-muted-foreground">
            Crea una evaluación gratuita para compartir con empresas
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Título de la Evaluación</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Evaluación de Seguridad Informática"
            />
          </div>
          <div className="space-y-2">
            <Label>Descripción (opcional)</Label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción breve de la evaluación..."
            />
          </div>
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
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Preguntas</CardTitle>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Guardando..." : "Guardar Evaluación"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions.map((q, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Pregunta {index + 1}</CardTitle>
                  {questions.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuestions(questions.filter((_, i) => i !== index))}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
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
                    Describe cuál sería una respuesta correcta. La IA usará esto para calificar.
                  </p>
                  <textarea
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
        </CardContent>
      </Card>
    </div>
  );
}
