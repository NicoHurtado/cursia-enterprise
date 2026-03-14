"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, BookOpen, ChevronDown, ChevronUp, Eye, EyeOff, Lightbulb, RefreshCw, Trash2, Upload, Clock, Mail } from "lucide-react";

interface CompanyAgentManagerProps {
  companyId: string;
  companyName: string;
}

interface AgentData {
  id: string;
  isEnabled: boolean;
  generalInstructions?: string | null;
}

interface QualityAnalysis {
  missingSections: string[];
  ambiguous: string[];
  suggestions: string[];
}

interface AccessLog {
  id: string;
  userEmail: string;
  question: string;
  createdAt: string;
}

interface SourceData {
  id: string;
  title: string;
  sourceType: "TEXT" | "FILE";
  status: "PROCESSING" | "READY" | "FAILED";
  createdAt: string;
  trackAccess?: boolean;
  qualityScore?: number | null;
  qualityAnalysis?: QualityAnalysis | null;
  _count: { chunks: number };
}

export function CompanyAgentManager({ companyId, companyName }: CompanyAgentManagerProps) {
  const [agent, setAgent] = useState<AgentData | null>(null);
  const [sources, setSources] = useState<SourceData[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [reindexing, setReindexing] = useState(false);
  const [reindexResult, setReindexResult] = useState<string | null>(null);

  const loadAgentData = useCallback(async () => {
    const [agentRes, sourcesRes] = await Promise.all([
      fetch(`/api/admin/companies/${companyId}/agent`),
      fetch(`/api/admin/companies/${companyId}/agent/sources`),
    ]);
    if (agentRes.ok) setAgent(await agentRes.json());
    if (sourcesRes.ok) setSources(await sourcesRes.json());
  }, [companyId]);

  useEffect(() => {
    loadAgentData().catch((error) => console.error(error));
  }, [loadAgentData]);

  const saveAgent = async () => {
    if (!agent) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/companies/${companyId}/agent`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isEnabled: agent.isEnabled,
          generalInstructions: agent.generalInstructions || "",
        }),
      });
      if (res.ok) {
        setAgent(await res.json());
      }
    } finally {
      setSaving(false);
    }
  };

  const uploadFileSource = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await fetch(`/api/admin/companies/${companyId}/agent/sources`, {
        method: "POST",
        body: formData,
      });
      await loadAgentData();
    } finally {
      setUploading(false);
    }
  };

  const deleteSource = async (sourceId: string) => {
    await fetch(`/api/admin/companies/${companyId}/agent/sources/${sourceId}`, {
      method: "DELETE",
    });
    await loadAgentData();
  };

  const reindexSources = async () => {
    setReindexing(true);
    setReindexResult(null);
    try {
      const res = await fetch(`/api/admin/companies/${companyId}/agent/reindex`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setReindexResult(`${data.reindexed}/${data.total} documentos re-indexados correctamente.`);
        await loadAgentData();
      } else {
        setReindexResult("Error al re-indexar. Intenta de nuevo.");
      }
    } catch {
      setReindexResult("Error de conexión al re-indexar.");
    } finally {
      setReindexing(false);
    }
  };

  if (!agent) {
    return (
      <Card>
        <CardContent className="py-8 text-sm text-muted-foreground">
          Cargando configuración del agente...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuración del Agente de {companyName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={agent.isEnabled}
              onCheckedChange={(value) =>
                setAgent((prev) =>
                  prev ? { ...prev, isEnabled: value === true } : prev
                )
              }
            />
            <Label>{agent.isEnabled ? "Agente encendido" : "Agente apagado"}</Label>
          </div>

          <div className="space-y-2">
            <Label>Instrucciones generales</Label>
            <Textarea
              rows={5}
              value={agent.generalInstructions || ""}
              onChange={(e) =>
                setAgent((prev) =>
                  prev ? { ...prev, generalInstructions: e.target.value } : prev
                )
              }
              placeholder="Ej. Responde con tono formal y evita tecnicismos."
            />
          </div>

          <Button onClick={saveAgent} disabled={saving}>
            {saving ? "Guardando..." : "Guardar Configuración"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subir documentos e imágenes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="file"
            accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,.webp"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                uploadFileSource(file).catch((error) => console.error(error));
              }
            }}
            disabled={uploading}
          />
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <Upload className="w-3 h-3" />
            {uploading
              ? "Subiendo e indexando archivo..."
              : "Base de conocimiento vía PDF, DOCX, TXT e imágenes (OCR + visión)."}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Fuentes cargadas</CardTitle>
          {sources.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={reindexSources}
              disabled={reindexing}
              className="gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${reindexing ? "animate-spin" : ""}`} />
              {reindexing ? "Re-indexando..." : "Re-indexar documentos"}
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          {reindexResult && (
            <p className="text-sm font-medium text-emerald-600 bg-emerald-50 rounded-md px-3 py-2">
              {reindexResult}
            </p>
          )}
          {sources.length === 0 && (
            <p className="text-sm text-muted-foreground">Aún no hay fuentes para este agente.</p>
          )}
          {sources.map((source) => (
            <SourceCard key={source.id} source={source} companyId={companyId} onDelete={() => deleteSource(source.id)} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function getScoreColor(score: number) {
  if (score >= 80) return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", ring: "text-emerald-500" };
  if (score >= 60) return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", ring: "text-amber-500" };
  return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", ring: "text-red-500" };
}

function SourceCard({ source, companyId, onDelete }: { source: SourceData; companyId: string; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [tracking, setTracking] = useState(source.trackAccess ?? false);
  const [togglingTrack, setTogglingTrack] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const quality = source.qualityAnalysis;
  const score = source.qualityScore;
  const hasQuality = score != null && quality != null;
  const colors = hasQuality ? getScoreColor(score) : null;

  const toggleTracking = async () => {
    setTogglingTrack(true);
    try {
      const res = await fetch(`/api/admin/companies/${companyId}/agent/sources/${source.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackAccess: !tracking }),
      });
      if (res.ok) setTracking(!tracking);
    } finally {
      setTogglingTrack(false);
    }
  };

  const loadLogs = async () => {
    if (showLogs) { setShowLogs(false); return; }
    setShowLogs(true);
    setLogsLoading(true);
    try {
      const res = await fetch(`/api/admin/companies/${companyId}/agent/sources/${source.id}`);
      if (res.ok) setLogs(await res.json());
    } finally {
      setLogsLoading(false);
    }
  };

  return (
    <div className={`rounded-lg border ${hasQuality ? colors!.border : ""} overflow-hidden`}>
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div>
            <p className="font-medium text-sm">{source.title}</p>
            <p className="text-xs text-muted-foreground">
              {source.sourceType} · {source.status} · {source._count.chunks} chunks
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={toggleTracking}
            disabled={togglingTrack}
            title={tracking ? "Rastreo activado — click para desactivar" : "Activar rastreo de consultas"}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold transition-all ${
              tracking
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : "bg-muted/50 text-muted-foreground border border-transparent hover:border-muted-foreground/30"
            }`}
          >
            {tracking ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            {tracking ? "Rastreando" : "Rastrear"}
          </button>
          {tracking && (
            <button
              type="button"
              onClick={loadLogs}
              title="Ver registro de consultas"
              className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 transition-colors"
            >
              <Clock className="w-3 h-3" />
              Logs
            </button>
          )}
          {hasQuality && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${colors!.bg} ${colors!.text} hover:opacity-80 transition-opacity`}
            >
              {score}/100
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
          <Button variant="ghost" size="icon" onClick={onDelete} title="Eliminar fuente">
            <Trash2 className="w-4 h-4 text-red-600" />
          </Button>
        </div>
      </div>

      {showLogs && tracking && (
        <div className="px-3 pb-3 pt-1 border-t space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-violet-600 flex items-center gap-1">
            <Eye className="w-3 h-3" /> Registro de consultas
          </p>
          {logsLoading && <p className="text-xs text-muted-foreground">Cargando...</p>}
          {!logsLoading && logs.length === 0 && (
            <p className="text-xs text-muted-foreground">Nadie ha consultado este documento aún.</p>
          )}
          {!logsLoading && logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2 rounded-md bg-violet-50/50 border border-violet-100 px-2.5 py-2">
              <Mail className="w-3.5 h-3.5 text-violet-500 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-violet-800">{log.userEmail}</p>
                <p className="text-[10px] text-muted-foreground truncate">&quot;{log.question}&quot;</p>
                <p className="text-[10px] text-violet-500 flex items-center gap-1 mt-0.5">
                  <Clock className="w-2.5 h-2.5" />
                  {new Date(log.createdAt).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {expanded && hasQuality && (
        <div className={`px-3 pb-3 pt-1 border-t ${colors!.border} space-y-2`}>
          {quality!.missingSections.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Secciones faltantes
              </p>
              {quality!.missingSections.map((item, i) => (
                <p key={i} className="text-xs text-red-700 bg-red-50 rounded px-2 py-1 mb-1">{item}</p>
              ))}
            </div>
          )}
          {quality!.ambiguous.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Ambigüedades detectadas
              </p>
              {quality!.ambiguous.map((item, i) => (
                <p key={i} className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1 mb-1">{item}</p>
              ))}
            </div>
          )}
          {quality!.suggestions.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                <Lightbulb className="w-3 h-3" /> Mejoras operativas sugeridas
              </p>
              {quality!.suggestions.map((item, i) => (
                <p key={i} className="text-xs text-blue-700 bg-blue-50 rounded px-2 py-1 mb-1">{item}</p>
              ))}
            </div>
          )}
          {generateTrainingRecommendations(quality!).length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> Capacitaciones recomendadas
              </p>
              {generateTrainingRecommendations(quality!).map((item, i) => (
                <p key={i} className="text-xs text-purple-700 bg-purple-50 rounded px-2 py-1 mb-1">{item}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function generateTrainingRecommendations(analysis: QualityAnalysis): string[] {
  const recs: string[] = [];
  for (const section of analysis.missingSections) {
    const lower = section.toLowerCase();
    if (lower.includes("seguridad") || lower.includes("contraseñ") || lower.includes("acceso")) {
      recs.push(`Capacitación: Seguridad informática y manejo de credenciales`);
    }
    if (lower.includes("onboarding") || lower.includes("inducción") || lower.includes("incorpor")) {
      recs.push(`Capacitación: Proceso de inducción para nuevos empleados`);
    }
    if (lower.includes("emergencia") || lower.includes("contingencia") || lower.includes("crisis")) {
      recs.push(`Capacitación: Protocolos de emergencia y contingencia`);
    }
  }
  for (const item of analysis.ambiguous) {
    const lower = item.toLowerCase();
    if (lower.includes("versio") || lower.includes("manual") || lower.includes("document")) {
      recs.push(`Capacitación: Gestión y versionamiento de documentación interna`);
    }
  }
  for (const item of analysis.suggestions) {
    const lower = item.toLowerCase();
    if (lower.includes("proceso") || lower.includes("procedimiento") || lower.includes("flujo")) {
      recs.push(`Capacitación: Estandarización de procesos operativos`);
    }
    if (lower.includes("comunicación") || lower.includes("canal") || lower.includes("contacto")) {
      recs.push(`Capacitación: Canales de comunicación interna efectiva`);
    }
  }
  return [...new Set(recs)].slice(0, 3);
}

