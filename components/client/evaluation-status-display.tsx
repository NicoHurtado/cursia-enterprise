"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bot, Eye } from "lucide-react";

interface EvaluationStatusDisplayProps {
  score: number;
  passed: boolean;
  aiScore?: number | null;
  aiReasoning?: string | null;
  answers: {
    rawAnswers: string[];
    grading: {
      questionResults: Array<{
        questionIndex: number;
        score: number;
        feedback: string;
        suspectedAI?: boolean;
        aiSuspicionReason?: string;
      }>;
      overallFeedback: string;
      overallScore: number;
    };
  };
  userName: string;
  courseTitle: string;
}

export function EvaluationStatusDisplay({
  score,
  passed,
  aiScore,
  aiReasoning,
  answers,
  userName,
  courseTitle,
}: EvaluationStatusDisplayProps) {
  const [open, setOpen] = useState(false);
  const isAISuspicious = (aiScore || 0) >= 70;

  // Normalize results to handle different data structures
  const normalizedResults = answers?.grading?.questionResults ||
    (answers as any)?.gradingDetails?.map((item: any) => ({
      questionIndex: item.questionId,
      score: item.aiScore,
      feedback: item.feedback,
      suspectedAI: false, // Legacy structure doesn't support this per question
      aiSuspicionReason: null
    })) || [];

  const overallFeedback = answers?.grading?.overallFeedback || "Feedback no disponible.";
  const rawAnswers = answers?.rawAnswers || {};

  // Calculate if any specific question is flagged
  const hasFlaggedQuestions = normalizedResults.some(
    (q) => q.suspectedAI
  );

  const showWarning = isAISuspicious || hasFlaggedQuestions;

  const cleanReasoning = aiReasoning && aiReasoning.includes("P0: undefined")
    ? "Se han detectado múltiples indicadores de uso de IA en las respuestas."
    : aiReasoning;

  // Helper to get answer text safely (handles array or object/map)
  const getAnswer = (idx: number) => {
    if (Array.isArray(rawAnswers)) return rawAnswers[idx];
    return (rawAnswers as any)[idx.toString()] || (rawAnswers as any)[idx] || "No response";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={`h-auto flex flex-col items-start gap-1 p-3 w-full hover:bg-muted/50 ${showWarning ? "border-amber-300 bg-amber-50/50 hover:bg-amber-100/50" : ""
            }`}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span
                className={`text-xl font-bold ${passed ? "text-green-600" : "text-red-600"
                  }`}
              >
                {score}%
              </span>
              <Badge
                variant={passed ? "default" : "destructive"}
                className="text-xs"
              >
                {passed ? "Aprobado" : "Reprobado"}
              </Badge>
            </div>
            <Eye className="w-4 h-4 text-muted-foreground" />
          </div>

          {showWarning && (
            <div className="flex items-center gap-1.5 mt-1 text-amber-700 text-xs font-bold w-full text-left">
              <Bot className="w-3.5 h-3.5" />
              <span>SOSPECHA DE IA {aiScore ? `(${aiScore}%)` : ""}</span>
            </div>
          )}

          <span className="text-xs text-muted-foreground mt-1 w-full text-left">Click para ver detalles</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Detalle de Evaluación Final</DialogTitle>
          <DialogDescription>
            {userName} - {courseTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4 min-h-0">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="space-y-1">
              <p className="text-sm font-medium">Nota Final</p>
              <p className="text-2xl font-bold">{score}%</p>
            </div>
            <Badge variant={passed ? "default" : "destructive"}>
              {passed ? "Aprobado" : "Reprobado"}
            </Badge>
          </div>

          {showWarning && (
            <Alert variant="destructive" className="bg-amber-50 border-amber-200 text-amber-900">
              <Bot className="h-4 w-4 text-amber-900" />
              <AlertTitle className="text-amber-900">Advertencia de Integridad Académica</AlertTitle>
              <AlertDescription className="text-amber-800 text-xs mt-1">
                {cleanReasoning || "Se ha detectado contenido que podría haber sido generado por inteligencia artificial."}
              </AlertDescription>
            </Alert>
          )}

          <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-900">
            <p className="font-semibold mb-1">Feedback General:</p>
            {overallFeedback}
          </div>

          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6">
              {normalizedResults.map((result, idx) => (
                <div key={idx} className={`border rounded-lg p-4 space-y-3 ${result.suspectedAI ? 'border-amber-200 bg-amber-50/30' : ''}`}>
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Pregunta {idx + 1}</h4>
                    <div className="flex items-center gap-2">
                      {result.suspectedAI && (
                        <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50 gap-1">
                          <Bot className="w-3 h-3" /> IA Detectada
                        </Badge>
                      )}
                      <Badge variant="outline">Puntaje: {result.score}/100</Badge>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground font-medium">Respuesta del estudiante:</p>
                    <p className="text-sm bg-muted p-2 rounded">{getAnswer(result.questionIndex ?? idx)}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground font-medium">Feedback:</p>
                    <p className="text-sm">{result.feedback}</p>
                  </div>

                  {result.suspectedAI && (
                    <Alert variant="destructive" className="bg-amber-50 border-amber-200">
                      <Bot className="h-4 w-4 text-amber-700" />
                      <AlertTitle className="text-amber-800">Sospecha de IA</AlertTitle>
                      <AlertDescription className="text-xs mt-1 text-amber-800">
                        {result.aiSuspicionReason || "El patrón de escritura sugiere uso de herramientas de IA."}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
