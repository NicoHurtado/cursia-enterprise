"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, X, Sparkles } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Question {
  id: string;
  question: string;
  options: Array<{ text: string; isCorrect: boolean }>;
  explanation: string | null;
}

interface QuizBuilderProps {
  lessonId: string;
  quizzes: Array<{
    id: string;
    question: string;
    options: any;
    explanation: string | null;
  }>;
  onUpdate: () => void;
}

export function QuizBuilder({ lessonId, quizzes, onUpdate }: QuizBuilderProps) {
  // Treat all quizzes as questions in a single quiz
  const [questions, setQuestions] = useState<Question[]>(
    quizzes.map((q) => ({
      id: q.id,
      question: q.question,
      options: Array.isArray(q.options) ? q.options : [],
      explanation: q.explanation,
    }))
  );
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});

  // AI Generation State
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [numQuestions, setNumQuestions] = useState(3);
  const [aiInstructions, setAiInstructions] = useState("");

  const handleGenerateQuiz = async () => {
    setIsGenerating(true);
    setIsAiDialogOpen(false);
    try {
      const response = await fetch("/api/admin/ai/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          numQuestions,
          additionalInstructions: aiInstructions,
        }),
      });

      if (response.ok) {
        onUpdate();
        setAiInstructions("");
      } else {
        console.error("Failed to generate quiz");
      }
    } catch (error) {
      console.error("Error generating quiz:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Sync with props when they change (only if different)
  // Sync with props when they change (only if content is different)
  const prevQuizzesRef = useRef(JSON.stringify(quizzes));

  useEffect(() => {
    const quizzesJson = JSON.stringify(quizzes);
    if (prevQuizzesRef.current !== quizzesJson) {
      const newQuestions = quizzes.map((q) => ({
        id: q.id,
        question: q.question,
        options: Array.isArray(q.options) ? q.options : [],
        explanation: q.explanation,
      }));
      setQuestions(newQuestions);
      prevQuizzesRef.current = quizzesJson;
    }
  }, [quizzes]);

  const handleCreateQuestion = async () => {
    try {
      const response = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          question: "Nueva pregunta",
          options: [
            { text: "Opción 1", isCorrect: false },
            { text: "Opción 2", isCorrect: false },
          ],
          order: questions.length,
        }),
      });

      if (response.ok) {
        const newQuestion = await response.json();
        setQuestions((prev) => [
          ...prev,
          {
            id: newQuestion.id,
            question: newQuestion.question,
            options: Array.isArray(newQuestion.options) ? newQuestion.options : [],
            explanation: newQuestion.explanation,
          },
        ]);
        onUpdate();
      }
    } catch (error) {
      console.error("Error creating question:", error);
    }
  };

  // Refs to track latest state for save-on-unmount
  const questionsRef = useRef(questions);
  useEffect(() => { questionsRef.current = questions; }, [questions]);

  // Handle Updates
  const handleUpdateQuestion = useCallback(
    async (questionId: string, data: Partial<Question>, immediate = false) => {
      // Update local state immediately (optimistic update)
      setQuestions((prev) =>
        prev.map((q) => (q.id === questionId ? { ...q, ...data } : q))
      );

      // Clear existing debounce timer for this question
      if (debounceTimers.current[questionId]) {
        clearTimeout(debounceTimers.current[questionId]);
      }

      const saveToServer = async () => {
        setSaving((prev) => ({ ...prev, [questionId]: true }));
        try {
          // Get latest data from ref to ensure we save current state
          const currentQuestion = questionsRef.current.find(q => q.id === questionId);
          if (!currentQuestion) return;

          // Merge current data with update (if any specific data passed, though usually we trust state)
          // Actually, 'data' is already merged into state. We should save the *current state* of the question.
          // But `data` might be partial. The state is the source of truth.
          // Construct payload from currentQuestion (which has the latest updates applied above)
          const payload = {
            question: currentQuestion.question,
            options: currentQuestion.options, // Ensure logic uses current options
            explanation: currentQuestion.explanation
          };

          const response = await fetch(`/api/quizzes/${questionId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (response.ok) {
            if (immediate) {
              onUpdate();
            }
          } else {
            // Handle error - ideally revert but complex with unmount
            console.error("Failed to save quiz question");
          }
        } catch (error) {
          console.error("Error updating question:", error);
        } finally {
          setSaving((prev) => ({ ...prev, [questionId]: false }));
          delete debounceTimers.current[questionId];
        }
      };

      if (immediate) {
        await saveToServer();
      } else {
        // Debounce text changes (3 seconds)
        debounceTimers.current[questionId] = setTimeout(saveToServer, 3000);
      }
    },
    [onUpdate]
  );

  // Save all pending changes on unmount
  useEffect(() => {
    return () => {
      // For each active timer, force a save immediately
      Object.keys(debounceTimers.current).forEach((questionId) => {
        const timer = debounceTimers.current[questionId];
        clearTimeout(timer); // Cancel the async timer

        // Perform synchronous-like save (fire and forget)
        const currentQuestion = questionsRef.current.find(q => q.id === questionId);
        if (currentQuestion) {
          // We use fetch with keepalive if possible, or just standard fetch
          // Note: changing headers or body might range. Simplest is to copy logic.
          const payload = {
            question: currentQuestion.question,
            options: currentQuestion.options,
            explanation: currentQuestion.explanation
          };

          fetch(`/api/quizzes/${questionId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            keepalive: true // Important for unmount
          }).catch(err => console.error("Unmount save failed", err));
        }
      });
    };
  }, []);

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("¿Estás seguro de eliminar esta pregunta?")) return;

    // Optimistic update
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));

    try {
      const response = await fetch(`/api/quizzes/${questionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onUpdate();
      } else {
        // Revert on error
        const originalQuestions = quizzes.map((q) => ({
          id: q.id,
          question: q.question,
          options: Array.isArray(q.options) ? q.options : [],
          explanation: q.explanation,
        }));
        setQuestions(originalQuestions);
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      // Revert on error
      const originalQuestions = quizzes.map((q) => ({
        id: q.id,
        question: q.question,
        options: Array.isArray(q.options) ? q.options : [],
        explanation: q.explanation,
      }));
      setQuestions(originalQuestions);
    }
  };

  const handleAddOption = (questionId: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;

    const newOptions = [...question.options, { text: "", isCorrect: false }];
    handleUpdateQuestion(questionId, { options: newOptions }, true);
  };

  const handleRemoveOption = (questionId: string, index: number) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question || question.options.length <= 1) return;

    const newOptions = question.options.filter((_, i) => i !== index);
    handleUpdateQuestion(questionId, { options: newOptions }, true);
  };

  const handleOptionChange = (
    questionId: string,
    index: number,
    field: "text" | "isCorrect",
    value: string | boolean
  ) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;

    const newOptions = [...question.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    // Text changes are debounced, checkbox changes are immediate
    handleUpdateQuestion(questionId, { options: newOptions }, field === "isCorrect");
  };

  const handleQuestionChange = (questionId: string, value: string) => {
    handleUpdateQuestion(questionId, { question: value }, false);
  };

  const handleExplanationChange = (questionId: string, value: string) => {
    handleUpdateQuestion(questionId, { explanation: value || null }, false);
  };



  return (
    <div className="space-y-4">
      <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generar Quiz con AI</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="num-questions">Número de Preguntas</Label>
              <Input
                id="num-questions"
                type="number"
                min={1}
                max={10}
                value={numQuestions}
                onChange={(e) => setNumQuestions(parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quiz-instructions">Instrucciones Adicionales (Opcional)</Label>
              <Textarea
                id="quiz-instructions"
                placeholder="Ej: Enfócate en conceptos clave, hazlas difíciles..."
                value={aiInstructions}
                onChange={(e) => setAiInstructions(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAiDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleGenerateQuiz} disabled={isGenerating}>
              <Sparkles className="w-4 h-4 mr-2" />
              Generar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Quiz de la Lección</h3>
          <p className="text-sm text-muted-foreground">
            Agrega preguntas al quiz de esta lección
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={isGenerating}
            onClick={() => setIsAiDialogOpen(true)}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isGenerating ? "Generando..." : "Generar con AI"}
          </Button>

          <Button onClick={handleCreateQuestion} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Agregar Pregunta
          </Button>
        </div>
      </div>

      {questions.map((question, questionIndex) => (
        <Card key={question.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Pregunta {questionIndex + 1}
              </CardTitle>
              <div className="flex items-center gap-2">
                {saving[question.id] && (
                  <span className="text-xs text-muted-foreground">
                    Guardando...
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteQuestion(question.id)}
                  disabled={saving[question.id]}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Pregunta</Label>
              <Input
                value={question.question}
                onChange={(e) => handleQuestionChange(question.id, e.target.value)}
                placeholder="Escribe tu pregunta aquí..."
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Opciones de Respuesta</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddOption(question.id)}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Agregar Opción
                </Button>
              </div>
              {question.options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Checkbox
                    checked={option.isCorrect}
                    onCheckedChange={(checked) =>
                      handleOptionChange(
                        question.id,
                        index,
                        "isCorrect",
                        checked as boolean
                      )
                    }
                  />
                  <Input
                    value={option.text}
                    onChange={(e) =>
                      handleOptionChange(question.id, index, "text", e.target.value)
                    }
                    placeholder={`Opción ${index + 1}`}
                    className="flex-1"
                  />
                  {question.options.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveOption(question.id, index)}
                      disabled={saving[question.id]}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              {question.options.every((opt) => !opt.isCorrect) && (
                <p className="text-xs text-destructive">
                  ⚠️ Debes marcar al menos una opción como correcta
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Explicación (Opcional)</Label>
              <Input
                value={question.explanation || ""}
                onChange={(e) => handleExplanationChange(question.id, e.target.value)}
                placeholder="Explicación de la respuesta correcta..."
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {questions.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">
              No hay preguntas en este quiz. Agrega la primera pregunta.
            </p>
            <Button onClick={handleCreateQuestion}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Primera Pregunta
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
