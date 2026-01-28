"use client";

import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { ChevronDown, ChevronUp } from "lucide-react";

interface QuizAttempt {
    id: string;
    quizId: string;
    score: number;
}

interface Quiz {
    id: string;
    question: string;
}

interface Lesson {
    id: string;
    title: string;
    quizzes: Quiz[];
}

interface Module {
    id: string;
    title: string;
    lessons: Lesson[];
}

interface ModuleProgress {
    moduleId: string;
    completed: boolean;
}

interface EnrollmmentLessonProgress {
    lessonId: string;
    completed: boolean;
}

interface ModuleProgressCardProps {
    module: Module;
    enrollmentId: string;
    lessonProgress: EnrollmmentLessonProgress[];
    quizAttempts: QuizAttempt[];
}

export function ModuleProgressCard({
    module,
    lessonProgress,
    quizAttempts,
}: ModuleProgressCardProps) {
    const [isOpen, setIsOpen] = useState(false);

    const modLessons = module.lessons;
    const completed = modLessons.filter((l) =>
        lessonProgress.some((lp) => lp.lessonId === l.id && lp.completed)
    ).length;
    const modPercent =
        modLessons.length > 0
            ? Math.round((completed / modLessons.length) * 100)
            : 0;

    // Evaluation/Quiz Stats
    const moduleQuizzes = modLessons.flatMap((l) => l.quizzes);
    const totalQuizQuestions = moduleQuizzes.length;

    // Count unique quizzes completed (attempted)
    const completedQuizzes = new Set(
        quizAttempts
            .filter((qa) => moduleQuizzes.some((mq) => mq.id === qa.quizId))
            .map((qa) => qa.quizId)
    ).size;

    const quizPercent =
        totalQuizQuestions > 0
            ? Math.round((completedQuizzes / totalQuizQuestions) * 100)
            : 0;

    const lessonsWithQuizzes = modLessons.filter((l) => l.quizzes.length > 0);

    return (
        <div className="p-6 rounded-[1.5rem] border border-slate-100 hover:bg-slate-50 transition-colors bg-white">
            <div className="grid md:grid-cols-2 gap-8">
                {/* Lesson Progress (Left) */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-700">
                            {module.title}
                        </span>
                        <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                            {modPercent}%
                        </span>
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            <span>Progreso de Lecciones</span>
                            <span>
                                {completed}/{modLessons.length}
                            </span>
                        </div>
                        <Progress
                            value={modPercent}
                            className="h-2 bg-slate-100"
                            indicatorClassName="bg-blue-500"
                        />
                    </div>
                </div>

                {/* Evaluation Progress (Right) */}
                <div className="space-y-3 pl-0 md:pl-8 md:border-l border-slate-100">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                            Evaluación del Módulo
                        </span>
                        <span
                            className={`text-xs font-black px-2 py-1 rounded-md ${quizPercent === 100
                                    ? "text-emerald-600 bg-emerald-50"
                                    : "text-slate-600 bg-slate-100"
                                }`}
                        >
                            {quizPercent}%
                        </span>
                    </div>

                    <div className="space-y-1">
                        <Progress
                            value={quizPercent}
                            className="h-2 bg-slate-100"
                            indicatorClassName={
                                quizPercent === 100 ? "bg-emerald-500" : "bg-slate-400"
                            }
                        />
                    </div>

                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2 hover:text-blue-500 transition-colors w-full text-left"
                    >
                        {isOpen ? (
                            <ChevronUp className="w-3 h-3" />
                        ) : (
                            <ChevronDown className="w-3 h-3" />
                        )}
                        {isOpen ? "Ocultar detalles" : "Ver detalles"}
                    </button>
                </div>
            </div>

            {isOpen && (
                <div className="mt-6 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
                    {lessonsWithQuizzes.length > 0 ? (
                        <div className="space-y-4">
                            {lessonsWithQuizzes.map((lesson) => (
                                <div key={lesson.id} className="space-y-2">
                                    <div className="text-xs font-bold text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                                        {lesson.title}
                                    </div>
                                    <div className="grid gap-2 pl-2">
                                        {lesson.quizzes.map((quiz) => {
                                            // Find attempts for this quiz
                                            const attempts = quizAttempts
                                                .filter((qa) => qa.quizId === quiz.id)
                                                .sort((a, b) => b.score - a.score); // Best score first
                                            const bestAttempt = attempts[0];
                                            const hasAttempt = attempts.length > 0;

                                            // Determine color based on score or existence logic
                                            // Assuming score is 0-100 or check pass/fail if business logic known.
                                            // For now, just display the raw score.

                                            return (
                                                <div
                                                    key={quiz.id}
                                                    className="flex items-center justify-between text-[11px] p-2 rounded border border-slate-100 bg-white"
                                                >
                                                    <span className="text-slate-500 truncate flex-1 mr-4" title={quiz.question}>
                                                        {quiz.question}
                                                    </span>
                                                    <span
                                                        className={`font-black px-2 py-0.5 rounded ${hasAttempt
                                                                ? "bg-indigo-50 text-indigo-600"
                                                                : "bg-slate-100 text-slate-400"
                                                            }`}
                                                    >
                                                        {hasAttempt ? `${bestAttempt.score} pts` : "No presentado"}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-xs italic text-slate-400 text-center py-2">
                            Este módulo no contiene evaluaciones.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
