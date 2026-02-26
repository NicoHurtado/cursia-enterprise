"use client";

import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  Loader2,
  Send,
  AlertTriangle,
  Plus,
  Paperclip,
  X,
  Sparkles,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AgentChatProps {
  agentId: string;
  agentName: string;
  companyName: string;
  uiColor: string;
  isEnabled: boolean;
}

interface AgentResponse {
  mode: "grounded" | "ambiguous" | "fallback";
  answer: string;
  confidence: number;
  citations: {
    chunkId?: string;
    documentId: string;
    title: string;
    excerpt: string;
    score: number;
    fileUrl?: string | null;
  }[];
  alternatives?: {
    chunkId: string;
    documentId: string;
    title: string;
    summary: string;
    score: number;
  }[];
  requiresSourceSelection?: boolean;
  ambiguityEventId?: string;
  blocked?: boolean;
  conversationId?: string;
  message?: string;
}

interface Message {
  id?: string;
  role: "user" | "assistant";
  text: string;
  meta?: AgentResponse;
}

interface ConversationSummary {
  id: string;
  title: string;
  updatedAt: string;
  lastMessage: string;
}

interface SourcePreviewPayload {
  id: string;
  title: string;
  rawText: string;
  mimeType?: string | null;
  filePath?: string | null;
  updatedAt: string;
}

function getModeLabel(mode: AgentResponse["mode"]) {
  if (mode === "fallback") return "No encontrado en archivos (respuesta general)";
  if (mode === "ambiguous") return "Respuesta ambigua entre fuentes";
  return "Basado en archivos internos";
}

