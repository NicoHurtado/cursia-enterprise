"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { LessonAssistant } from "./lesson-assistant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  FileText,
  Video,
  Music,
  HelpCircle,
  Layers,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Play,
  Flame,
  Trophy,
  Star,
  Zap,
  Eye
} from "lucide-react";
import { StructuredContentRenderer } from "@/components/course/StructuredContentRenderer";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface CourseTestPlayerProps {
  course: {
    id: string;
    title: string;
    description: string | null;
    modules: Array<{
      id: string;
      title: string;
      lessons: Array<{
        id: string;
        title: string;
        content: string;
        videoUrl: string | null;
        audioUrl: string | null;
        images?: any;
        quizzes: Array<{
          id: string;
          question: string;
          options: any;
          explanation: string | null;
        }>;
        flashcards: Array<{
          id: string;
          front: string;
          back: string;
        }>;
      }>;
    }>;
    finalEvaluation: {
      id: string;
      questions: any;
      passingScore: number;
    } | null;
  };
  allLessons: Array<{
    id: string;
    title: string;
    content: string;
    videoUrl: string | null;
    audioUrl: string | null;
    images?: any;
    moduleTitle: string;
    moduleId: string;
    quizzes: Array<{
      id: string;
      question: string;
      options: any;
      explanation: string | null;
    }>;
    flashcards: Array<{
      id: string;
      front: string;
      back: string;
    }>;
  }>;
}

