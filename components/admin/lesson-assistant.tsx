"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Bot, Send, X, MessageCircle, Sparkles, User, Loader2, Minus, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface LessonAssistantProps {
    lessonTitle: string;
    lessonContent: string;
    position?: "left" | "right";
    className?: string;
}

export function LessonAssistant({
    lessonTitle,
    lessonContent,
    position = "right",
    className
}: LessonAssistantProps) {
    const [isMinimized, setIsMinimized] = useState(true);

    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: `¡Hola! Soy tu asistente de IA para esta lección. Estoy aquí para ayudarte a entender "${lessonTitle}". ¿Tienes alguna pregunta?`,
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

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
                    lessonContent,
                    lessonTitle,
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
            "fixed bottom-6 w-[450px] shadow-2xl border-none rounded-2xl z-50 flex flex-col overflow-hidden transition-all duration-300 ease-in-out",
            position === "left" ? "left-6" : "right-6",
            isMinimized ? "h-[80px]" : "h-[700px]",
            className
        )}>
            <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex flex-row items-center justify-between space-y-0 cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                        <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-white text-lg font-bold">Asistente IA</CardTitle>
                        <p className="text-indigo-100 text-xs">Conectado a Claude 3.5</p>
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
                                    msg.role === "user" ? "bg-indigo-600 text-white" : "bg-white text-purple-600 border border-purple-100"
                                )}>
                                    {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-5 h-5" />}
                                </div>
                                <div
                                    className={cn(
                                        "p-3 rounded-2xl text-sm shadow-sm",
                                        msg.role === "user"
                                            ? "bg-indigo-600 text-white rounded-tr-none"
                                            : "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
                                    )}
                                >
                                    <div className="whitespace-pre-wrap leading-relaxed">
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-3 max-w-[85%]">
                                <div className="w-8 h-8 rounded-full bg-white text-purple-600 border border-purple-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                                    <Bot className="w-5 h-5" />
                                </div>
                                <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
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
                                placeholder="Pregunta sobre la lección..."
                                className="rounded-xl border-slate-200 focus-visible:ring-indigo-500"
                                disabled={isLoading}
                            />
                            <Button
                                type="submit"
                                size="icon"
                                disabled={isLoading || !input.trim()}
                                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200"
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