export function CompanyAgentChat({
  agentId,
  agentName,
  companyName,
  uiColor,
  isEnabled,
}: AgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: `Hola, soy ${agentName}. Pregúntame con confianza usando la base documental de tu empresa.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [creatingNewChat, setCreatingNewChat] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [resolvingChunkId, setResolvingChunkId] = useState<string | null>(null);
  const [sourcePreviewOpen, setSourcePreviewOpen] = useState(false);
  const [sourcePreviewLoading, setSourcePreviewLoading] = useState(false);
  const [sourcePreview, setSourcePreview] = useState<SourcePreviewPayload | null>(null);
  const [sourcePreviewExcerpt, setSourcePreviewExcerpt] = useState<string>("");
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const attachPastedImage = useCallback((blob: Blob) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const extension = blob.type.includes("png")
      ? "png"
      : blob.type.includes("webp")
      ? "webp"
      : "jpg";
    const file = new File([blob], `captura-${timestamp}.${extension}`, {
      type: blob.type || "image/png",
    });
    setSelectedImage(file);
  }, []);

  const badgeColor = useMemo(() => ({ backgroundColor: uiColor }), [uiColor]);
  const softColor = useMemo(
    () => ({ backgroundColor: `${uiColor}1A`, borderColor: `${uiColor}33` }),
    [uiColor]
  );
  const sendButtonStyle = useMemo(
    () => ({ backgroundColor: uiColor, borderColor: uiColor, color: "#fff" }),
    [uiColor]
  );

  const getHighlightedPreviewText = useCallback((fullText: string, excerpt: string) => {
    if (!fullText.trim()) return "";
    const cleanExcerpt = excerpt.trim();
    if (!cleanExcerpt) return fullText.slice(0, 1400);

    const normalizedFull = fullText.toLowerCase();
    const normalizedExcerpt = cleanExcerpt.toLowerCase();
    const index = normalizedFull.indexOf(normalizedExcerpt.slice(0, Math.min(80, normalizedExcerpt.length)));

    if (index < 0) return fullText.slice(0, 1800);

    const start = Math.max(0, index - 500);
    const end = Math.min(fullText.length, index + cleanExcerpt.length + 500);
    return fullText.slice(start, end);
  }, []);

  const fetchConversations = useCallback(async () => {
    const res = await fetch(`/api/employee/agents/${agentId}/conversations`);
    if (!res.ok) return;
    const data = (await res.json()) as ConversationSummary[];
    setConversations(data);
    // Auto-select last chat only on initial load, not when user explicitly starts a new chat.
    if (!creatingNewChat && !activeConversationId && data.length > 0) {
      setActiveConversationId(data[0].id);
    }
  }, [agentId, activeConversationId, creatingNewChat]);

  const loadConversation = useCallback(
    async (conversationId: string) => {
      setLoadingHistory(true);
      try {
        const res = await fetch(
          `/api/employee/agents/${agentId}/conversations/${conversationId}`
        );
        if (!res.ok) return;
        const data = await res.json();
        setMessages(
          data.messages.map((message: any) => ({
            id: message.id,
            role: message.role === "USER" ? "user" : "assistant",
            text: message.content,
            meta:
              message.role === "ASSISTANT"
                ? {
                    mode: (message.mode || "fallback") as AgentResponse["mode"],
                    answer: message.content,
                    confidence: message.confidence || 0,
                    citations: (message.citations || []) as AgentResponse["citations"],
                    alternatives: [],
                    requiresSourceSelection: false,
                    conversationId,
                  }
                : undefined,
          }))
        );
      } finally {
        setLoadingHistory(false);
      }
    },
    [agentId]
  );

  useEffect(() => {
    fetchConversations().catch((error) => console.error(error));
  }, [fetchConversations]);

  useEffect(() => {
    if (!activeConversationId) return;
    loadConversation(activeConversationId).catch((error) => console.error(error));
  }, [activeConversationId, loadConversation]);

  const createNewConversation = () => {
    setCreatingNewChat(true);
    setActiveConversationId(null);
    setMessages([
      {
        role: "assistant",
        text: `Hola, soy ${agentName}. Pregúntame con confianza usando la base documental de tu empresa.`,
      },
    ]);
  };

  const openSourcePreview = useCallback(
    async (documentId: string, excerpt: string) => {
      setSourcePreviewOpen(true);
      setSourcePreviewLoading(true);
      setSourcePreviewExcerpt(excerpt);
      try {
        const res = await fetch(`/api/employee/agents/${agentId}/sources/${documentId}`);
        if (!res.ok) {
          throw new Error("No pude abrir la fuente referenciada.");
        }
        const data = (await res.json()) as SourcePreviewPayload;
        setSourcePreview(data);
      } catch (error) {
        console.error(error);
        setSourcePreview(null);
      } finally {
        setSourcePreviewLoading(false);
      }
    },
    [agentId]
  );

  const resolveAmbiguity = useCallback(
    async (
      assistantMessageIdx: number,
      option: NonNullable<AgentResponse["alternatives"]>[number],
      messageMeta?: AgentResponse
    ) => {
      const latestUserQuestion =
        [...messages]
          .slice(0, assistantMessageIdx)
          .reverse()
          .find((item) => item.role === "user")?.text || "";
      if (!latestUserQuestion.trim()) return;
      const currentConversationId = messageMeta?.conversationId || activeConversationId;
      if (!currentConversationId) return;

      setResolvingChunkId(option.chunkId);
      try {
        const res = await fetch(`/api/employee/agents/${agentId}/chat/resolve`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId: currentConversationId,
            question: latestUserQuestion,
            selectedChunkId: option.chunkId,
            ambiguityEventId: messageMeta?.ambiguityEventId,
          }),
        });
        const raw = await res.text();
        const data = (raw ? JSON.parse(raw) : {}) as AgentResponse;
        if (!res.ok) {
          throw new Error(data?.message || "No se pudo resolver la ambigüedad.");
        }

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: data.answer,
            meta: data,
          },
        ]);
        fetchConversations().catch((error) => console.error(error));
      } catch (error) {
        console.error(error);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text:
              error instanceof Error
                ? error.message
                : "No pude resolver la ambigüedad en este momento.",
          },
        ]);
      } finally {
        setResolvingChunkId(null);
      }
    },
    [activeConversationId, agentId, fetchConversations, messages]
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedImage) || loading) return;
    const question = input.trim() || "Analiza la imagen y responde con precisión.";
    setInput("");
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: selectedImage ? `${question}\n\n[Imagen adjunta: ${selectedImage.name}]` : question,
      },
    ]);
    setLoading(true);

    try {
      const isImageAttached = !!selectedImage;
      const res = await fetch(
        `/api/employee/agents/${agentId}/chat`,
        isImageAttached
          ? {
              method: "POST",
              body: (() => {
                const formData = new FormData();
                formData.append("message", question);
                if (activeConversationId) {
                  formData.append("conversationId", activeConversationId);
                }
                if (selectedImage) {
                  formData.append("image", selectedImage);
                }
                return formData;
              })(),
            }
          : {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                message: question,
                conversationId: activeConversationId || undefined,
              }),
            }
      );

      const raw = await res.text();
      let data: AgentResponse;
      try {
        data = (raw ? JSON.parse(raw) : {}) as AgentResponse;
      } catch {
        throw new Error(raw || "Respuesta inválida del servidor");
      }
      if (!res.ok && data?.blocked) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: "Este agente está deshabilitado temporalmente por el administrador.",
            meta: data,
          },
        ]);
        return;
      }
      if (!res.ok) {
        throw new Error(data?.message || "No se pudo procesar la solicitud.");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.answer,
          meta: data,
        },
      ]);
      if (data.conversationId && !activeConversationId) {
        setActiveConversationId(data.conversationId);
        setCreatingNewChat(false);
      }
      setSelectedImage(null);
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
      fetchConversations().catch((error) => console.error(error));
    } catch (error) {
      console.error("Agent chat failed:", error);
      const message =
        error instanceof Error && error.message
          ? error.message
          : "No pude procesar tu pregunta en este momento. Intenta nuevamente.";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: message,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isEnabled) {
    const whatsappText = encodeURIComponent(
      `Hola, soy de ${companyName} y quiero desbloquear mi agente IA (${agentName}). ¿Me pueden ayudar por favor?`
    );
    const whatsappUrl = `https://wa.me/573246590060?text=${whatsappText}`;

    return (
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-[#0066FF] via-[#1d4ed8] to-[#0f172a] text-white shadow-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-xl md:text-2xl font-extrabold">
              <ShieldCheck className="w-6 h-6" />
              Agente temporalmente bloqueado
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              Soporte prioritario
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-2xl border border-white/20 bg-white/10 p-4 md:p-5">
            <p className="text-sm md:text-base leading-relaxed text-blue-50">
              Tu administrador pausó este agente. Escríbenos y lo desbloqueamos rápido para que
              tu equipo vuelva a consultar la base de conocimiento sin fricción.
            </p>
            <p className="mt-2 text-xs md:text-sm text-blue-100/90">
              Empresa: <span className="font-semibold">{companyName}</span> · Agente:{" "}
              <span className="font-semibold">{agentName}</span>
            </p>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-5 py-4 text-base md:text-lg font-extrabold text-white shadow-lg shadow-[#25D366]/30 transition hover:scale-[1.01] hover:bg-[#20ba5a]"
          >
            <MessageCircle className="w-5 h-5" />
            Escribir a WhatsApp para desbloquear
            <ArrowRight className="w-5 h-5 transition group-hover:translate-x-0.5" />
          </a>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="h-[calc(100vh-150px)] min-h-0">
      <Card className="h-full min-h-0 overflow-hidden grid grid-cols-12">
        <div className="col-span-3 min-h-0 border-r bg-muted/30 p-3 flex flex-col gap-3">
          <Button
            type="button"
            className="w-full justify-start gap-2"
            style={sendButtonStyle}
            onClick={createNewConversation}
          >
            <Plus className="w-4 h-4" />
            Nuevo chat
          </Button>
          <div className="flex-1 min-h-0 overflow-y-auto space-y-2">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                className={[
                  "w-full text-left rounded-lg border p-2 transition-colors",
                  activeConversationId === conversation.id
                    ? "bg-background"
                    : "bg-background/50 hover:bg-background",
                ].join(" ")}
                style={
                  activeConversationId === conversation.id
                    ? { borderColor: `${uiColor}66` }
                    : undefined
                }
                onClick={() => setActiveConversationId(conversation.id)}
              >
                <p className="text-sm font-medium line-clamp-1">{conversation.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {conversation.lastMessage || "Sin mensajes aún"}
                </p>
              </button>
            ))}
            {conversations.length === 0 && (
              <p className="text-xs text-muted-foreground px-1">
                Aún no tienes conversaciones guardadas.
              </p>
            )}
          </div>
        </div>

        <div className="col-span-9 h-full flex flex-col min-h-0">
          <CardHeader style={softColor}>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                {agentName}
              </span>
              <Badge style={badgeColor} className="text-white border-0">
                Activo
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 min-h-0 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {loadingHistory && (
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Cargando historial...
                </div>
              )}
              {!loadingHistory &&
                messages.map((message, idx) => (
              <div key={idx} className={message.role === "user" ? "text-right" : "text-left"}>
                <div
                  className={[
                    "inline-block rounded-2xl px-4 py-3 max-w-[85%] whitespace-pre-wrap",
                    message.role === "user"
                      ? "text-white"
                      : "bg-muted border",
                  ].join(" ")}
                  style={message.role === "user" ? { backgroundColor: uiColor } : softColor}
                >
                  {message.text}
                </div>
                {message.role === "assistant" && message.meta && (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline">{getModeLabel(message.meta.mode)}</Badge>
                      <span>Confianza: {(message.meta.confidence * 100).toFixed(1)}%</span>
                    </div>
                    {message.meta.mode === "ambiguous" && (
                      <div className="space-y-2">
                        <div className="text-xs text-amber-600 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Fuentes similares: elige la fuente que consideres correcta.
                        </div>
                        {!!message.meta.alternatives?.length && (
                          <div className="space-y-2">
                            {message.meta.alternatives.map((option) => (
                              <div
                                key={option.chunkId}
                                className="rounded-md border bg-background p-2 text-xs"
                              >
                                <p className="font-semibold">{option.title}</p>
                                <p className="text-muted-foreground line-clamp-2">
                                  {option.summary}
                                </p>
                                <div className="mt-2 flex items-center justify-between">
                                  <span className="text-[11px] text-muted-foreground">
                                    Score: {(option.score * 100).toFixed(1)}%
                                  </span>
                                  <Button
                                    size="sm"
                                    className="h-7 px-2 text-[11px]"
                                    disabled={resolvingChunkId === option.chunkId}
                                    onClick={() => resolveAmbiguity(idx, option, message.meta)}
                                  >
                                    {resolvingChunkId === option.chunkId
                                      ? "Resolviendo..."
                                      : "Responder con esta fuente"}
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {message.meta.citations?.length > 0 && (
                      <div className="space-y-1">
                        {message.meta.citations.map((citation) => (
                          <div
                            key={`${citation.documentId}-${citation.score}`}
                            className="text-xs border rounded-md p-2 bg-background"
                            style={{ borderColor: `${uiColor}55` }}
                          >
                            <p className="font-medium">{citation.title}</p>
                            <p className="text-muted-foreground line-clamp-2">{citation.excerpt}</p>
                            {citation.fileUrl && (
                              <button
                                type="button"
                                onClick={() => openSourcePreview(citation.documentId, citation.excerpt)}
                                className="mt-2 inline-block text-[11px] underline underline-offset-2"
                                style={{ color: uiColor }}
                              >
                                Ver evidencia destacada
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
              {loading && (
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Pensando...
                </div>
              )}
            </div>

            <form className="flex gap-2 shrink-0 bg-background pt-1" onSubmit={submit}>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setSelectedImage(file || null);
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => imageInputRef.current?.click()}
                disabled={loading}
                title="Adjuntar imagen"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onPaste={(e) => {
                  const items = Array.from(e.clipboardData.items || []);
                  const imageItem = items.find((item) => item.type.startsWith("image/"));
                  if (!imageItem) return;
                  const file = imageItem.getAsFile();
                  if (!file) return;
                  e.preventDefault();
                  attachPastedImage(file);
                }}
                placeholder="Escribe tu pregunta (puedes adjuntar imagen)..."
                disabled={loading}
              />
              <Button
                type="submit"
                disabled={loading || (!input.trim() && !selectedImage)}
                style={sendButtonStyle}
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
            {selectedImage && (
              <div className="shrink-0 text-xs flex items-center gap-2 text-muted-foreground">
                <span className="rounded-md border px-2 py-1 bg-muted/50">
                  Imagen: {selectedImage.name}
                </span>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 underline"
                  onClick={() => {
                    setSelectedImage(null);
                    if (imageInputRef.current) {
                      imageInputRef.current.value = "";
                    }
                  }}
                >
                  <X className="w-3 h-3" />
                  Quitar
                </button>
              </div>
            )}
          </CardContent>
        </div>
      </Card>
      <AnimatePresence>
        {sourcePreviewOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              className="mx-auto mt-[7vh] max-h-[86vh] w-[min(980px,94vw)] overflow-hidden rounded-2xl border bg-background shadow-2xl"
            >
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div>
                  <p className="text-sm font-semibold">
                    {sourcePreview?.title || "Evidencia referenciada"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Vista con fragmento destacado de la fuente utilizada.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setSourcePreviewOpen(false)}>
                  Cerrar
                </Button>
              </div>
              <div className="max-h-[76vh] overflow-y-auto px-4 py-4 text-sm leading-6">
                {sourcePreviewLoading && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cargando fuente...
                  </div>
                )}
                {!sourcePreviewLoading && sourcePreview && (
                  <div className="space-y-3">
                    <div className="rounded-md border bg-muted/30 p-2 text-xs text-muted-foreground">
                      Fragmento citado: {sourcePreviewExcerpt}
                    </div>
                    <pre className="whitespace-pre-wrap break-words font-sans">
                      {(() => {
                        const previewText = getHighlightedPreviewText(
                          sourcePreview.rawText || "",
                          sourcePreviewExcerpt
                        );
                        if (!sourcePreviewExcerpt.trim()) return previewText;
                        const parts = previewText.split(sourcePreviewExcerpt);
                        if (parts.length <= 1) return previewText;
                        return parts.reduce<ReactNode[]>((acc, part, index) => {
                          if (index > 0) {
                            acc.push(
                              <mark key={`mark-${index}`} className="rounded bg-yellow-200 px-0.5">
                                {sourcePreviewExcerpt}
                              </mark>
                            );
                          }
                          acc.push(<span key={`part-${index}`}>{part}</span>);
                          return acc;
                        }, []);
                      })()}
                    </pre>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