export function CourseTestPlayer({ course, allLessons }: CourseTestPlayerProps) {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"lesson" | "quiz" | "flashcard" | "evaluation" | "taking_evaluation" | "evaluation_result">("lesson");
  const [evaluationResult, setEvaluationResult] = useState<{ score: number; passed: boolean; feedback?: string } | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number[]>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<string, boolean>>({});
  const [quizScores, setQuizScores] = useState<Record<string, number>>({});
  const [quizPassed, setQuizPassed] = useState<Record<string, boolean>>({});
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const PASSING_SCORE = 70;

  const isDistractionFree = viewMode === "taking_evaluation";

  const currentLesson = allLessons[currentLessonIndex];
  const hasQuizzes = currentLesson?.quizzes.length > 0;
  const currentLessonQuizPassed = currentLesson ? quizPassed[currentLesson.id] : false;

  const progress = allLessons.length > 0
    ? Math.round(((currentLessonIndex + 1) / allLessons.length) * 100)
    : 0;

  const canGoNext = currentLessonIndex < allLessons.length - 1;
  const canGoPrev = viewMode === "quiz" || (viewMode === "lesson" && currentLessonIndex > 0) || (viewMode === "evaluation" && allLessons.length > 0);
  const canProceedToNext = !hasQuizzes || currentLessonQuizPassed;

  const handleNext = () => {
    if (viewMode === "lesson" && hasQuizzes) {
      setViewMode("quiz");
      return;
    }

    if (viewMode === "quiz") {
      if (!canProceedToNext) return;

      if (canGoNext) {
        setCurrentLessonIndex(currentLessonIndex + 1);
        setViewMode("lesson");
        setFlashcardIndex(0);
        setFlashcardFlipped(false);
        setQuizAnswers({});
        setQuizSubmitted({});
        // Scroll to top when moving to next lesson
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      } else if (course.finalEvaluation) {
        setViewMode("evaluation");
        setQuizAnswers({});
        setQuizSubmitted({});
        return;
      }
    }

    if (viewMode === "lesson" && !hasQuizzes) {
      if (canGoNext) {
        setCurrentLessonIndex(currentLessonIndex + 1);
        setViewMode("lesson");
        setFlashcardIndex(0);
        setFlashcardFlipped(false);
        setQuizAnswers({});
        setQuizSubmitted({});
        // Scroll to top when moving to next lesson
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      } else if (course.finalEvaluation) {
        setViewMode("evaluation");
        setQuizAnswers({});
        setQuizSubmitted({});
        return;
      }
    }
  };

  const handlePrev = () => {
    if (viewMode === "quiz") {
      setViewMode("lesson");
      return;
    }

    if (viewMode === "lesson" && currentLessonIndex > 0) {
      const prevLessonIndex = currentLessonIndex - 1;
      setCurrentLessonIndex(prevLessonIndex);
      setFlashcardIndex(0);
      setFlashcardFlipped(false);
      setQuizAnswers({});
      setQuizSubmitted({});
      setViewMode("lesson");
      // Scroll to top when moving to previous lesson
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (viewMode === "evaluation" && allLessons.length > 0) {
      const lastLessonIndex = allLessons.length - 1;
      const lastLesson = allLessons[lastLessonIndex];
      const lastLessonHasQuizzes = lastLesson?.quizzes.length > 0;
      const lastLessonQuizPassed = lastLesson ? quizPassed[lastLesson.id] : false;

      setCurrentLessonIndex(lastLessonIndex);
      setFlashcardIndex(0);
      setFlashcardFlipped(false);
      setQuizAnswers({});
      setQuizSubmitted({});

      if (lastLessonHasQuizzes && !lastLessonQuizPassed) {
        setViewMode("quiz");
      } else {
        setViewMode("lesson");
      }
    }
  };

  const handleCompleteLesson = () => {
    if (currentLesson) {
      setCompletedLessons((prev) => new Set([...prev, currentLesson.id]));
    }
  };

  if (!currentLesson) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md rounded-2xl shadow-lg border-none">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">¡Ups!</h3>
            <p className="text-slate-500">No hay lecciones disponibles en este curso todavía.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Module colors for the sidebar
  const moduleColors = [
    "bg-blue-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-orange-500",
    "bg-emerald-500",
    "bg-cyan-500",
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 font-nunito">
      <div className="w-full space-y-6">

        {/* Header with Gamification */}
        {!isDistractionFree && (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                {course.title}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-full px-3">
                  <Layers className="w-3 h-3 mr-1" />
                  {course.modules.length} Módulos
                </Badge>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-full px-3">
                  <Video className="w-3 h-3 mr-1" />
                  {allLessons.length} Lecciones
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 min-w-[150px] md:min-w-[200px]">
                <div className="flex justify-between text-xs mb-1.5 font-bold text-slate-500">
                  <span>Tu Progreso</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-3 rounded-full bg-slate-100" indicatorClassName="bg-gradient-to-r from-indigo-500 to-purple-500" />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar - Course Structure */}
          {!isDistractionFree && (
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden sticky top-6">
                <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                  <h2 className="font-bold text-slate-700 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    Tu Ruta de Aprendizaje
                  </h2>
                </div>
                <div className="p-3 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
                  {course.modules.map((module, modIndex) => {
                    const modColor = moduleColors[modIndex % moduleColors.length];

                    return (
                      <div key={module.id} className="space-y-2">
                        <div className="flex items-center gap-3 px-2">
                          <div className={`w-8 h-8 rounded-lg ${modColor} flex items-center justify-center text-white shadow-sm`}>
                            <span className="font-bold text-sm">{modIndex + 1}</span>
                          </div>
                          <h3 className="font-bold text-sm text-slate-700 line-clamp-1" title={module.title}>
                            {module.title}
                          </h3>
                        </div>

                        <div className="space-y-1 ml-3 pl-4 border-l-2 border-slate-100">
                          {module.lessons.map((lesson) => {
                            const globalIndex = allLessons.findIndex((l) => l.id === lesson.id);
                            const isCurrentLesson = globalIndex === currentLessonIndex && viewMode === "lesson";
                            const isCurrentQuiz = globalIndex === currentLessonIndex && viewMode === "quiz";
                            const isCurrent = isCurrentLesson || isCurrentQuiz;
                            const isCompleted = completedLessons.has(lesson.id);

                            return (
                              <div key={lesson.id}>
                                <button
                                  onClick={() => {
                                    setCurrentLessonIndex(globalIndex);
                                    setViewMode("lesson");
                                    // Scroll to top when clicking on a lesson
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                  }}
                                  className={cn(
                                    "w-full text-left p-2 rounded-xl text-sm transition-all duration-200 flex items-center gap-3 group relative overflow-hidden",
                                    isCurrentLesson
                                      ? "bg-indigo-50 text-indigo-700 font-bold shadow-sm ring-1 ring-indigo-100"
                                      : isCompleted
                                        ? "text-slate-600 hover:bg-slate-50"
                                        : "text-slate-500 hover:bg-slate-50"
                                  )}
                                >
                                  {isCompleted ? (
                                    <div className="bg-green-100 p-1 rounded-full text-green-600">
                                      <CheckCircle className="w-3 h-3" />
                                    </div>
                                  ) : (
                                    <div className={cn(
                                      "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                                      isCurrentLesson ? "border-indigo-500 bg-white" : "border-slate-200"
                                    )}>
                                      {isCurrentLesson && <div className="w-2 h-2 bg-indigo-500 rounded-full" />}
                                    </div>
                                  )}
                                  <span className="flex-1 truncate">{lesson.title}</span>
                                  {isCurrentLesson && <ChevronRight className="w-4 h-4 text-indigo-400" />}
                                </button>

                                {isCurrent && lesson.quizzes.length > 0 && (
                                  <div className="ml-8 mt-1">
                                    <button
                                      onClick={() => setViewMode("quiz")}
                                      className={cn(
                                        "w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2",
                                        isCurrentQuiz
                                          ? "bg-purple-100 text-purple-700"
                                          : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                                      )}
                                    >
                                      <HelpCircle className="w-3 h-3" />
                                      <span>Quiz Express</span>
                                      <Badge variant="secondary" className="ml-auto bg-white/50 text-xs px-1.5 py-0 h-4">
                                        {lesson.quizzes.length}
                                      </Badge>
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {course.finalEvaluation && (
                    <div className="pt-4 mt-4 border-t border-slate-100">
                      <Button
                        variant={viewMode === "evaluation" ? "default" : "outline"}
                        className={cn(
                          "w-full justify-start rounded-xl h-12 font-bold",
                          viewMode === "evaluation"
                            ? "bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200"
                            : "border-2 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 text-slate-600"
                        )}
                        onClick={() => setViewMode("evaluation")}
                      >
                        <Trophy className="w-5 h-5 mr-3 text-yellow-500" />
                        Evaluación Final
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className={cn("space-y-6", isDistractionFree ? "lg:col-span-12" : "lg:col-span-9")}>
            {viewMode === "lesson" && (
              <LessonTestViewer
                lesson={currentLesson}
                onComplete={handleCompleteLesson}
                isCompleted={completedLessons.has(currentLesson.id)}
              />
            )}

            {viewMode === "quiz" && currentLesson.quizzes.length > 0 && (
              <QuizTestViewer
                quizzes={currentLesson.quizzes}
                answers={quizAnswers}
                submitted={quizSubmitted}
                scores={quizScores}
                passed={quizPassed[currentLesson.id] || false}
                passingScore={PASSING_SCORE}
                onAnswerChange={(quizId, answerIndex) => {
                  setQuizAnswers((prev) => {
                    const currentAnswers = prev[quizId] || [];
                    if (currentAnswers.includes(answerIndex)) {
                      return { ...prev, [quizId]: currentAnswers.filter(i => i !== answerIndex) };
                    } else {
                      return { ...prev, [quizId]: [...currentAnswers, answerIndex] };
                    }
                  });
                }}
                onSubmit={(quizId, score, passed) => {
                  setQuizSubmitted((prev) => ({ ...prev, [quizId]: true }));
                  setQuizScores((prev) => ({ ...prev, [quizId]: score }));
                  if (passed) {
                    setQuizPassed((prev) => ({ ...prev, [currentLesson.id]: true }));
                  }
                }}
                onRetry={() => {
                  const quizIds = currentLesson.quizzes.map(q => q.id);
                  setQuizAnswers((prev) => {
                    const newAnswers = { ...prev };
                    quizIds.forEach(id => delete newAnswers[id]);
                    return newAnswers;
                  });
                  setQuizSubmitted((prev) => {
                    const newSubmitted = { ...prev };
                    quizIds.forEach(id => delete newSubmitted[id]);
                    return newSubmitted;
                  });
                  setQuizScores((prev) => {
                    const newScores = { ...prev };
                    quizIds.forEach(id => delete newScores[id]);
                    return newScores;
                  });
                  setQuizPassed((prev) => {
                    const newPassed = { ...prev };
                    delete newPassed[currentLesson.id];
                    return newPassed;
                  });
                }}
              />
            )}

            {viewMode === "evaluation" && course.finalEvaluation && (
              <EvaluationTestViewer
                evaluation={course.finalEvaluation}
                onStart={() => setViewMode("taking_evaluation")}
              />
            )}

            {viewMode === "taking_evaluation" && course.finalEvaluation && (
              <EvaluationTakingViewer
                evaluation={course.finalEvaluation}
                onSubmit={async (answers) => {
                  // Simulation mode: give a positive result
                  setEvaluationResult({
                    score: 100,
                    passed: true,
                    feedback: "¡Excelente simulación! En el entorno real, tu respuesta sería evaluada por nuestra IA."
                  });
                  setViewMode("evaluation_result");
                }}
              />
            )}

            {viewMode === "evaluation_result" && evaluationResult && course.finalEvaluation && (
              <EvaluationResultViewer
                result={evaluationResult}
                passingScore={course.finalEvaluation.passingScore}
                onRetry={() => setViewMode("taking_evaluation")}
                onContinue={() => window.location.reload()}
              />
            )}

            {/* Navigation Bar */}
            {!isDistractionFree && (
              <div className="flex items-center justify-center gap-8 mt-12 pb-12">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={handlePrev}
                  disabled={
                    (viewMode === "lesson" && currentLessonIndex === 0) ||
                    (viewMode === "evaluation" && allLessons.length === 0)
                  }
                  className="text-slate-500 hover:text-slate-800 hover:bg-transparent px-0 font-medium"
                >
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  {viewMode === "quiz" ? "Volver a la Lección" : "Anterior"}
                </Button>

                {viewMode === "quiz" && !canProceedToNext && (
                  <div className="hidden md:block bg-orange-50 text-orange-600 px-4 py-2 rounded-lg text-sm font-bold border border-orange-100">
                    🎯 Objetivo: {PASSING_SCORE}% para avanzar
                  </div>
                )}

                <Button
                  size="lg"
                  onClick={handleNext}
                  disabled={
                    (viewMode === "quiz" && !canProceedToNext) ||
                    (viewMode === "evaluation")
                  }
                  className={cn(
                    "rounded-full font-bold px-10 shadow-lg shadow-indigo-200/50 transition-all hover:scale-105",
                    viewMode === "quiz" && !canProceedToNext
                      ? "bg-slate-200 text-slate-400 shadow-none cursor-not-allowed"
                      : "bg-cursia-blue hover:bg-cursia-blue/90 text-white"
                  )}
                >
                  {viewMode === "lesson" && hasQuizzes ? (
                    "Comenzar Quiz"
                  ) : viewMode === "lesson" && !hasQuizzes ? (
                    canGoNext ? (
                      "Siguiente Lección"
                    ) : course.finalEvaluation ? (
                      "Ir a Evaluación Final"
                    ) : (
                      "Finalizar Curso"
                    )
                  ) : viewMode === "quiz" && canProceedToNext ? (
                    canGoNext ? (
                      "Siguiente Lección"
                    ) : course.finalEvaluation ? (
                      "Ir a Evaluación Final"
                    ) : (
                      "Finalizar Curso"
                    )
                  ) : viewMode === "quiz" && !canProceedToNext ? (
                    "Completa el Quiz"
                  ) : (
                    "¡Felicidades!"
                  )}
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      {currentLesson && (
        <LessonAssistant
          lessonTitle={currentLesson.title}
          lessonContent={currentLesson.content}
          position="left"
          className="md:w-[24vw] w-[90vw]"
        />
      )}
    </div>
  );
}

function LessonTestViewer({
  lesson,
  onComplete,
  isCompleted,
}: {
  lesson: CourseTestPlayerProps["allLessons"][0];
  onComplete: () => void;
  isCompleted: boolean;
}) {
  const getVideoEmbedUrl = (url: string | null) => {
    if (!url) return null;
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    return url;
  };

  const videoEmbedUrl = getVideoEmbedUrl(lesson.videoUrl);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-2">
        <div>
          <Badge variant="outline" className="mb-2 border-indigo-200 text-indigo-600 bg-indigo-50">
            {lesson.moduleTitle}
          </Badge>
          <h2 className="text-3xl font-extrabold text-slate-800">{lesson.title}</h2>
        </div>
        {isCompleted && (
          <div className="bg-green-100 text-green-700 px-4 py-2 rounded-xl font-bold flex items-center shadow-sm">
            <CheckCircle className="w-5 h-5 mr-2" />
            Completada
          </div>
        )}
      </div>

      {videoEmbedUrl && (
        <Card className="overflow-hidden border-none shadow-lg shadow-indigo-100 rounded-2xl bg-white">
          <div className="aspect-video bg-slate-900 relative group">
            <iframe
              src={videoEmbedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </Card>
      )}

      {lesson.audioUrl && (
        <Card className="border-none shadow-md shadow-indigo-50 rounded-2xl bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-pink-600">
              <Music className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-500 mb-1">Audio de la lección</p>
              <audio src={lesson.audioUrl} controls className="w-full h-8" />
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-none shadow-md shadow-slate-100 rounded-2xl bg-white">
        <CardContent className="p-8">
          <div className="prose prose-slate prose-lg max-w-none">
            <StructuredContentRenderer content={lesson.content} images={lesson.images} />
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

function QuizTestViewer({
  quizzes,
  answers,
  submitted,
  scores,
  passed,
  passingScore,
  onAnswerChange,
  onSubmit,
  onRetry,
}: {
  quizzes: Array<{
    id: string;
    question: string;
    options: any;
    explanation: string | null;
  }>;
  answers: Record<string, number[]>;
  submitted: Record<string, boolean>;
  scores: Record<string, number>;
  passed: boolean;
  passingScore: number;
  onAnswerChange: (quizId: string, answerIndex: number) => void;
  onSubmit: (quizId: string, score: number, passed: boolean) => void;
  onRetry: () => void;
}) {
  const allSubmitted = quizzes.every((quiz) => submitted[quiz.id]);
  const allAnswered = quizzes.every((quiz) => answers[quiz.id] && answers[quiz.id].length > 0);

  const handleSubmitAll = () => {
    if (!allAnswered) return;

    let totalScore = 0;

    quizzes.forEach((quiz) => {
      const selectedIndices = answers[quiz.id] || [];
      const options = Array.isArray(quiz.options) ? quiz.options : [];

      const correctIndices = options
        .map((opt: any, idx: number) => opt.isCorrect ? idx : -1)
        .filter((idx) => idx !== -1);

      const totalCorrect = correctIndices.length;

      let correctMatches = 0;
      let incorrectMatches = 0;
      selectedIndices.forEach(idx => {
        if (options[idx]?.isCorrect) {
          correctMatches++;
        } else {
          incorrectMatches++;
        }
      });

      let questionScore = 0;
      const union = totalCorrect + incorrectMatches;

      if (union > 0) {
        questionScore = (correctMatches / union) * 100;
      } else {
        questionScore = 0;
      }

      totalScore += questionScore;

      const isPassed = questionScore >= passingScore;
      onSubmit(quiz.id, Math.round(questionScore), isPassed);
    });
  };

  if (allSubmitted) {
    const currentQuizScores = quizzes.map(q => scores[q.id] || 0);
    const totalScore = currentQuizScores.reduce((a, b) => a + b, 0);
    const averageScore = Math.round(totalScore / quizzes.length);
    const isTotalPassed = averageScore >= passingScore;

    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in zoom-in-95 duration-300">
        <Card className={cn(
          "border-none shadow-xl rounded-3xl overflow-hidden text-center",
          passed ? "bg-gradient-to-b from-green-50 to-white" : "bg-gradient-to-b from-red-50 to-white"
        )}>
          <CardContent className="pt-12 pb-12 px-8">
            <div className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg",
              passed ? "bg-green-500 text-white" : "bg-red-500 text-white"
            )}>
              {passed ? <Trophy className="w-12 h-12" /> : <Flame className="w-12 h-12" />}
            </div>

            <h2 className="text-3xl font-black text-slate-800 mb-2">
              {passed ? "¡Excelente Trabajo!" : "Sigue Intentando"}
            </h2>

            <div className="text-6xl font-black mb-6 tracking-tighter" style={{ color: isTotalPassed ? '#22c55e' : '#ef4444' }}>
              {averageScore}%
            </div>

            <p className="text-slate-600 font-medium text-lg mb-8 max-w-md mx-auto">
              {passed
                ? "Has demostrado un gran dominio del tema. ¡Estás listo para continuar!"
                : `Necesitas un ${passingScore}% para aprobar. Repasa el material y vuelve a intentarlo.`}
            </p>

            <div className="flex justify-center gap-4">
              {!passed && (
                <Button
                  onClick={onRetry}
                  size="lg"
                  className="rounded-xl font-bold bg-slate-800 hover:bg-slate-900 px-8"
                >
                  Intentar de Nuevo
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Review Answers */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-700 ml-2">Revisión de Respuestas</h3>
          {quizzes.map((quiz, index) => {
            const selectedIndices = answers[quiz.id] || [];
            const options = Array.isArray(quiz.options) ? quiz.options : [];
            const quizScore = scores[quiz.id] || 0;
            const isPassed = quizScore >= passingScore;

            return (
              <Card key={quiz.id} className={cn(
                "border-l-4 shadow-sm rounded-xl overflow-hidden",
                isPassed ? "border-l-green-500" : "border-l-red-500"
              )}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white",
                      isPassed ? "bg-green-500" : "bg-red-500"
                    )}>
                      {index + 1}
                    </div>
                    <div className="space-y-3 flex-1">
                      <p className="font-bold text-slate-800 text-lg">{quiz.question}</p>

                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <p className="text-sm text-slate-500 mb-1 font-bold uppercase">Tus respuestas:</p>
                        <ul className="list-disc list-inside">
                          {selectedIndices.map(idx => (
                            <li key={idx} className={cn("font-medium", options[idx]?.isCorrect ? "text-green-700" : "text-red-700")}>
                              {options[idx]?.text}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {quiz.explanation && (
                        <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 flex gap-3">
                          <HelpCircle className="w-5 h-5 flex-shrink-0" />
                          <p>{quiz.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="text-center space-y-2">
        <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-4 py-1 text-sm rounded-full">
          Quiz Express
        </Badge>
        <h2 className="text-3xl font-extrabold text-slate-800">Demuestra lo que sabes</h2>
        <p className="text-slate-500 text-lg">Responde correctamente para avanzar</p>
      </div>

      <div className="space-y-6">
        {quizzes.map((quiz, index) => (
          <Card key={quiz.id} className="border-none shadow-lg shadow-slate-100 rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-6">
              <div className="flex gap-4">
                <div className="bg-white w-10 h-10 rounded-xl flex items-center justify-center font-black text-indigo-600 shadow-sm border border-slate-100">
                  {index + 1}
                </div>
                <CardTitle className="text-xl leading-relaxed text-slate-800">
                  {quiz.question}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-8">
              <div className="space-y-3">
                {Array.isArray(quiz.options) &&
                  quiz.options.map((option: any, optIndex: number) => (
                    <div key={optIndex} className="relative">
                      <div
                        onClick={() => onAnswerChange(quiz.id, optIndex)}
                        className={cn(
                          "flex items-center p-4 rounded-xl border-2 border-slate-100 bg-white hover:bg-slate-50 hover:border-indigo-200 cursor-pointer transition-all",
                          (answers[quiz.id] || []).includes(optIndex)
                            ? "border-indigo-500 bg-indigo-50 text-indigo-900 [&>div]:border-indigo-500 [&>div]:bg-indigo-500 [&>div>div]:opacity-100"
                            : ""
                        )}
                      >
                        <div className="w-6 h-6 rounded-full border-2 border-slate-300 mr-4 flex items-center justify-center transition-colors">
                          <div className="w-2.5 h-2.5 bg-white rounded-full opacity-0 transition-opacity" />
                        </div>
                        <span className="font-medium text-base">{option.text}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <Button
          onClick={handleSubmitAll}
          disabled={!allAnswered}
          size="lg"
          className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-8 h-14 text-lg shadow-lg shadow-indigo-200 transition-transform hover:scale-105 active:scale-95"
        >
          Enviar Respuestas
        </Button>
      </div>
    </div>
  );
}

function EvaluationTestViewer({ evaluation, onStart }: { evaluation: any; onStart: () => void }) {
  return (
    <Card className="border-none shadow-xl rounded-3xl bg-white overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-12 text-center text-white">
        <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
          <Trophy className="w-12 h-12 text-yellow-300" />
        </div>
        <h2 className="text-4xl font-black mb-4">Evaluación Final</h2>
        <p className="text-indigo-100 text-lg max-w-xl mx-auto">
          Has llegado al final del curso. Esta evaluación pondrá a prueba todo lo que has aprendido.
        </p>
      </div>
      <CardContent className="p-12 text-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-slate-50 p-6 rounded-2xl">
            <p className="text-slate-500 text-sm font-bold uppercase mb-1">Preguntas</p>
            <p className="text-3xl font-black text-slate-800">{evaluation.questions.length}</p>
          </div>
          <div className="bg-slate-50 p-6 rounded-2xl">
            <p className="text-slate-500 text-sm font-bold uppercase mb-1">Tiempo Est.</p>
            <p className="text-3xl font-black text-slate-800">30 min</p>
          </div>
          <div className="bg-slate-50 p-6 rounded-2xl">
            <p className="text-slate-500 text-sm font-bold uppercase mb-1">Para Aprobar</p>
            <p className="text-3xl font-black text-indigo-600">{evaluation.passingScore}%</p>
          </div>
        </div>

        <Button
          size="lg"
          className="w-full md:w-auto px-12 h-16 text-xl rounded-2xl font-bold bg-slate-900 hover:bg-slate-800 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
          onClick={onStart}
        >
          Comenzar Evaluación
        </Button>
      </CardContent>
    </Card>
  );
}

function FlashcardTestViewer({
  flashcards,
}: {
  flashcards: Array<{
    id: string;
    front: string;
    back: string;
  }>;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentCard = flashcards[currentIndex];

  if (!currentCard) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="text-center space-y-2">
        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-1 text-sm rounded-full">
          Flashcards
        </Badge>
        <h2 className="text-3xl font-extrabold text-slate-800">Repaso Rápido</h2>
        <p className="text-slate-500 text-lg">Memoriza los conceptos clave</p>
      </div>

      <Card className="border-none shadow-xl shadow-slate-200 rounded-3xl overflow-hidden bg-white">
        <CardContent className="p-12 min-h-[400px] flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-slate-50" onClick={() => setIsFlipped(!isFlipped)}>
          <div className="text-center space-y-6">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              {isFlipped ? "Reverso" : "Frente"}
            </p>
            <p className="text-2xl md:text-3xl font-medium text-slate-800 leading-relaxed">
              {isFlipped ? currentCard.back : currentCard.front}
            </p>
            <p className="text-xs text-slate-400 mt-8">
              Clic para voltear
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between px-4">
        <Button
          variant="outline"
          onClick={() => {
            setCurrentIndex(Math.max(0, currentIndex - 1));
            setIsFlipped(false);
          }}
          disabled={currentIndex === 0}
          className="rounded-xl font-bold border-2 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 text-slate-600"
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Anterior
        </Button>

        <span className="font-bold text-slate-400">
          {currentIndex + 1} / {flashcards.length}
        </span>

        <Button
          variant="outline"
          onClick={() => {
            setCurrentIndex(Math.min(flashcards.length - 1, currentIndex + 1));
            setIsFlipped(false);
          }}
          disabled={currentIndex === flashcards.length - 1}
          className="rounded-xl font-bold border-2 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 text-slate-600"
        >
          Siguiente
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}

function EvaluationTakingViewer({
  evaluation,
  onSubmit
}: {
  evaluation: any;
  onSubmit: (answers: Record<string, string>) => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit(answers);
    } finally {
      setSubmitting(false);
    }
  };

  const allAnswered = evaluation.questions.every((q: any, index: number) =>
    answers[index.toString()] && answers[index.toString()].trim().length > 0
  );

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="text-center space-y-2">
        <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-4 py-1 text-sm rounded-full">
          Evaluación Final
        </Badge>
        <h2 className="text-3xl font-extrabold text-slate-800">Demuestra tu conocimiento</h2>
        <p className="text-slate-500 text-lg">Responde las siguientes preguntas abiertas.</p>
      </div>

      <div className="space-y-6">
        {evaluation.questions.map((question: any, index: number) => (
          <Card key={index} className="border-none shadow-lg shadow-slate-100 rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-6">
              <div className="flex gap-4">
                <div className="bg-white w-10 h-10 rounded-xl flex items-center justify-center font-black text-indigo-600 shadow-sm border border-slate-100">
                  {index + 1}
                </div>
                <CardTitle className="text-xl leading-relaxed text-slate-800">
                  {question.question}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-8">
              <textarea
                className="flex min-h-[120px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base ring-offset-background placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                placeholder="Escribe tu respuesta aquí..."
                value={answers[index.toString()] || ""}
                onChange={(e) => setAnswers(prev => ({ ...prev, [index.toString()]: e.target.value }))}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end pt-4 pb-12">
        <Button
          onClick={handleSubmit}
          disabled={!allAnswered || submitting}
          size="lg"
          className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-8 h-14 text-lg shadow-lg shadow-indigo-200 transition-transform hover:scale-105 active:scale-95"
        >
          {submitting ? "Enviando..." : "Enviar Evaluación"}
        </Button>
      </div>
    </div>
  );
}

function EvaluationResultViewer({
  result,
  passingScore,
  onRetry,
  onContinue,
}: {
  result: { score: number; passed: boolean; feedback?: string };
  passingScore: number;
  onRetry: () => void;
  onContinue: () => void;
}) {
  return (
    <Card className="border-none shadow-xl rounded-3xl bg-white overflow-hidden max-w-2xl mx-auto animate-in zoom-in-95 duration-300">
      <div className={cn(
        "p-12 text-center text-white",
        result.passed ? "bg-gradient-to-r from-green-500 to-emerald-600" : "bg-gradient-to-r from-red-500 to-orange-600"
      )}>
        <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm shadow-lg">
          {result.passed ? <Trophy className="w-12 h-12 text-white" /> : <Flame className="w-12 h-12 text-white" />}
        </div>
        <h2 className="text-4xl font-black mb-2">
          {result.passed ? "¡Felicidades!" : "Sigue intentando"}
        </h2>
        <p className="text-white/90 text-lg">
          {result.passed ? "Has aprobado la evaluación final." : "No has alcanzado el puntaje mínimo."}
        </p>
      </div>

      <CardContent className="p-12 text-center space-y-8">
        <div className="flex justify-center gap-12">
          <div>
            <p className="text-slate-400 text-sm font-bold uppercase mb-1">Tu Calificación</p>
            <p className={cn("text-5xl font-black", result.passed ? "text-green-600" : "text-red-600")}>
              {result.score}%
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-sm font-bold uppercase mb-1">Mínimo Requerido</p>
            <p className="text-5xl font-black text-slate-300">
              {passingScore}%
            </p>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          {!result.passed && (
            <Button
              size="lg"
              variant="outline"
              onClick={onRetry}
              className="rounded-xl font-bold border-2 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 text-slate-600 px-8"
            >
              Intentar de Nuevo
            </Button>
          )}

          <Button
            size="lg"
            onClick={onContinue}
            className="rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white px-8 shadow-lg shadow-slate-200"
          >
            {result.passed ? "Finalizar Curso" : "Salir"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
