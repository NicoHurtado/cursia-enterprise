"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bot, CheckCircle2, XCircle, Info, BrainCircuit, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface QuestionResult {
  questionIndex: number;
  score: number;
  feedback: string;
  suspectedAI?: boolean;
  aiSuspicionReason?: string;
}

interface EvaluationAnalysisProps {
  score: number;
  passed: boolean;
  aiScore?: number | null;
  aiReasoning?: string | null;
  answers: any;
  questions: any[];
  userName: string;
}

export function EvaluationAnalysis({
  score,
  passed,
  aiScore,
  aiReasoning,
  answers,
  questions,
  userName,
}: EvaluationAnalysisProps) {
  const normalizedResults: QuestionResult[] = answers?.grading?.questionResults ||
    (answers as any)?.gradingDetails?.map((item: any) => ({
      questionIndex: item.questionId,
      score: item.aiScore,
      feedback: item.feedback,
      suspectedAI: false,
    })) || [];

  const overallFeedback = answers?.grading?.overallFeedback || "Feedback no disponible.";
  const rawAnswers = answers?.rawAnswers || {};

  const getAnswer = (idx: number) => {
    if (Array.isArray(rawAnswers)) return rawAnswers[idx];
    return (rawAnswers as any)[idx.toString()] || (rawAnswers as any)[idx] || "Sin respuesta";
  };

  const suspiciousCount = normalizedResults.filter(q => q.suspectedAI).length;
  const totalQuestions = questions.length || 1;
  const aiProbability = Math.round((suspiciousCount / totalQuestions) * 100);

  return (
    <div className="space-y-6">
      {/* Metrics Header */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Score Card */}
        <Card className="border-none shadow-sm bg-slate-900 text-white rounded-3xl overflow-hidden">
          <CardHeader className="pb-2 pt-6">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nota Final</CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black">{score}%</span>
              <Badge className={`ml-2 ${passed ? 'bg-emerald-500' : 'bg-red-500'} border-none uppercase text-[9px]`}>
                {passed ? 'Aprobado' : 'Reprobado'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* AI Probability Card */}
        <Card className={`border-none shadow-sm rounded-3xl ${aiProbability > 30 ? 'bg-red-50/50' : 'bg-green-50/50'}`}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${aiProbability > 30 ? 'text-red-700' : 'text-green-700'}`}>
              <Bot className="w-4 h-4" /> Probabilidad IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-black ${aiProbability > 30 ? 'text-red-900' : 'text-green-900'}`}>{aiProbability}%</span>
              <span className={`text-[10px] font-bold uppercase tracking-tighter ${aiProbability > 30 ? 'text-red-600' : 'text-green-600'}`}>Sospecha de Fraude</span>
            </div>
          </CardContent>
        </Card>

        {/* Highlighted Questions Card */}
        <Card className={`border-none shadow-sm rounded-3xl ${suspiciousCount > 0 ? 'bg-amber-50/50' : 'bg-slate-50/50'}`}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${suspiciousCount > 0 ? 'text-amber-700' : 'text-slate-700'}`}>
              <AlertTriangle className="w-4 h-4" /> Preguntas Flagueadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-black ${suspiciousCount > 0 ? 'text-amber-900' : 'text-slate-900'}`}>
                {suspiciousCount} / {totalQuestions}
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-tighter ${suspiciousCount > 0 ? 'text-amber-600' : 'text-slate-500'}`}>Alertas de Sistema</span>
            </div>
          </CardContent>
        </Card>
      </div>



      {/* Main Stats Alert */}
      {suspiciousCount > 0 && (
        <Alert variant="destructive" className="border-amber-200 bg-amber-50 text-amber-900 rounded-2xl">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <AlertTitle className="font-bold">Advertencia de Integridad</AlertTitle>
          <AlertDescription className="text-amber-800 text-sm mt-1">
            Se han detectado {suspiciousCount} respuestas con alta probabilidad de haber sido generadas o asistidas por IA externa. Por favor, revise manualmente el razonamiento del estudiante.
          </AlertDescription>
        </Alert>
      )}

      {/* Overall Feedback */}
      <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-3">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#0066FF]" /> Feedback del Experto IA
        </h3>
        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
          {overallFeedback}
        </p>
      </div>

      {/* Question Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800 px-1">Desglose por Pregunta</h3>
        {questions.map((q, idx) => {
          const result = normalizedResults.find(r => r.questionIndex === idx) || normalizedResults[idx];
          const studentAnswer = getAnswer(idx);
          const isSuspicious = result?.suspectedAI;

          return (
            <div key={idx} className={`p-6 rounded-[2rem] border transition-all ${isSuspicious ? 'border-amber-200 bg-amber-50/20 shadow-amber-100/50' : 'border-slate-100 bg-white shadow-sm'}`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Pregunta {idx + 1}
                  </div>
                  <h4 className="font-bold text-slate-900 text-lg">{q.text}</h4>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {isSuspicious && (
                    <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200 gap-1 font-bold">
                      <Bot className="w-3 h-3" /> IA DETECTADA
                    </Badge>
                  )}
                  <Badge className={`font-bold ${result?.score >= 70 ? 'bg-green-500' : 'bg-red-500'}`}>
                    {result?.score || 0}/100
                  </Badge>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Respuesta del Estudiante</span>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm text-slate-700 leading-relaxed italic">
                    "{studentAnswer}"
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Análisis y Retroalimentación</span>
                  <div className="p-4 rounded-2xl bg-blue-50/30 border border-blue-100/30 text-sm text-slate-600 leading-relaxed">
                    {result?.feedback || "Sin comentarios adicionales."}
                    {isSuspicious && result?.aiSuspicionReason && (
                      <div className="mt-3 pt-3 border-t border-blue-100/50 text-[11px] font-bold text-amber-700 flex items-start gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 mt-0.5" />
                        <span>Sospecha: {result.aiSuspicionReason}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
