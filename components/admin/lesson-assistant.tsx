"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Bot, Send, User, Loader2, Minus, Maximize2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface ModuleLesson {
    title: string;
    content: string;
}

interface LessonAssistantProps {
    courseTitle: string;
    moduleTitle: string;
    currentLessonTitle: string;
    moduleLessons: ModuleLesson[];
    position?: "left" | "right";
    className?: string;
    /**
     * When true, the floating bubble sits above modal overlays and plays a
     * gentle bounce animation to draw the user's attention to it (used during
     * the first-time intro modal).
     */
    highlight?: boolean;
}

export function LessonAssistant({
    courseTitle,
    moduleTitle,
    currentLessonTitle,
    moduleLessons,
    position = "right",
    className,
    highlight = false,
}: LessonAssistantProps) {
    const [isMinimized, setIsMinimized] = useState(true);

    const greetingFor = (mod: string) =>
        `¡Hola! Soy tu Asistente Cursia. Conozco el contenido completo del módulo "${mod}", así que puedes preguntarme sobre cualquier lección de este módulo. ¿En qué te ayudo?`;

    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: greetingFor(moduleTitle) },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Reset the conversation whenever the module changes. The assistant's
    // backend context is per-module, so carrying over a prior module's history
    // would be misleading. Regenerating the greeting also gives the user a
    // visible confirmation that the context follows them across modules.
    useEffect(() => {
        setMessages([{ role: "assistant", content: greetingFor(moduleTitle) }]);
    }, [moduleTitle]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput("");
        setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat/lesson", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: userMessage,
                    courseTitle,
                    moduleTitle,
                    currentLessonTitle,
                    moduleLessons,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to fetch response");
            }

            const data = await response.json();
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: data.response },
            ]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "Lo siento, tuve un problema al procesar tu pregunta. Por favor intenta de nuevo.",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className={cn(
            "fixed bottom-6 w-[450px] shadow-2xl border border-slate-200 rounded-2xl flex flex-col overflow-hidden transition-all duration-300 ease-in-out bg-white",
            position === "left" ? "left-6" : "right-6",
            isMinimized ? "h-[80px]" : "h-[700px]",
            // Sit above the dialog overlay (z-50) so the user can see the
            // bubble being highlighted during the intro modal.
            highlight && isMinimized ? "z-[60] animate-bounce ring-4 ring-cursia-blue/30" : "z-50",
            className
        )}>
            <CardHeader className="bg-cursia-blue p-4 flex flex-row items-center justify-between space-y-0 cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
                <div className="flex items-center gap-3">
                    <div className="bg-white/15 p-2 rounded-full">
                        <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-white text-lg font-bold">Asistente Cursia</CardTitle>
                        <p className="text-white/80 text-xs">Tu acompañante de aprendizaje</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsMinimized(!isMinimized);
                    }}
                    className="text-white hover:bg-white/20 rounded-full"
                >
                    {isMinimized ? <Maximize2 className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
                </Button>
            </CardHeader>

            {!isMinimized && (
                <CardContent className="flex-1 p-0 flex flex-col bg-slate-50 overflow-hidden">
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-4 space-y-4"
                    >
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={cn(
                                    "flex gap-3 max-w-[85%]",
                                    msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                                )}
                            >
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm",
                                    msg.role === "user"
                                        ? "bg-cursia-blue text-white"
                                        : "bg-white text-cursia-blue border border-slate-200"
                                )}>
                                    {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-5 h-5" />}
                                </div>
                                <div
                                    className={cn(
                                        "p-3 rounded-2xl text-sm shadow-sm leading-relaxed",
                                        msg.role === "user"
                                            ? "bg-cursia-blue text-white rounded-tr-none whitespace-pre-wrap"
                                            : "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
                                    )}
                                >
                                    {msg.role === "user" ? (
                                        msg.content
                                    ) : (
                                        <ReactMarkdown
                                            components={{
                                                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                                strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                                                em: ({ children }) => <em className="italic">{children}</em>,
                                                ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>,
                                                ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>,
                                                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                                                h1: ({ children }) => <h1 className="text-base font-bold mb-2">{children}</h1>,
                                                h2: ({ children }) => <h2 className="text-sm font-bold mb-1.5">{children}</h2>,
                                                h3: ({ children }) => <h3 className="text-sm font-semibold mb-1">{children}</h3>,
                                                code: ({ children }) => <code className="bg-slate-100 rounded px-1 py-0.5 text-xs font-mono">{children}</code>,
                                                a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="underline font-medium text-cursia-blue hover:opacity-80">{children}</a>,
                                            }}
                                        >
                                            {msg.content}
                                        </ReactMarkdown>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-3 max-w-[85%]">
                                <div className="w-8 h-8 rounded-full bg-white text-cursia-blue border border-slate-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                                    <Bot className="w-5 h-5" />
                                </div>
                                <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-white border-t border-slate-100">
                        <form onSubmit={handleSubmit} className="flex gap-2">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Pregunta sobre este módulo..."
                                className="rounded-xl border-slate-200 focus-visible:ring-cursia-blue"
                                disabled={isLoading}
                            />
                            <Button
                                type="submit"
                                size="icon"
                                disabled={isLoading || !input.trim()}
                                className="rounded-xl bg-cursia-blue hover:bg-cursia-blue/90 text-white shadow-md"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            </Button>
                        </form>
                    </div>
                </CardContent>
            )}
        </Card>
    );
}
