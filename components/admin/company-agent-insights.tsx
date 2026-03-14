"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  FileText,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ExternalLink,
  Shield,
} from "lucide-react";

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
  modeBreakdown: {
    internalPercent: number;
    externalPercent: number;
    grounded: number;
    fallback: number;
    image: number;
  };
  documentStats: {
    mostConsulted: { title: string; count: number }[];
    leastConsulted: { title: string; count: number }[];
  };
  feedbackStats: {
    total: number;
    helpful: number;
    notHelpful: number;
    helpfulPercent: number;
    fallbackTotal: number;
    fallbackHelpful: number;
    negativeComments: string[];
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

const EMPTY: InsightsData = {
  summary: { totalQuestions: 0, totalAnswered: 0, totalUnresolved: 0, totalAmbiguous: 0 },
  modeBreakdown: { internalPercent: 0, externalPercent: 0, grounded: 0, fallback: 0, image: 0 },
  documentStats: { mostConsulted: [], leastConsulted: [] },
  feedbackStats: { total: 0, helpful: 0, notHelpful: 0, helpfulPercent: 0, fallbackTotal: 0, fallbackHelpful: 0, negativeComments: [] },
  topAnswered: [],
  topUnresolved: [],
  topAmbiguous: [],
  topTopics: [],
};

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
      if (res.ok) setInsights(await res.json());
    } catch (error) {
      console.error("Error loading insights:", error);
    } finally {
      setLoading(false);
    }
  }, [companyId, days]);

  useEffect(() => { loadInsights(); }, [loadInsights]);

  if (loading && !insights) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Cargando analytics del agente...</p>
      </div>
    );
  }

  const d = insights ?? EMPTY;
  const { summary, modeBreakdown: mode, documentStats: docs, feedbackStats: fb } = d;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          Analytics del agente de <strong>{companyName}</strong>
        </p>
        <select
          className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
        >
          <option value={7}>7 días</option>
          <option value={30}>30 días</option>
          <option value={60}>60 días</option>
          <option value={90}>90 días</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<MessageCircle className="w-4 h-4" />} label="Preguntas" value={summary.totalQuestions} color="text-blue-600" bg="bg-blue-50" />
        <StatCard icon={<Shield className="w-4 h-4" />} label="Respondidas" value={summary.totalAnswered} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard icon={<ExternalLink className="w-4 h-4" />} label="Info externa" value={summary.totalUnresolved} color="text-amber-600" bg="bg-amber-50" />
        <StatCard icon={<AlertTriangle className="w-4 h-4" />} label="Ambiguas" value={summary.totalAmbiguous} color="text-violet-600" bg="bg-violet-50" />
      </div>

      {/* Source Breakdown + Feedback */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-500" /> Origen de las respuestas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <BarRow label="Documentos internos" value={mode.grounded} percent={mode.internalPercent} color="bg-emerald-500" />
            <BarRow label="Info externa (fallback)" value={mode.fallback} percent={mode.externalPercent} color="bg-amber-500" />
            {mode.image > 0 && (
              <BarRow label="Análisis de imagen" value={mode.image} percent={summary.totalQuestions > 0 ? Math.round((mode.image / summary.totalQuestions) * 100) : 0} color="bg-blue-500" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <ThumbsUp className="w-4 h-4 text-emerald-500" /> Feedback de empleados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {fb.total === 0 ? (
              <p className="text-sm text-muted-foreground">Aún no hay feedback registrado.</p>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-emerald-600">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span className="text-2xl font-bold">{fb.helpfulPercent}%</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <p>{fb.helpful} útiles · {fb.notHelpful} no útiles de {fb.total} total</p>
                    {fb.fallbackTotal > 0 && (
                      <p className="mt-0.5">Info externa: {fb.fallbackHelpful}/{fb.fallbackTotal} considerada útil</p>
                    )}
                  </div>
                </div>
                {fb.negativeComments.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Comentarios negativos recientes</p>
                    {fb.negativeComments.slice(0, 5).map((c, i) => (
                      <div key={i} className="flex items-start gap-1.5 mb-1">
                        <ThumbsDown className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground">{c}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Document Stats */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" /> Documentos más consultados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {docs.mostConsulted.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aún no hay datos de consulta.</p>
            ) : docs.mostConsulted.map((doc, i) => (
              <div key={i} className="flex items-center justify-between rounded-md border px-3 py-2">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <p className="text-sm font-medium truncate">{doc.title}</p>
                </div>
                <span className="text-xs font-bold text-emerald-600 shrink-0">{doc.count} citas</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-400" /> Documentos menos consultados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {docs.leastConsulted.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aún no hay datos suficientes.</p>
            ) : docs.leastConsulted.map((doc, i) => (
              <div key={i} className="flex items-center justify-between rounded-md border px-3 py-2">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <p className="text-sm font-medium truncate">{doc.title}</p>
                </div>
                <span className="text-xs font-bold text-red-500 shrink-0">{doc.count} citas</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Questions Analysis */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Preguntas más comunes respondidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {d.topAnswered.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aún no hay datos.</p>
            ) : d.topAnswered.slice(0, 8).map((item) => (
              <div key={item.id} className="rounded-md border p-3">
                <p className="text-sm font-medium">{item.canonicalQuestion}</p>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{item.lastAnswer || "—"}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">{item.questionCount}x · Tema: {item.topic?.name || "General"}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Preguntas sin respuesta interna</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {d.topUnresolved.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aún no hay datos.</p>
            ) : d.topUnresolved.slice(0, 8).map((item) => (
              <div key={item.id} className="rounded-md border border-amber-100 bg-amber-50/30 p-3">
                <p className="text-sm font-medium">{item.canonicalQuestion}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">{item.questionCount}x sin resolver · Tema: {item.topic?.name || "General"}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Ambiguities + Topics */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Ambigüedades más comunes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {d.topAmbiguous.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin ambigüedades registradas.</p>
            ) : d.topAmbiguous.map((item, i) => (
              <div key={i} className="rounded-md border border-violet-100 bg-violet-50/30 p-3">
                <p className="text-sm font-medium">{item.questionText}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">{item.count}x · {item.resolvedCount} resueltas por usuario</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Temas más consultados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {d.topTopics.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin temas detectados.</p>
            ) : d.topTopics.map((topic) => (
              <div key={topic.id} className="rounded-md border p-3">
                <p className="text-sm font-semibold">{topic.name}</p>
                <div className="mt-1 flex gap-3 text-[10px] text-muted-foreground">
                  <span>{topic.questionCount} preguntas</span>
                  <span className="text-emerald-600">{topic.answeredCount} respondidas</span>
                  <span className="text-amber-600">{topic.unresolvedCount} sin resolver</span>
                  <span className="text-violet-600">{topic.ambiguousCount} ambiguas</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, bg }: {
  icon: React.ReactNode; label: string; value: number; color: string; bg: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-4 px-4">
        <div className={`p-2 rounded-lg ${bg}`}>{icon}</div>
        <div>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          <p className="text-[11px] text-muted-foreground font-medium">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function BarRow({ label, value, percent, color }: {
  label: string; value: number; percent: number; color: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium">{label}</span>
        <span className="text-xs font-bold">{value} ({percent}%)</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${Math.max(2, percent)}%` }} />
      </div>
    </div>
  );
}
