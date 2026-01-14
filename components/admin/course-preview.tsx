"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, FileText, Video, Music, HelpCircle, Layers, CheckCircle, Eye } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Markdown } from "tiptap-markdown";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";

interface CoursePreviewProps {
  course: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    modules: Array<{
      id: string;
      title: string;
      description: string | null;
      order: number;
      lessons: Array<{
        id: string;
        title: string;
        content: string;
        order: number;
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
}

export function CoursePreview({ course }: CoursePreviewProps) {
  const [selectedModule, setSelectedModule] = useState<string | null>(
    course.modules[0]?.id || null
  );
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"lesson" | "quiz" | "flashcard" | "evaluation">("lesson");

  const selectedModuleData = course.modules.find((m) => m.id === selectedModule);
  const selectedLessonData = selectedModuleData?.lessons.find(
    (l) => l.id === selectedLesson
  );

  const totalLessons = course.modules.reduce(
    (acc, module) => acc + module.lessons.length,
    0
  );

  const totalQuizzes = course.modules.reduce(
    (acc, module) =>
      acc + module.lessons.reduce((sum, lesson) => sum + lesson.quizzes.length, 0),
    0
  );

  const totalFlashcards = course.modules.reduce(
    (acc, module) =>
      acc + module.lessons.reduce((sum, lesson) => sum + lesson.flashcards.length, 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{course.title}</CardTitle>
              <p className="text-muted-foreground mt-2">
                {course.description || "Sin descripción"}
              </p>
            </div>
            <Badge className="bg-blue-500">
              {course.status === "DRAFT" && "Borrador"}
              {course.status === "IN_REVIEW" && "En Revisión"}
              {course.status === "APPROVED" && "Aprobado"}
              {course.status === "PUBLISHED" && "Publicado"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Módulos</p>
              <p className="text-2xl font-bold">{course.modules.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Lecciones</p>
              <p className="text-2xl font-bold">{totalLessons}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Preguntas</p>
              <p className="text-2xl font-bold">{totalQuizzes}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Flashcards</p>
              <p className="text-2xl font-bold">{totalFlashcards}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Structure */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Modules */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Estructura del Curso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {course.modules.map((module) => (
                <div key={module.id} className="space-y-1">
                  <button
                    onClick={() => {
                      setSelectedModule(module.id);
                      setSelectedLesson(module.lessons[0]?.id || null);
                    }}
                    className={`w-full text-left p-3 rounded-md transition-colors ${selectedModule === module.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      <span className="font-medium">{module.title}</span>
                    </div>
                    <p className="text-xs mt-1 opacity-80">
                      {module.lessons.length} lección{module.lessons.length !== 1 ? "es" : ""}
                    </p>
                  </button>
                  {selectedModule === module.id && (
                    <div className="ml-6 space-y-1">
                      {module.lessons.map((lesson) => (
                        <button
                          key={lesson.id}
                          onClick={() => {
                            setSelectedLesson(lesson.id);
                            setViewMode("lesson");
                          }}
                          className={`w-full text-left p-2 rounded-md text-sm transition-colors flex items-center justify-between ${selectedLesson === lesson.id
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-accent"
                            }`}
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="w-3 h-3" />
                            <span>{lesson.title}</span>
                          </div>
                          <div className="flex gap-1 text-xs">
                            {lesson.videoUrl && <Video className="w-3 h-3" />}
                            {lesson.quizzes.length > 0 && (
                              <span>{lesson.quizzes.length}</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {course.finalEvaluation && (
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => setViewMode("evaluation")}
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Evaluación Final
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {selectedLesson && selectedLessonData && viewMode === "lesson" && (
            <LessonPreview lesson={selectedLessonData} onViewQuizzes={() => setViewMode("quiz")} onViewFlashcards={() => setViewMode("flashcard")} />
          )}

          {selectedLesson && selectedLessonData && viewMode === "quiz" && (
            <QuizPreview quizzes={selectedLessonData.quizzes} />
          )}

          {selectedLesson && selectedLessonData && viewMode === "flashcard" && (
            <FlashcardPreview flashcards={selectedLessonData.flashcards} />
          )}

          {viewMode === "evaluation" && course.finalEvaluation && (
            <EvaluationPreview evaluation={course.finalEvaluation} />
          )}

          {!selectedLesson && viewMode === "lesson" && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Selecciona una lección para previsualizar
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function LessonPreview({
  lesson,
  onViewQuizzes,
  onViewFlashcards,
}: {
  lesson: {
    id: string;
    title: string;
    content: string;
    videoUrl: string | null;
    audioUrl: string | null;
    images?: any;
    quizzes: Array<any>;
    flashcards: Array<any>;
  };
  onViewQuizzes: () => void;
  onViewFlashcards: () => void;
}) {

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link,
      Markdown.configure({
        html: true,
        transformPastedText: true,
        transformCopiedText: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: lesson.content,
    editable: false,
    editorProps: {
      attributes: {
        class: "prose max-w-none dark:prose-invert focus:outline-none",
      },
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{lesson.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {lesson.videoUrl && (
          <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
            <video
              src={lesson.videoUrl}
              controls
              className="w-full h-full rounded-lg"
            />
          </div>
        )}

        {lesson.audioUrl && (
          <div className="p-4 border rounded-lg flex items-center gap-4">
            <Music className="w-6 h-6" />
            <audio src={lesson.audioUrl} controls className="flex-1" />
          </div>
        )}

        <div className="prose max-w-none">
          <EditorContent editor={editor} />
        </div>

        <div className="flex gap-2 pt-4 border-t">
          {lesson.quizzes.length > 0 && (
            <Button variant="outline" onClick={onViewQuizzes}>
              <HelpCircle className="w-4 h-4 mr-2" />
              Ver Preguntas ({lesson.quizzes.length})
            </Button>
          )}
          {lesson.flashcards.length > 0 && (
            <Button variant="outline" onClick={onViewFlashcards}>
              <Layers className="w-4 h-4 mr-2" />
              Ver Flashcards ({lesson.flashcards.length})
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function QuizPreview({
  quizzes,
}: {
  quizzes: Array<{
    id: string;
    question: string;
    options: any;
    explanation: string | null;
  }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preguntas del Quiz</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {quizzes.map((quiz, index) => (
          <div key={quiz.id} className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-semibold">
              Pregunta {index + 1}: {quiz.question}
            </h3>
            <div className="space-y-2">
              {Array.isArray(quiz.options) &&
                quiz.options.map((option: any, optIndex: number) => (
                  <div
                    key={optIndex}
                    className={`p-2 rounded ${option.isCorrect ? "bg-green-50 border border-green-200" : "bg-gray-50"
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      {option.isCorrect && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      <span>{option.text}</span>
                      {option.isCorrect && (
                        <Badge className="bg-green-500 ml-auto">Correcta</Badge>
                      )}
                    </div>
                  </div>
                ))}
            </div>
            {quiz.explanation && (
              <p className="text-sm text-muted-foreground italic">
                💡 {quiz.explanation}
              </p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function FlashcardPreview({
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

  if (!currentCard) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No hay flashcards disponibles</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Flashcards</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="text-center text-sm text-muted-foreground">
            {currentIndex + 1} de {flashcards.length}
          </div>

          <div
            className="min-h-[300px] flex items-center justify-center p-8 border rounded-lg cursor-pointer transition-all hover:shadow-lg"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className="text-center">
              <p className="text-xl font-medium">
                {isFlipped ? currentCard.back : currentCard.front}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setCurrentIndex(Math.max(0, currentIndex - 1));
                setIsFlipped(false);
              }}
              disabled={currentIndex === 0}
            >
              Anterior
            </Button>

            <Button variant="outline" onClick={() => setIsFlipped(!isFlipped)}>
              {isFlipped ? "Ver Frente" : "Ver Reverso"}
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setCurrentIndex(Math.min(flashcards.length - 1, currentIndex + 1));
                setIsFlipped(false);
              }}
              disabled={currentIndex === flashcards.length - 1}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EvaluationPreview({
  evaluation,
}: {
  evaluation: {
    id: string;
    questions: any;
    passingScore: number;
  };
}) {
  const questions = Array.isArray(evaluation.questions)
    ? evaluation.questions
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evaluación Final</CardTitle>
        <p className="text-sm text-muted-foreground">
          Puntaje mínimo para aprobar: {evaluation.passingScore}%
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {questions.map((question: any, index: number) => (
          <div key={index} className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-semibold">
              Pregunta {index + 1}: {question.question}
            </h3>
            <div className="space-y-2">
              {Array.isArray(question.options) &&
                question.options.map((option: any, optIndex: number) => (
                  <div
                    key={optIndex}
                    className={`p-2 rounded ${option.isCorrect
                      ? "bg-green-50 border border-green-200"
                      : "bg-gray-50"
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      {option.isCorrect && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      <span>{option.text}</span>
                      {option.isCorrect && (
                        <Badge className="bg-green-500 ml-auto">Correcta</Badge>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
        {questions.length === 0 && (
          <p className="text-muted-foreground text-center py-8">
            No hay preguntas en la evaluación final
          </p>
        )}
      </CardContent>
    </Card>
  );
}



