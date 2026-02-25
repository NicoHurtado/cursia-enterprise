"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Upload } from "lucide-react";

interface CompanyAgentManagerProps {
  companyId: string;
  companyName: string;
}

interface AgentData {
  id: string;
  name: string;
  uiColor: string;
  isEnabled: boolean;
  generalInstructions?: string | null;
}

interface SourceData {
  id: string;
  title: string;
  sourceType: "TEXT" | "FILE";
  status: "PROCESSING" | "READY" | "FAILED";
  createdAt: string;
  _count: { chunks: number };
}

export function CompanyAgentManager({ companyId, companyName }: CompanyAgentManagerProps) {
  const [agent, setAgent] = useState<AgentData | null>(null);
  const [sources, setSources] = useState<SourceData[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

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
          name: agent.name,
          uiColor: agent.uiColor,
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={agent.name}
                onChange={(e) => setAgent((prev) => (prev ? { ...prev, name: e.target.value } : prev))}
              />
            </div>
            <div className="space-y-2">
              <Label>Color de interfaz</Label>
              <Input
                type="color"
                value={agent.uiColor}
                onChange={(e) => setAgent((prev) => (prev ? { ...prev, uiColor: e.target.value } : prev))}
              />
            </div>
          </div>

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
        <CardHeader>
          <CardTitle>Fuentes cargadas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {sources.length === 0 && (
            <p className="text-sm text-muted-foreground">Aún no hay fuentes para este agente.</p>
          )}
          {sources.map((source) => (
            <div
              key={source.id}
              className="flex items-center justify-between rounded-md border px-3 py-2"
            >
              <div>
                <p className="font-medium">{source.title}</p>
                <p className="text-xs text-muted-foreground">
                  {source.sourceType} · {source.status} · {source._count.chunks} chunks
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteSource(source.id)}
                title="Eliminar fuente"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

