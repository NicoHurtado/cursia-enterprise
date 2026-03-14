"use client";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  Loader2,
  Send,
  AlertTriangle,
  Plus,
  Paperclip,
  X,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  ArrowLeft,
  Menu,
  Clock,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  Zap,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const CURSIA_BLUE = "#0066FF";
const AGENT_NAME = "Agente Cursia";

interface AgentChatProps {
  agentId: string;
  companyName: string;
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
  messageId?: string;
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
  chunkContent?: string;
  mimeType?: string | null;
  filePath?: string | null;
  updatedAt: string;
}

const SUGGESTED_QUESTIONS = [
  "¿Cuáles son las políticas de vacaciones?",
  "¿Cómo solicito permisos?",
  "¿Cuál es la política de trabajo remoto?",
  "¿Cuáles son los beneficios de la empresa?",
];

function getModeLabel(mode: AgentResponse["mode"]) {
  if (mode === "fallback") return "No encontrado en archivos";
  if (mode === "ambiguous") return "Fuentes contradictorias";
  if (mode === "image") return "Análisis de imagen";
  return "Basado en archivos internos";
}

function normalizeForSearch(text: string) {
  return text.replace(/\s+/g, " ").toLowerCase().trim();
}

function findMatchInOriginal(
  original: string,
  target: string
): { start: number; end: number } | null {
  const normTarget = normalizeForSearch(target);
  if (!normTarget) return null;

  const chars: string[] = [];
  const map: number[] = [];
  let prevSpace = true;
  for (let i = 0; i < original.length; i++) {
    const ch = original[i];
    if (/\s/.test(ch)) {
      if (!prevSpace) {
        chars.push(" ");
        map.push(i);
        prevSpace = true;
      }
    } else {
      chars.push(ch.toLowerCase());
      map.push(i);
      prevSpace = false;
    }
  }
  const normOriginal = chars.join("");

  const minLen = Math.min(30, normTarget.length);
  for (
    let len = normTarget.length;
    len >= minLen;
    len = Math.max(minLen, len - 20)
  ) {
    const searchStr = normTarget.slice(0, len);
    const idx = normOriginal.indexOf(searchStr);
    if (idx >= 0) {
      const startOrig = map[idx] ?? 0;
      const endNorm = Math.min(idx + normTarget.length, normOriginal.length);
      const endOrig =
        (map[endNorm] ?? map[map.length - 1] ?? original.length) + 1;
      return { start: startOrig, end: Math.min(endOrig, original.length) };
    }
    if (len === minLen) break;
  }
  return null;
}

