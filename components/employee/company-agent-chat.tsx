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
  mode: "grounded" | "ambiguous" | "fallback" | "image";
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
  chunkContent?: string;
}

function getModeLabel(mode: AgentResponse["mode"]) {
  if (mode === "fallback") return "No encontrado en archivos (respuesta general)";
  if (mode === "ambiguous") return "Respuesta ambigua entre fuentes";
  if (mode === "image") return "Análisis de imagen adjunta";
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
    async (documentId: string, excerpt: string, chunkId?: string) => {
      setSourcePreviewOpen(true);
      setSourcePreviewLoading(true);
      setSourcePreviewExcerpt(excerpt);
      try {
        const url = chunkId
          ? `/api/employee/agents/${agentId}/sources/${documentId}?chunkId=${chunkId}`
          : `/api/employee/agents/${agentId}/sources/${documentId}`;
        const res = await fetch(url);
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
    <div className="h-[calc(100vh-140px)] min-h-0 flex flex-col">
      <Card className="h-full min-h-0 overflow-hidden grid grid-cols-12 border-0 shadow-2xl bg-background/60 backdrop-blur-xl">
        {/* Sidebar */}
        <div className="col-span-3 min-h-0 border-r bg-muted/20 backdrop-blur-md p-4 flex flex-col gap-4">
          <Button
            type="button"
            className="w-full justify-start gap-2 h-11 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md"
            style={sendButtonStyle}
            onClick={createNewConversation}
          >
            <Plus className="w-4 h-4" />
            <span className="font-bold">Nuevo chat</span>
          </Button>

          <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
            <AnimatePresence mode="popLayout">
              {conversations.map((conversation) => (
                <motion.button
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={conversation.id}
                  type="button"
                  className={[
                    "w-full text-left rounded-xl border p-3 transition-all duration-200 group relative overflow-hidden",
                    activeConversationId === conversation.id
                      ? "bg-background shadow-sm border-primary/20"
                      : "bg-background/40 hover:bg-background/80 border-transparent hover:border-muted-foreground/10",
                  ].join(" ")}
                  style={
                    activeConversationId === conversation.id
                      ? { borderColor: `${uiColor}44`, boxShadow: `0 4px 12px ${uiColor}15` }
                      : undefined
                  }
                  onClick={() => setActiveConversationId(conversation.id)}
                >
                  <div className="flex flex-col gap-1 relative z-10">
                    <p className="text-sm font-bold line-clamp-1 group-hover:text-primary transition-colors">
                      {conversation.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground line-clamp-1 opacity-80">
                      {conversation.lastMessage || "Sin mensajes aún"}
                    </p>
                  </div>
                  {activeConversationId === conversation.id && (
                    <motion.div
                      layoutId="active-indicator"
                      className="absolute left-0 top-0 bottom-0 w-1"
                      style={{ backgroundColor: uiColor }}
                    />
                  )}
                </motion.button>
              ))}
            </AnimatePresence>

            {conversations.length === 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-muted-foreground px-2 py-4 text-center italic"
              >
                Aún no tienes conversaciones guardadas.
              </motion.p>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="col-span-9 h-full flex flex-col min-h-0 bg-gradient-to-b from-transparent to-muted/5">
          <CardHeader className="py-4 border-b bg-background/40 backdrop-blur-sm" style={{ borderBottomColor: `${uiColor}22` }}>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl shadow-inner" style={softColor}>
                  <Bot className="w-6 h-6" style={{ color: uiColor }} />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold tracking-tight">{agentName}</h3>
                  <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/70">Asistente Inteligente</p>
                </div>
              </div>
              <Badge style={badgeColor} className="text-white border-0 px-3 py-1 shadow-sm font-bold animate-pulse">
                Activo
              </Badge>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 flex-1 min-h-0 flex flex-col overflow-hidden p-0">
            <div className="flex-1 overflow-y-auto space-y-6 pt-6 px-6 pb-4 scrollbar-thin">
              {loadingHistory && (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground animate-in fade-in zoom-in duration-300">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-sm font-medium">Sincronizando historial...</p>
                </div>
              )}
              {!loadingHistory && (
                <div className="flex flex-col gap-6">
                  {messages.map((message, idx) => (
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: "spring", damping: 25, stiffness: 400 }}
                      key={idx}
                      className={message.role === "user" ? "flex flex-col items-end" : "flex flex-col items-start"}
                    >
                      <div
                        className={[
                          "relative group px-5 py-3.5 max-w-[82%] shadow-sm transition-all duration-300",
                          message.role === "user"
                            ? "rounded-2xl rounded-tr-sm text-white font-medium"
                            : "rounded-2xl rounded-tl-sm bg-background border border-muted",
                        ].join(" ")}
                        style={message.role === "user"
                          ? { backgroundColor: uiColor, boxShadow: `0 8px 20px ${uiColor}25` }
                          : { borderLeftColor: uiColor, borderLeftWidth: "4px" }
                        }
                      >
                        <div className="text-[14.5px] leading-relaxed select-text">{message.text}</div>

                        {/* Status detail for assistant */}
                        {message.role === "assistant" && message.meta && (
                          <div className="mt-4 pt-3 border-t border-muted/50 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                {message.meta.mode === "image" && <Sparkles className="w-3 h-3 text-amber-500" />}
                                {getModeLabel(message.meta.mode)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color: uiColor }}>
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>{(message.meta.confidence * 100).toFixed(1)}% confianza</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Reference system redesign */}
                      <AnimatePresence>
                        {message.role === "assistant" && message.meta && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="w-full mt-3 space-y-3"
                          >
                            {message.meta.mode === "ambiguous" && (
                              <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200"
                              >
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Fuentes similares detectadas
                              </motion.div>
                            )}

                            {/* Alternatives for ambiguous mode */}
                            {message.meta.mode === "ambiguous" && !!message.meta.alternatives?.length && (
                              <div className="grid grid-cols-2 gap-3 mt-1">
                                {message.meta.alternatives.map((option, optIdx) => (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: optIdx * 0.1 }}
                                    key={option.chunkId}
                                    className="rounded-xl border bg-background/50 backdrop-blur-sm p-3 shadow-sm hover:shadow-md transition-all border-amber-100 hover:border-amber-300"
                                  >
                                    <p className="font-bold text-xs mb-1 line-clamp-1">{option.title}</p>
                                    <p className="text-[11px] text-muted-foreground line-clamp-2 mb-3 leading-snug">
                                      {option.summary}
                                    </p>
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                                        {(option.score * 100).toFixed(1)}%
                                      </span>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 px-3 text-[10px] font-bold border-amber-200 hover:bg-amber-50"
                                        disabled={resolvingChunkId === option.chunkId}
                                        onClick={() => resolveAmbiguity(idx, option, message.meta)}
                                      >
                                        {resolvingChunkId === option.chunkId ? "..." : "Seleccionar"}
                                      </Button>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            )}

                            {/* Citations / Evidence cards */}
                            {message.meta.mode !== "image" && message.meta.citations?.length > 0 && (
                              <div className="flex flex-col gap-2 max-w-[90%]">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Fuentes de conocimiento</p>
                                {message.meta.citations.map((citation, citIdx) => (
                                  <motion.div
                                    initial={{ opacity: 0, x: -15 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: citIdx * 0.1 }}
                                    key={`${citation.documentId}-${citation.score}`}
                                    className="group relative flex gap-3 items-start p-3 rounded-xl border bg-background hover:bg-muted/5 transition-all duration-300 shadow-sm hover:shadow-md"
                                    style={{ borderLeft: `3px solid ${uiColor}` }}
                                  >
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between gap-4 mb-1">
                                        <p className="font-bold text-[12px] truncate">{citation.title}</p>
                                        <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted">
                                          Rel: {(citation.score * 100).toFixed(0)}%
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed italic opacity-85">
                                        "{citation.excerpt}"
                                      </p>
                                      {citation.fileUrl && (
                                        <button
                                          type="button"
                                          onClick={() => openSourcePreview(citation.documentId, citation.excerpt, citation.chunkId)}
                                          className="mt-2.5 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider group-hover:translate-x-1 transition-transform"
                                          style={{ color: uiColor }}
                                        >
                                          <ArrowRight className="w-3 h-3" />
                                          Ver evidencia destacada
                                        </button>
                                      )}
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                  {loading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-3"
                    >
                      <div className="p-2 rounded-xl bg-muted/50">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      </div>
                      <div className="bg-muted/30 px-4 py-2 rounded-2xl animate-pulse">
                        <span className="text-sm font-medium text-muted-foreground italic">Pensando...</span>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 pb-6 pt-2">
              <form className="relative flex items-end gap-2 p-2 rounded-2xl border bg-background/80 focus-within:ring-2 focus-within:ring-offset-1 shadow-lg transition-all"
                style={{ borderColor: `${uiColor}44`, "--tw-ring-color": uiColor } as any}
                onSubmit={submit}>

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
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 shrink-0 rounded-xl hover:bg-muted"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={loading}
                >
                  <Paperclip className="w-5 h-5 opacity-70" />
                </Button>

                <div className="flex-1 flex flex-col gap-2">
                  <AnimatePresence>
                    {selectedImage && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="flex items-center gap-2 p-2 rounded-xl bg-muted/60 border border-muted"
                      >
                        <div className="p-1.5 rounded-lg bg-background shadow-xs">
                          <Plus className="w-3 h-3 rotate-45" style={{ color: uiColor }} />
                        </div>
                        <span className="text-[11px] font-bold truncate max-w-[140px] uppercase tracking-tighter">
                          {selectedImage.name}
                        </span>
                        <button
                          type="button"
                          className="ml-auto p-1 hover:bg-muted-foreground/10 rounded-full"
                          onClick={() => {
                            setSelectedImage(null);
                            if (imageInputRef.current) imageInputRef.current.value = "";
                          }}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Input
                    className="border-0 focus-visible:ring-0 shadow-none px-2 h-11 text-sm bg-transparent"
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
                    placeholder="Escribe tu mensaje aquí..."
                    disabled={loading}
                  />
                </div>

                <Button
                  type="submit"
                  size="icon"
                  className="h-11 w-11 shrink-0 rounded-xl shadow-md transition-all active:scale-95"
                  disabled={loading || (!input.trim() && !selectedImage)}
                  style={sendButtonStyle}
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </Button>
              </form>
            </div>
          </CardContent>
        </div>
      </Card>
      <AnimatePresence>
        {sourcePreviewOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/40 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95, rotateX: -10 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
              exit={{ opacity: 0, y: 20, scale: 0.95, rotateX: 5 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl border bg-background shadow-2xl flex flex-col"
              style={{ borderColor: `${uiColor}33` }}
            >
              <div className="flex items-center justify-between border-b px-6 py-4 bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-background shadow-sm">
                    <ShieldCheck className="w-5 h-5" style={{ color: uiColor }} />
                  </div>
                  <div>
                    <p className="text-sm font-black tracking-tight">
                      {sourcePreview?.title || "Evidencia referenciada"}
                    </p>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60">
                      Fuente de conocimiento verificada
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-muted"
                  onClick={() => setSourcePreviewOpen(false)}
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                {sourcePreviewLoading && (
                  <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin" style={{ color: uiColor }} />
                    <p className="text-sm font-bold italic">Buscando en la base de datos...</p>
                  </div>
                )}

                {!sourcePreviewLoading && sourcePreview && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="rounded-2xl border bg-muted/30 p-4 border-dashed" style={{ borderColor: `${uiColor}44` }}>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2">Fragmento solicitado</p>
                      <p className="text-xs font-bold leading-relaxed">"{sourcePreviewExcerpt}"</p>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-4 top-0 bottom-0 w-1 rounded-full opacity-30" style={{ backgroundColor: uiColor }} />
                      <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-8 text-foreground/90 pl-2">
                        {(() => {
                          const targetExcerpt = sourcePreview.chunkContent || sourcePreviewExcerpt;
                          const previewText = getHighlightedPreviewText(
                            sourcePreview.rawText || "",
                            targetExcerpt
                          );
                          if (!targetExcerpt.trim()) return previewText;

                          const parts = previewText.split(targetExcerpt);
                          if (parts.length > 1) {
                            return parts.reduce<ReactNode[]>((acc, part, index) => {
                              if (index > 0) {
                                acc.push(
                                  <mark key={`mark-${index}`} className="rounded px-1 font-bold shadow-sm" style={{ backgroundColor: `${uiColor}33`, color: "inherit", borderBottom: `2px solid ${uiColor}` }}>
                                    {targetExcerpt}
                                  </mark>
                                );
                              }
                              acc.push(<span key={`part-${index}`}>{part}</span>);
                              return acc;
                            }, []);
                          } else {
                            // Fallback
                            const normFull = previewText.toLowerCase();
                            const normTarget = targetExcerpt.toLowerCase();
                            const idx = normFull.indexOf(normTarget.slice(0, Math.min(100, normTarget.length)));
                            if (idx >= 0) {
                              const actualTarget = previewText.slice(idx, idx + targetExcerpt.length);
                              const before = previewText.slice(0, idx);
                              const after = previewText.slice(idx + targetExcerpt.length);
                              return [
                                <span key="part-0">{before}</span>,
                                <mark key="mark-1" className="rounded px-1 font-bold shadow-sm" style={{ backgroundColor: `${uiColor}33`, color: "inherit", borderBottom: `2px solid ${uiColor}` }}>{actualTarget}</mark>,
                                <span key="part-1">{after}</span>
                              ];
                            }
                            return previewText;
                          }
                        })()}
                      </pre>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-muted/10 border-t flex justify-end">
                <Button
                  style={sendButtonStyle}
                  className="rounded-xl px-6 font-bold shadow-lg"
                  onClick={() => setSourcePreviewOpen(false)}
                >
                  Entendido
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

