"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardCheck,
  Clock,
  Target,
  HelpCircle,
  Loader2,
  Trophy,
  XCircle,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Send,
} from "lucide-react";

interface AssessmentData {
  id: string;
  title: string;
  description: string | null;
  passingScore: number;
  timeLimit: number | null;
  questions: Array<{ question: string }>;
  questionCount: number;
}

interface GradingResult {
  score: number;
  passed: boolean;
  feedback: string;
  passingScore: number;
  details: Array<{
    questionIndex: number;
    score: number;
    feedback: string;
    suspectedAI: boolean;
    aiSuspicionReason: string | null;
  }>;
}

type ViewState = "loading" | "not_found" | "welcome" | "taking" | "submitting" | "result";

export default function AssessmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [viewState, setViewState] = useState<ViewState>("loading");
  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [participantName, setParticipantName] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<GradingResult | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Load assessment data
  useEffect(() => {
    fetch(`/api/assessments/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        setAssessment(data);
        setViewState("welcome");
      })
      .catch(() => {
        setViewState("not_found");
      });
  }, [id]);

  // Timer
  useEffect(() => {
    if (viewState !== "taking" || timeLeft === null) return;

    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, viewState]);

  const handleStart = () => {
    if (!participantName.trim()) {
      alert("Por favor ingresa tu nombre completo");
      return;
    }
    if (assessment?.timeLimit) {
      setTimeLeft(assessment.timeLimit * 60);
    }
    setViewState("taking");
  };

  const handleSubmit = async () => {
    setViewState("submitting");
    try {
      const response = await fetch(`/api/assessments/${id}/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantName: participantName.trim(),
          answers,
        }),
      });

      if (!response.ok) throw new Error("Submit failed");

      const data = await response.json();
      setResult(data);
      setViewState("result");
    } catch (error) {
      console.error("Error submitting:", error);
      alert("Error al enviar las respuestas. Intenta de nuevo.");
      setViewState("taking");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Loading state
  if (viewState === "loading") {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Not found
  if (viewState === "not_found") {
    return (
      <Card className="border-none shadow-xl rounded-3xl overflow-hidden max-w-xl mx-auto mt-12">
        <CardContent className="p-12 text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Evaluación no encontrada</h2>
          <p className="text-slate-500">
            Este link de evaluación no es válido o la evaluación ya no está disponible.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Welcome screen
  if (viewState === "welcome" && assessment) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
        <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-12 text-center text-white">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
              <ClipboardCheck className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-black mb-3">{assessment.title}</h2>
            {assessment.description && (
              <p className="text-indigo-100 text-lg max-w-xl mx-auto">{assessment.description}</p>
            )}
          </div>

          <CardContent className="p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-slate-50 p-5 rounded-2xl text-center">
                <HelpCircle className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                <p className="text-slate-500 text-xs font-bold uppercase mb-1">Preguntas</p>
                <p className="text-2xl font-black text-slate-800">{assessment.questionCount}</p>
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl text-center">
                <Clock className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                <p className="text-slate-500 text-xs font-bold uppercase mb-1">Tiempo</p>
                <p className="text-2xl font-black text-slate-800">
                  {assessment.timeLimit ? `${assessment.timeLimit} min` : "Sin límite"}
                </p>
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl text-center">
                <Target className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                <p className="text-slate-500 text-xs font-bold uppercase mb-1">Para Aprobar</p>
                <p className="text-2xl font-black text-indigo-600">{assessment.passingScore}%</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  Nombre Completo
                </label>
                <Input
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  placeholder="Ingresa tu nombre completo"
                  className="h-12 rounded-xl text-base border-2 border-slate-200 focus:border-indigo-500"
                  onKeyDown={(e) => e.key === "Enter" && handleStart()}
                />
              </div>

              <Button
                size="lg"
                className="w-full h-14 text-lg rounded-2xl font-bold bg-slate-900 hover:bg-slate-800 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5"
                onClick={handleStart}
                disabled={!participantName.trim()}
              >
                Comenzar Evaluación
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Taking the assessment
  if ((viewState === "taking" || viewState === "submitting") && assessment) {
    const allAnswered = assessment.questions.every(
      (_, index) => answers[index.toString()] && answers[index.toString()].trim().length > 0
    );

    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
        <div className="text-center space-y-2">
          <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-4 py-1 text-sm rounded-full">
            {assessment.title}
          </Badge>
          <h2 className="text-3xl font-extrabold text-slate-800">
            Demuestra tu conocimiento
          </h2>
          <p className="text-slate-500 text-lg">
            Hola <span className="font-bold text-slate-700">{participantName}</span>, responde las siguientes preguntas.
          </p>

          {timeLeft !== null && (
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-lg border-2 ${timeLeft < 60
                ? "bg-red-50 text-red-600 border-red-200 animate-pulse"
                : "bg-blue-50 text-blue-600 border-blue-200"
                }`}
            >
              <Clock className="w-5 h-5" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {assessment.questions.map((question, index) => (
            <Card key={index} className="border-none shadow-lg shadow-slate-100 rounded-2xl overflow-hidden">
              <CardHeader className="bg-slate-50 border-b border-slate-100 pb-6">
                <div className="flex gap-4">
                  <div className="bg-white w-10 h-10 rounded-xl flex items-center justify-center font-black text-indigo-600 shadow-sm border border-slate-100">
                    {index + 1}
                  </div>
                  <CardTitle className="text-xl leading-relaxed text-slate-800">
                    {question.question}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-8">
                <textarea
                  className="flex min-h-[120px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base ring-offset-background placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                  placeholder="Escribe tu respuesta aquí..."
                  value={answers[index.toString()] || ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({
                      ...prev,
                      [index.toString()]: e.target.value,
                    }))
                  }
                  disabled={viewState === "submitting"}
                />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end pt-4 pb-12">
          <Button
            onClick={handleSubmit}
            disabled={!allAnswered || viewState === "submitting"}
            size="lg"
            className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-8 h-14 text-lg shadow-lg shadow-indigo-200 transition-transform hover:scale-105 active:scale-95"
          >
            {viewState === "submitting" ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Evaluando con IA...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Enviar Evaluación
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Result screen
  if (viewState === "result" && result && assessment) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
          <div
            className={`p-12 text-center text-white ${result.passed
              ? "bg-gradient-to-r from-green-500 to-emerald-600"
              : "bg-gradient-to-r from-red-500 to-orange-600"
              }`}
          >
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm shadow-lg">
              {result.passed ? (
                <Trophy className="w-12 h-12 text-white" />
              ) : (
                <XCircle className="w-12 h-12 text-white" />
              )}
            </div>
            <h2 className="text-4xl font-black mb-2">
              {result.passed ? "¡Felicidades!" : "Resultado"}
            </h2>
            <p className="text-white/90 text-lg">
              {result.passed
                ? "Has demostrado un buen dominio del tema."
                : "No has alcanzado el puntaje mínimo requerido."}
            </p>
          </div>

          <CardContent className="p-12 text-center space-y-8">
            <div className="flex justify-center gap-12">
              <div>
                <p className="text-slate-400 text-sm font-bold uppercase mb-1">Tu Calificación</p>
                <p className={`text-5xl font-black ${result.passed ? "text-green-600" : "text-red-600"}`}>
                  {result.score}%
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-sm font-bold uppercase mb-1">Mínimo Requerido</p>
                <p className="text-5xl font-black text-slate-300">{result.passingScore}%</p>
              </div>
            </div>

            {result.feedback && (
              <div className="bg-slate-50 p-6 rounded-2xl text-left">
                <p className="text-sm font-bold text-slate-700 mb-2">Retroalimentación</p>
                <p className="text-slate-600">{result.feedback}</p>
              </div>
            )}

            {/* Per-question results */}
            {result.details && result.details.length > 0 && (
              <div className="space-y-3 text-left">
                <p className="text-sm font-bold text-slate-700">Detalle por Pregunta</p>
                {assessment.questions.map((q, index) => {
                  const detail = result.details.find((d) => d.questionIndex === index);
                  if (!detail) return null;
                  return (
                    <div key={index} className="border rounded-xl p-4">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium text-sm text-slate-700">
                          <span className="text-indigo-600 font-bold">P{index + 1}:</span> {q.question}
                        </p>
                        <Badge
                          variant="outline"
                          className={
                            detail.score >= result.passingScore
                              ? "border-green-500 text-green-600"
                              : "border-red-500 text-red-600"
                          }
                        >
                          {detail.score}%
                        </Badge>
                      </div>
                      {detail.feedback && (
                        <p className="text-xs text-muted-foreground">{detail.feedback}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-slate-400">
            Este resultado ha sido registrado automáticamente. Gracias por participar.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