export function CompanyAgentChat({
  agentId,
  companyName,
  isEnabled,
}: AgentChatProps) {
  const agentName = AGENT_NAME;
  const uiColor = CURSIA_BLUE;
  const [view, setView] = useState<"welcome" | "chat">("welcome");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [resolvingChunkId, setResolvingChunkId] = useState<string | null>(null);
  const [sourcePreviewOpen, setSourcePreviewOpen] = useState(false);
  const [sourcePreviewLoading, setSourcePreviewLoading] = useState(false);
  const [sourcePreview, setSourcePreview] = useState<SourcePreviewPayload | null>(null);
  const [sourcePreviewExcerpt, setSourcePreviewExcerpt] = useState<string>("");
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const sendButtonStyle = useMemo(
    () => ({ backgroundColor: uiColor, borderColor: uiColor, color: "#fff" }),
    [uiColor]
  );
  const accentBorder = useMemo(() => ({ borderColor: `${uiColor}33` }), [uiColor]);
  const accentGlow = useMemo(() => ({ boxShadow: `0 0 40px ${uiColor}20` }), [uiColor]);

  const attachPastedImage = useCallback((blob: Blob) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const extension = blob.type.includes("png") ? "png" : blob.type.includes("webp") ? "webp" : "jpg";
    setSelectedImage(new File([blob], `captura-${timestamp}.${extension}`, { type: blob.type || "image/png" }));
  }, []);

  const fetchConversations = useCallback(async () => {
    const res = await fetch(`/api/employee/agents/${agentId}/conversations`);
    if (!res.ok) return;
    setConversations((await res.json()) as ConversationSummary[]);
  }, [agentId]);

  const loadConversation = useCallback(async (conversationId: string) => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/employee/agents/${agentId}/conversations/${conversationId}`);
      if (!res.ok) return;
      const data = await res.json();
      setMessages(
        data.messages.map((m: any) => ({
          id: m.id,
          role: m.role === "USER" ? "user" : "assistant",
          text: m.content,
          meta: m.role === "ASSISTANT"
            ? { mode: (m.mode || "fallback") as AgentResponse["mode"], answer: m.content, confidence: m.confidence || 0, citations: (m.citations || []) as AgentResponse["citations"], alternatives: [], requiresSourceSelection: false, conversationId }
            : undefined,
        }))
      );
    } finally {
      setLoadingHistory(false);
    }
  }, [agentId]);

  useEffect(() => {
    fetchConversations().catch(console.error);
  }, [fetchConversations]);

  useEffect(() => {
    if (!activeConversationId) return;
    loadConversation(activeConversationId).catch(console.error);
  }, [activeConversationId, loadConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const startNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
    setSidebarOpen(false);
    setView("chat");
  };

  const openConversation = (id: string) => {
    setActiveConversationId(id);
    setSidebarOpen(false);
    setView("chat");
  };

  const openSourcePreview = useCallback(async (documentId: string, excerpt: string, chunkId?: string) => {
    setSourcePreviewOpen(true);
    setSourcePreviewLoading(true);
    setSourcePreviewExcerpt(excerpt);
    try {
      const url = chunkId
        ? `/api/employee/agents/${agentId}/sources/${documentId}?chunkId=${chunkId}`
        : `/api/employee/agents/${agentId}/sources/${documentId}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      setSourcePreview((await res.json()) as SourcePreviewPayload);
    } catch {
      setSourcePreview(null);
    } finally {
      setSourcePreviewLoading(false);
    }
  }, [agentId]);

  const resolveAmbiguity = useCallback(async (
    assistantMessageIdx: number,
    option: NonNullable<AgentResponse["alternatives"]>[number],
    messageMeta?: AgentResponse
  ) => {
    const latestUserQuestion = [...messages].slice(0, assistantMessageIdx).reverse().find((m) => m.role === "user")?.text || "";
    if (!latestUserQuestion.trim()) return;
    const currentConversationId = messageMeta?.conversationId || activeConversationId;
    if (!currentConversationId) return;
    setResolvingChunkId(option.chunkId);
    try {
      const res = await fetch(`/api/employee/agents/${agentId}/chat/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: currentConversationId, question: latestUserQuestion, selectedChunkId: option.chunkId, ambiguityEventId: messageMeta?.ambiguityEventId }),
      });
      const data = (await res.json()) as AgentResponse;
      if (!res.ok) throw new Error(data?.message);
      setMessages((prev) => [...prev, { role: "assistant", text: data.answer, meta: data }]);
      fetchConversations().catch(console.error);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", text: err instanceof Error ? err.message : "No pude resolver la ambigüedad." }]);
    } finally {
      setResolvingChunkId(null);
    }
  }, [activeConversationId, agentId, fetchConversations, messages]);

  const submit = async (e: React.FormEvent | null, prefillMessage?: string) => {
    if (e) e.preventDefault();
    const question = (prefillMessage || input).trim() || (selectedImage ? "Analiza la imagen y responde con precisión." : "");
    if (!question && !selectedImage) return;
    if (loading) return;

    if (view === "welcome") setView("chat");

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: selectedImage ? `${question}\n\n[Imagen: ${selectedImage.name}]` : question }]);
    setLoading(true);

    try {
      const isImageAttached = !!selectedImage;
      const res = await fetch(`/api/employee/agents/${agentId}/chat`, isImageAttached ? {
        method: "POST",
        body: (() => {
          const fd = new FormData();
          fd.append("message", question);
          if (activeConversationId) fd.append("conversationId", activeConversationId);
          if (selectedImage) fd.append("image", selectedImage);
          return fd;
        })(),
      } : {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question, conversationId: activeConversationId || undefined }),
      });

      const data = (await res.json()) as AgentResponse;
      if (!res.ok && data?.blocked) {
        setMessages((prev) => [...prev, { role: "assistant", text: "Este agente está deshabilitado temporalmente.", meta: data }]);
        return;
      }
      if (!res.ok) throw new Error(data?.message || "Error al procesar.");
      setMessages((prev) => [...prev, { role: "assistant", text: data.answer, meta: data }]);
      if (data.conversationId && !activeConversationId) setActiveConversationId(data.conversationId);
      setSelectedImage(null);
      if (imageInputRef.current) imageInputRef.current.value = "";
      fetchConversations().catch(console.error);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", text: err instanceof Error && err.message ? err.message : "No pude procesar tu pregunta." }]);
    } finally {
      setLoading(false);
    }
  };

  // ─── Blocked state ────────────────────────────────────────────────────────
  if (!isEnabled) {
    const whatsappUrl = `https://wa.me/573246590060?text=${encodeURIComponent(`Hola, soy de ${companyName} y quiero desbloquear mi agente IA (${agentName}).`)}`;
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-[#0066FF] via-[#1d4ed8] to-[#0f172a] p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-white/10 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <div className="text-white">
            <h2 className="text-2xl font-bold mb-2">Agente pausado</h2>
            <p className="text-blue-100 text-sm">{companyName} · {agentName}</p>
          </div>
          <a href={whatsappUrl} target="_blank" rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-[#25D366] text-white font-bold text-base hover:bg-[#20ba5a] transition">
            <MessageCircle className="w-5 h-5" />
            Escribir por WhatsApp para desbloquear
          </a>
        </motion.div>
      </div>
    );
  }

  // ─── Welcome screen ────────────────────────────────────────────────────────
  if (view === "welcome") {
    return (
      <div
        className="relative flex min-h-[calc(100vh-8rem)] rounded-3xl overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${uiColor}06 0%, transparent 55%)` }}
      >
        {/* History button — top right floating */}
        <AnimatePresence>
          {conversations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: 0.4 }}
              className="absolute top-5 right-5 z-10"
            >
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.04] active:scale-[0.97]"
                style={{ backgroundColor: uiColor, boxShadow: `0 4px 20px ${uiColor}40` }}
              >
                <Clock className="w-4 h-4" />
                Historial
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/25 text-[10px] font-black">
                  {conversations.length > 9 ? "9+" : conversations.length}
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center w-full">
          {/* Bot icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="w-24 h-24 rounded-3xl flex items-center justify-center mb-8 shadow-2xl"
            style={{ backgroundColor: uiColor, ...accentGlow }}
          >
            <Bot className="w-12 h-12 text-white" />
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3 mb-10"
          >
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">
              Hola, soy{" "}
              <span style={{ color: uiColor }}>{agentName}</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-md">
              Tu asistente inteligente con acceso a toda la documentación interna de{" "}
              <span className="font-semibold text-foreground">{companyName}</span>.
            </p>
          </motion.div>

          {/* Input + suggestions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-2xl"
          >
            <form onSubmit={submit}
              className="flex items-center gap-3 p-2 rounded-2xl border bg-background shadow-xl transition-all focus-within:shadow-2xl"
              style={{ ...accentBorder, ...accentGlow }}
            >
              <input ref={imageInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
                onChange={(e) => setSelectedImage(e.target.files?.[0] || null)} />
              <Button type="button" variant="ghost" size="icon" className="h-11 w-11 rounded-xl shrink-0"
                onClick={() => imageInputRef.current?.click()}>
                <Paperclip className="w-5 h-5 opacity-50" />
              </Button>
              <Input
                className="border-0 focus-visible:ring-0 shadow-none text-base bg-transparent h-11"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onPaste={(e) => {
                  const img = Array.from(e.clipboardData.items).find((i) => i.type.startsWith("image/"));
                  if (!img) return;
                  const file = img.getAsFile();
                  if (!file) return;
                  e.preventDefault();
                  attachPastedImage(file);
                }}
                placeholder="¿En qué te puedo ayudar hoy?"
              />
              {selectedImage && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-muted text-xs font-bold shrink-0">
                  <Plus className="w-3 h-3 rotate-45" />
                  <span className="max-w-[80px] truncate">{selectedImage.name}</span>
                  <button type="button" onClick={() => { setSelectedImage(null); if (imageInputRef.current) imageInputRef.current.value = ""; }}>
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              <Button type="submit" size="icon" className="h-11 w-11 rounded-xl shrink-0 shadow-md"
                disabled={!input.trim() && !selectedImage} style={sendButtonStyle}>
                <Send className="w-4 h-4 ml-0.5" />
              </Button>
            </form>

            {/* Suggested questions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="flex flex-wrap justify-center gap-2 mt-5"
            >
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => submit(null, q)}
                  className="px-4 py-2 rounded-full border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/20 hover:bg-muted/50 transition-all"
                >
                  {q}
                </button>
              ))}
            </motion.div>
          </motion.div>

          {/* Bottom label */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-10 flex items-center gap-2 text-xs text-muted-foreground/40"
          >
            <Zap className="w-3 h-3" />
            Respuestas basadas en los documentos internos de {companyName}
          </motion.div>
        </div>

        {/* Conversation drawer */}
        <ConversationDrawer
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          conversations={conversations}
          activeId={activeConversationId}
          onSelect={openConversation}
          onNew={startNewChat}
          uiColor={uiColor}
        />
      </div>
    );
  }

  // ─── Chat screen ──────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col rounded-3xl border overflow-hidden" style={{ height: "calc(100vh - 8rem)", ...accentBorder }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background/80 backdrop-blur-sm shrink-0" style={accentBorder}>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setView("welcome")}
            className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: uiColor }}>
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm leading-none">{agentName}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{companyName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="text-white border-0 text-[10px] px-2" style={{ backgroundColor: uiColor }}>
            Activo
          </Badge>
          <button type="button" onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground relative">
            <Menu className="w-5 h-5" />
            {conversations.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ backgroundColor: uiColor }} />
            )}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {loadingHistory ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: uiColor }} />
            <p className="text-sm font-medium">Cargando conversación...</p>
          </div>
        ) : (
          <>
            {messages.map((message, idx) => (
              <MessageBubble
                key={idx}
                message={message}
                idx={idx}
                messages={messages}
                uiColor={uiColor}
                agentId={agentId}
                resolvingChunkId={resolvingChunkId}
                onResolveAmbiguity={resolveAmbiguity}
                onOpenSource={openSourcePreview}
              />
            ))}
            {loading && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-end gap-3">
                <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center" style={{ backgroundColor: uiColor }}>
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-muted/60 border border-muted flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full animate-bounce [animation-delay:0ms]" style={{ backgroundColor: uiColor }} />
                  <span className="w-2 h-2 rounded-full animate-bounce [animation-delay:150ms]" style={{ backgroundColor: uiColor }} />
                  <span className="w-2 h-2 rounded-full animate-bounce [animation-delay:300ms]" style={{ backgroundColor: uiColor }} />
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="px-4 pb-5 pt-3 shrink-0 border-t bg-background/80 backdrop-blur-sm" style={accentBorder}>
        <input ref={imageInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
          onChange={(e) => setSelectedImage(e.target.files?.[0] || null)} />
        <form onSubmit={submit}
          className="flex items-end gap-2 p-2 rounded-2xl border bg-background shadow-lg focus-within:shadow-xl transition-all"
          style={accentBorder}
        >
          <Button type="button" variant="ghost" size="icon" className="h-10 w-10 rounded-xl shrink-0"
            onClick={() => imageInputRef.current?.click()} disabled={loading}>
            <Paperclip className="w-4 h-4 opacity-60" />
          </Button>
          <div className="flex-1 flex flex-col gap-1.5">
            <AnimatePresence>
              {selectedImage && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-muted/60 text-xs font-bold">
                  <Plus className="w-3 h-3 rotate-45 shrink-0" style={{ color: uiColor }} />
                  <span className="truncate max-w-[140px]">{selectedImage.name}</span>
                  <button type="button" className="ml-auto" onClick={() => { setSelectedImage(null); if (imageInputRef.current) imageInputRef.current.value = ""; }}>
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            <Input
              className="border-0 focus-visible:ring-0 shadow-none h-10 text-sm bg-transparent px-1"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onPaste={(e) => {
                const img = Array.from(e.clipboardData.items).find((i) => i.type.startsWith("image/"));
                if (!img) return;
                const file = img.getAsFile();
                if (!file) return;
                e.preventDefault();
                attachPastedImage(file);
              }}
              placeholder="Escribe tu mensaje..."
              disabled={loading}
            />
          </div>
          <Button type="submit" size="icon" className="h-10 w-10 rounded-xl shrink-0 shadow-md transition-all active:scale-95"
            disabled={loading || (!input.trim() && !selectedImage)} style={sendButtonStyle}>
            <Send className="w-4 h-4 ml-0.5" />
          </Button>
        </form>
      </div>

      {/* Conversation drawer */}
      <ConversationDrawer
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        conversations={conversations}
        activeId={activeConversationId}
        onSelect={openConversation}
        onNew={startNewChat}
        uiColor={uiColor}
      />

      {/* Source preview modal */}
      <SourcePreviewModal
        open={sourcePreviewOpen}
        onClose={() => setSourcePreviewOpen(false)}
        loading={sourcePreviewLoading}
        sourcePreview={sourcePreview}
        sourcePreviewExcerpt={sourcePreviewExcerpt}
        uiColor={uiColor}
      />
    </div>
  );
}

// ─── Conversation Drawer ───────────────────────────────────────────────────
function ConversationDrawer({
  open, onClose, conversations, activeId, onSelect, onNew, uiColor,
}: {
  open: boolean;
  onClose: () => void;
  conversations: ConversationSummary[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  uiColor: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={onClose} />
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-80 bg-background border-l shadow-2xl flex flex-col"
            style={{ borderColor: `${uiColor}22` }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: `${uiColor}22` }}>
              <h3 className="font-bold text-sm">Conversaciones</h3>
              <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-4 pt-3">
              <button type="button" onClick={onNew}
                className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-bold text-white shadow-md transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ backgroundColor: uiColor }}>
                <Plus className="w-4 h-4" />
                Nuevo chat
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
              {conversations.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8 italic">Sin conversaciones aún.</p>
              ) : (
                conversations.map((conv) => (
                  <button key={conv.id} type="button" onClick={() => onSelect(conv.id)}
                    className={["w-full text-left px-4 py-3 rounded-xl transition-all border group", activeId === conv.id ? "bg-muted border-border" : "border-transparent hover:bg-muted/50 hover:border-border/50"].join(" ")}
                    style={activeId === conv.id ? { borderColor: `${uiColor}44` } : undefined}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold line-clamp-1">{conv.title}</p>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{conv.lastMessage || "Sin mensajes"}</p>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Message Bubble ────────────────────────────────────────────────────────
function MessageBubble({
  message, idx, messages, uiColor, agentId, resolvingChunkId, onResolveAmbiguity, onOpenSource,
}: {
  message: Message;
  idx: number;
  messages: Message[];
  uiColor: string;
  agentId: string;
  resolvingChunkId: string | null;
  onResolveAmbiguity: (idx: number, option: NonNullable<AgentResponse["alternatives"]>[number], meta?: AgentResponse) => void;
  onOpenSource: (documentId: string, excerpt: string, chunkId?: string) => void;
}) {
  const isUser = message.role === "user";
  const [feedbackState, setFeedbackState] = useState<"none" | "helpful" | "not_helpful">("none");
  const [feedbackComment, setFeedbackComment] = useState("");
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [feedbackSaving, setFeedbackSaving] = useState(false);

  const submitFeedback = async (helpful: boolean, comment?: string) => {
    const msgId = message.meta?.messageId;
    if (!msgId) return;
    setFeedbackSaving(true);
    try {
      await fetch(`/api/employee/agents/${agentId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: msgId, helpful, comment: comment || undefined }),
      });
      setFeedbackState(helpful ? "helpful" : "not_helpful");
      setShowCommentBox(false);
    } catch { /* silent */ } finally {
      setFeedbackSaving(false);
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", damping: 28, stiffness: 380 }}
      className={["flex gap-3", isUser ? "justify-end" : "justify-start items-end"].join(" ")}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center shadow-sm mb-0.5" style={{ backgroundColor: uiColor }}>
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      <div className={["flex flex-col max-w-[78%]", isUser ? "items-end" : "items-start"].join(" ")}>
        <div
          className={["px-4 py-3 shadow-sm text-[14px] leading-relaxed select-text", isUser ? "rounded-2xl rounded-tr-sm text-white font-medium" : "rounded-2xl rounded-tl-sm bg-muted/50 border"].join(" ")}
          style={isUser
            ? { backgroundColor: uiColor, boxShadow: `0 4px 16px ${uiColor}30` }
            : { borderLeftColor: uiColor, borderLeftWidth: "3px" }
          }
        >
          {isUser ? message.text : (
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
                ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                h1: ({ children }) => <h1 className="text-base font-bold mb-2">{children}</h1>,
                h2: ({ children }) => <h2 className="text-sm font-bold mb-1.5">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-semibold mb-1">{children}</h3>,
                code: ({ children }) => <code className="bg-black/10 rounded px-1 py-0.5 text-xs font-mono">{children}</code>,
                a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="underline font-medium hover:opacity-80">{children}</a>,
              }}
            >
              {message.text}
            </ReactMarkdown>
          )}
        </div>

        {/* Meta bar */}
        {!isUser && message.meta && (
          <div className="flex items-center gap-2 mt-2 ml-1">
            <span className={[
              "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
              message.meta.mode === "fallback" ? "bg-muted text-muted-foreground" :
              message.meta.mode === "ambiguous" ? "bg-amber-100 text-amber-700" :
              "bg-emerald-50 text-emerald-700",
            ].join(" ")}>
              {getModeLabel(message.meta.mode)}
            </span>
            <span className="text-[10px] font-bold flex items-center gap-1" style={{ color: uiColor }}>
              <ShieldCheck className="w-3 h-3" />
              {(message.meta.confidence * 100).toFixed(0)}%
            </span>
          </div>
        )}

        {/* Multi-source contradiction indicator */}
        {!isUser && message.meta?.mode === "grounded" && (() => {
          const uniqueDocs = new Set(message.meta!.citations.map((c) => c.documentId));
          if (uniqueDocs.size < 2) return null;
          return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mt-2 ml-1 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-orange-700 font-medium">
                Información cruzada de {uniqueDocs.size} documentos — verifica qué versión aplica.
              </p>
            </motion.div>
          );
        })()}

        {/* Ambiguity resolution */}
        {!isUser && message.meta?.mode === "ambiguous" && !!message.meta.alternatives?.length && (() => {
          const alreadyResolved = idx < messages.length - 1 && messages.slice(idx + 1).some((m) => m.role === "assistant" && m.meta?.mode === "grounded");
          return (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-3 space-y-2 w-full">
              <div className={["rounded-xl border p-3", alreadyResolved ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"].join(" ")}>
                <div className="flex items-center gap-2">
                  <AlertTriangle className={["w-3.5 h-3.5", alreadyResolved ? "text-emerald-600" : "text-amber-600"].join(" ")} />
                  <p className={["text-xs font-bold", alreadyResolved ? "text-emerald-700" : "text-amber-700"].join(" ")}>
                    {alreadyResolved ? "Ambigüedad resuelta" : "Encontré información en dos fuentes — ¿cuál aplica?"}
                  </p>
                </div>
              </div>
              <div className={["grid grid-cols-2 gap-2", alreadyResolved ? "opacity-50 pointer-events-none" : ""].join(" ")}>
                {message.meta!.alternatives!.map((option, optIdx) => (
                  <div key={option.chunkId} className="rounded-xl border bg-background p-3 space-y-2 hover:shadow-md transition-all border-amber-100">
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-50 text-amber-600">Fuente {optIdx + 1}</span>
                    <p className="font-bold text-xs line-clamp-1">{option.title}</p>
                    <p className="text-[11px] text-muted-foreground line-clamp-3 leading-snug">{option.summary}</p>
                    <Button size="sm" variant="outline" className="w-full h-7 text-[11px] font-bold border-amber-200 hover:bg-amber-50"
                      disabled={!!resolvingChunkId}
                      onClick={() => onResolveAmbiguity(idx, option, message.meta)}>
                      {resolvingChunkId === option.chunkId ? <><Loader2 className="w-3 h-3 animate-spin mr-1" />Procesando...</> : "Usar esta fuente"}
                    </Button>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })()}

        {/* Citations */}
        {!isUser && message.meta?.mode !== "image" && (message.meta?.citations?.length ?? 0) > 0 && (
          <div className="mt-3 space-y-1.5 w-full">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 ml-0.5">Fuentes</p>
            {message.meta!.citations.map((citation, citIdx) => (
              <motion.div key={`${citation.documentId}-${citIdx}`}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: citIdx * 0.06 }}
                className="flex items-start gap-3 px-3 py-2.5 rounded-xl border bg-background hover:bg-muted/20 transition-all"
                style={{ borderLeft: `3px solid ${uiColor}` }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className="font-bold text-[12px] truncate">{citation.title}</p>
                    <span className="text-[10px] font-bold shrink-0 text-muted-foreground">{(citation.score * 100).toFixed(0)}%</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 italic opacity-80">"{citation.excerpt}"</p>
                  {citation.fileUrl && (
                    <button type="button"
                      onClick={() => onOpenSource(citation.documentId, citation.excerpt, citation.chunkId)}
                      className="mt-1.5 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider hover:opacity-80 transition-opacity"
                      style={{ color: uiColor }}>
                      <ArrowRight className="w-3 h-3" />
                      Ver evidencia
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Feedback */}
        {!isUser && message.meta?.messageId && (
          <div className="mt-2 ml-0.5">
            {feedbackState === "none" ? (
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-muted-foreground/60 mr-1">¿Te sirvió?</span>
                <button
                  type="button"
                  disabled={feedbackSaving}
                  onClick={() => submitFeedback(true)}
                  className="p-1.5 rounded-lg hover:bg-emerald-50 text-muted-foreground/50 hover:text-emerald-600 transition-colors"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={feedbackSaving}
                  onClick={() => setShowCommentBox(true)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground/50 hover:text-red-500 transition-colors"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <p className={`text-[10px] font-medium ${feedbackState === "helpful" ? "text-emerald-600" : "text-red-500"}`}>
                {feedbackState === "helpful" ? "Gracias por tu feedback" : "Feedback registrado — lo revisaremos"}
              </p>
            )}
            {showCommentBox && feedbackState === "none" && (
              <div className="mt-1.5 flex gap-1.5 items-end">
                <input
                  type="text"
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="¿Qué faltó o estuvo mal?"
                  maxLength={500}
                  className="flex-1 text-xs border rounded-lg px-2.5 py-1.5 bg-background focus:outline-none focus:ring-1"
                  style={{ focusRingColor: uiColor } as React.CSSProperties}
                />
                <button
                  type="button"
                  disabled={feedbackSaving}
                  onClick={() => submitFeedback(false, feedbackComment)}
                  className="text-[10px] font-bold px-3 py-1.5 rounded-lg text-white shrink-0"
                  style={{ backgroundColor: uiColor }}
                >
                  {feedbackSaving ? "..." : "Enviar"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Source Preview Modal ──────────────────────────────────────────────────
function SourcePreviewModal({
  open, onClose, loading, sourcePreview, sourcePreviewExcerpt, uiColor,
}: {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  sourcePreview: SourcePreviewPayload | null;
  sourcePreviewExcerpt: string;
  uiColor: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: "spring", damping: 22, stiffness: 320 }}
            className="relative w-full max-w-3xl max-h-[88vh] overflow-hidden rounded-3xl border bg-background shadow-2xl flex flex-col"
            style={{ borderColor: `${uiColor}33` }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/10" style={{ borderColor: `${uiColor}22` }}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl" style={{ backgroundColor: `${uiColor}15` }}>
                  <ShieldCheck className="w-4 h-4" style={{ color: uiColor }} />
                </div>
                <div>
                  <p className="text-sm font-bold">{sourcePreview?.title || "Evidencia"}</p>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-bold">Fuente verificada</p>
                </div>
              </div>
              <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-muted transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin" style={{ color: uiColor }} />
                  <p className="text-sm font-medium">Buscando fragmento...</p>
                </div>
              ) : sourcePreview && (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-300">
                  <div className="rounded-xl border border-dashed p-4" style={{ borderColor: `${uiColor}44`, background: `${uiColor}06` }}>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2">Fragmento referenciado</p>
                    <p className="text-xs font-semibold leading-relaxed whitespace-pre-wrap line-clamp-6">&ldquo;{sourcePreviewExcerpt}&rdquo;</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-3 top-0 bottom-0 w-0.5 rounded-full opacity-25" style={{ backgroundColor: uiColor }} />
                    <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-7 text-foreground/85 pl-2">
                      {(() => {
                        const raw = sourcePreview.rawText || "";
                        const fullChunk = (sourcePreview.chunkContent || "").trim();
                        const excerpt = sourcePreviewExcerpt.trim();
                        if (!raw.trim()) return raw.slice(0, 2400);

                        let match: { start: number; end: number } | null = null;

                        if (excerpt) {
                          match = findMatchInOriginal(raw, excerpt);
                        }

                        if (!match && fullChunk) {
                          const chunkMatch = findMatchInOriginal(raw, fullChunk);
                          if (chunkMatch) {
                            match = {
                              start: chunkMatch.start,
                              end: Math.min(chunkMatch.start + 350, chunkMatch.end),
                            };
                          }
                        }

                        if (!match) return raw.slice(0, 2400);
                        const viewStart = Math.max(0, match.start - 400);
                        const viewEnd = Math.min(raw.length, match.end + 400);
                        return [
                          viewStart > 0 && <span key="e0" className="text-muted-foreground/40">…{"\n"}</span>,
                          <span key="b">{raw.slice(viewStart, match.start)}</span>,
                          <mark key="h" className="rounded-sm px-0.5 font-semibold" style={{ backgroundColor: `${uiColor}28`, borderBottom: `2px solid ${uiColor}` }}>
                            {raw.slice(match.start, match.end)}
                          </mark>,
                          <span key="a">{raw.slice(match.end, viewEnd)}</span>,
                          viewEnd < raw.length && <span key="e1" className="text-muted-foreground/40">{"\n"}…</span>,
                        ].filter(Boolean) as ReactNode[];
                      })()}
                    </pre>
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t bg-muted/5 flex justify-end" style={{ borderColor: `${uiColor}22` }}>
              <Button onClick={onClose} className="rounded-xl px-6 font-bold" style={{ backgroundColor: uiColor, color: "#fff" }}>
                Entendido
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
