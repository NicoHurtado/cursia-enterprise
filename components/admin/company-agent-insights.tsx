"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CompanyAgentInsightsProps {
  companyId: string;
  companyName: string;
}

interface InsightsData {
  summary: {
    totalQuestions: number;
    totalAnswered: number;
    totalUnresolved: number;
    totalAmbiguous: number;
  };
  topAnswered: Array<{
    id: string;
    canonicalQuestion: string;
    lastAnswer: string | null;
    questionCount: number;
    answeredCount: number;
    lastAskedAt: string;
    topic?: { name: string };
  }>;
  topUnresolved: Array<{
    id: string;
    canonicalQuestion: string;
    questionCount: number;
    unresolvedCount: number;
    lastMode: string | null;
    lastAskedAt: string;
    topic?: { name: string };
  }>;
  topAmbiguous: Array<{
    questionText: string;
    count: number;
    resolvedCount: number;
  }>;
  topTopics: Array<{
    id: string;
    name: string;
    questionCount: number;
    answeredCount: number;
    unresolvedCount: number;
    ambiguousCount: number;
    lastAskedAt: string;
  }>;
}

export function CompanyAgentInsights({ companyId, companyName }: CompanyAgentInsightsProps) {
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  const loadInsights = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/agent-insights?companyId=${encodeURIComponent(companyId)}&days=${days}`
      );
      if (res.ok) {
        const data = await res.json();
        setInsights(data);
      }
    } catch (error) {
      console.error("Error loading insights:", error);
    } finally {
      setLoading(false);
    }
  }, [companyId, days]);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  if (loading && !insights) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Cargando insights del agente...</p>
      </div>
    );
  }

  const data = insights ?? {
    summary: { totalQuestions: 0, totalAnswered: 0, totalUnresolved: 0, totalAmbiguous: 0 },
    topAnswered: [],
    topUnresolved: [],
    topAmbiguous: [],
    topTopics: [],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Preguntas frecuentes, vacíos de respuesta y ambigüedades del agente de {companyName}.
        </p>
        <select
          className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
        >
          <option value={7}>Últimos 7 días</option>
          <option value={30}>Últimos 30 días</option>
          <option value={60}>Últimos 60 días</option>
          <option value={90}>Últimos 90 días</option>
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Preguntas Totales</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{data.summary.totalQuestions}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Respondidas</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-emerald-600">
            {data.summary.totalAnswered}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Sin respuesta clara</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-amber-600">
            {data.summary.totalUnresolved}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Ambiguas</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-violet-600">
            {data.summary.totalAmbiguous}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top preguntas comunes con respuesta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.topAnswered.length === 0 && (
              <p className="text-sm text-muted-foreground">Aún no hay suficientes datos.</p>
            )}
            {data.topAnswered.map((item) => (
              <div key={item.id} className="rounded-md border p-3">
                <p className="text-sm font-medium">{item.canonicalQuestion}</p>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {item.lastAnswer || "Sin última respuesta registrada"}
                </p>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {item.questionCount} veces
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top preguntas comunes sin respuesta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.topUnresolved.length === 0 && (
              <p className="text-sm text-muted-foreground">Aún no hay suficientes datos.</p>
            )}
            {data.topUnresolved.map((item) => (
              <div key={item.id} className="rounded-md border p-3">
                <p className="text-sm font-medium">{item.canonicalQuestion}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Tema: {item.topic?.name || "General"} · sin resolver: {item.unresolvedCount}
                </p>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {item.questionCount} veces
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ambigüedades más comunes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.topAmbiguous.length === 0 && (
              <p className="text-sm text-muted-foreground">Aún no hay ambigüedades registradas.</p>
            )}
            {data.topAmbiguous.map((item) => (
              <div key={item.questionText} className="rounded-md border p-3">
                <p className="text-sm font-medium">{item.questionText}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Ocurrencias: {item.count} · resueltas por usuario: {item.resolvedCount}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Temas más consultados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.topTopics.length === 0 && (
              <p className="text-sm text-muted-foreground">Aún no hay temas detectados.</p>
            )}
            {data.topTopics.map((topic) => (
              <div key={topic.id} className="rounded-md border p-3">
                <p className="text-sm font-semibold">{topic.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Preguntas: {topic.questionCount} · Respondidas: {topic.answeredCount} ·
                  Ambiguas: {topic.ambiguousCount}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
