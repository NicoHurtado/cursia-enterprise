"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, BookOpen, FileText, Video, HelpCircle, Layers, Pencil, Check, X, Play, Trash2 } from "lucide-react";
import { ModuleManager } from "./module-manager";
import { LessonEditor } from "./lesson-editor";
import { FinalEvaluationBuilder } from "./final-evaluation-builder";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface CourseEditorProps {
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
        images?: any;
      }>;
    }>;
    finalEvaluation?: {
      id: string;
      questions: any;
      passingScore: number;
    } | null;
  };
}

export function CourseEditor({ course }: CourseEditorProps) {
  const router = useRouter();
  const [selectedModule, setSelectedModule] = useState<string | null>(
    course.modules[0]?.id || null
  );
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"structure" | "evaluation">("structure");
  const [editingLessonTitle, setEditingLessonTitle] = useState<string | null>(null);
  const [editLessonTitle, setEditLessonTitle] = useState("");

  const selectedModuleData = course.modules.find((m) => m.id === selectedModule);
  const selectedLessonData = selectedModuleData?.lessons.find(
    (l) => l.id === selectedLesson
  );

  const handleRefresh = useCallback(() => {
    // Force a router refresh to reload server component data
    router.refresh();
  }, [router]);

  const handleCreateLesson = async () => {
    if (!selectedModule) return;

    try {
      const response = await fetch(`/api/modules/${selectedModule}/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Nueva Lección",
          content: "",
          order: selectedModuleData?.lessons.length || 0,
        }),
      });

      if (response.ok) {
        const newLesson = await response.json();
        setSelectedLesson(newLesson.id);
        handleRefresh();
      }
    } catch (error) {
      console.error("Error creating lesson:", error);
    }
  };

  const handleStartEditLesson = (lesson: { id: string; title: string }) => {
    setEditingLessonTitle(lesson.id);
    setEditLessonTitle(lesson.title);
  };

  const handleSaveLessonTitle = async (lessonId: string) => {
    if (!editLessonTitle.trim()) {
      setEditingLessonTitle(null);
      return;
    }

    try {
      const response = await fetch(`/api/lessons/${lessonId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editLessonTitle }),
      });

      if (response.ok) {
        setEditingLessonTitle(null);
        handleRefresh();
      }
    } catch (error) {
      console.error("Error updating lesson title:", error);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta lección? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      const response = await fetch(`/api/lessons/${lessonId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        if (selectedLesson === lessonId) {
          setSelectedLesson(null);
        }
        handleRefresh();
      } else {
        alert("Error al eliminar la lección");
      }
    } catch (error) {
      console.error("Error deleting lesson:", error);
      alert("Error al eliminar la lección");
    }
  };

  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [editCourseData, setEditCourseData] = useState({
    title: course.title,
    description: course.description || "",
  });

  const handleSaveCourse = async () => {
    try {
      const response = await fetch(`/api/admin/courses/${course.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editCourseData),
      });

      if (response.ok) {
        setIsEditingCourse(false);
        handleRefresh();
      }
    } catch (error) {
      console.error("Error updating course:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="flex-1 mr-4">
          {isEditingCourse ? (
            <div className="space-y-2">
              <Input
                value={editCourseData.title}
                onChange={(e) => setEditCourseData(prev => ({ ...prev, title: e.target.value }))}
                className="text-3xl font-bold"
                placeholder="Título del curso"
              />
              <Input
                value={editCourseData.description}
                onChange={(e) => setEditCourseData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción del curso"
              />
              <div className="flex gap-2 mt-2">
                <Button onClick={handleSaveCourse} size="sm">
                  <Check className="w-4 h-4 mr-2" /> Guardar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setIsEditingCourse(false)}>
                  <X className="w-4 h-4 mr-2" /> Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="group relative">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">{course.title}</h1>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setIsEditingCourse(true)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-muted-foreground mt-1">
                {course.description || "Sin descripción"}
              </p>
              <div className="mt-2">
                <span className={`px-2 py-1 rounded text-xs font-bold ${course.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                  {course.status === 'PUBLISHED' ? 'PUBLICADO' : 'BORRADOR'}
                </span>
              </div>
            </div>
          )}
        </div>
        {course.status !== 'PUBLISHED' && (
          <Button onClick={async () => {
            try {
              const res = await fetch(`/api/admin/courses/${course.id}/publish`, { method: 'POST' });
              if (res.ok) router.refresh();
            } catch (e) { console.error(e); }
          }}>
            Publicar Curso
          </Button>
        )}
      </div>

      <div className="flex gap-2 border-b">
        <Button
          variant={activeTab === "structure" ? "default" : "ghost"}
          onClick={() => setActiveTab("structure")}
        >
          <Layers className="w-4 h-4 mr-2" />
          Estructura del Curso
        </Button>
        <Button
          variant={activeTab === "evaluation" ? "default" : "ghost"}
          onClick={() => setActiveTab("evaluation")}
        >
          <HelpCircle className="w-4 h-4 mr-2" />
          Evaluación Final
        </Button>
      </div>

      {activeTab === "structure" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <ModuleManager
              courseId={course.id}
              modules={course.modules}
              selectedModule={selectedModule}
              onSelectModule={(id) => {
                setSelectedModule(id);
                setSelectedLesson(null);
              }}
              onModuleUpdate={handleRefresh}
            />
          </div>

          <div className="lg:col-span-2 space-y-4">
            {selectedModule && selectedModuleData && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      {selectedModuleData.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedModuleData.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className={`p-4 border rounded-lg transition-colors ${selectedLesson === lesson.id
                            ? "border-primary bg-primary/5"
                            : "hover:bg-accent cursor-pointer"
                            }`}
                          onClick={() => {
                            if (editingLessonTitle !== lesson.id) {
                              setSelectedLesson(lesson.id);
                            }
                          }}
                        >
                          {editingLessonTitle === lesson.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={editLessonTitle}
                                onChange={(e) => setEditLessonTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleSaveLessonTitle(lesson.id);
                                  } else if (e.key === "Escape") {
                                    setEditingLessonTitle(null);
                                  }
                                }}
                                className="flex-1"
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSaveLessonTitle(lesson.id);
                                }}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingLessonTitle(null);
                                }}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 flex-1">
                                <FileText className="w-4 h-4" />
                                <span className="font-medium">{lesson.title}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex gap-2 text-sm text-muted-foreground">
                                  {lesson.videoUrl && <Video className="w-4 h-4" />}
                                  {lesson.quizzes.length > 0 && (
                                    <span>{lesson.quizzes.length} pregunta{lesson.quizzes.length !== 1 ? 's' : ''}</span>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStartEditLesson(lesson);
                                  }}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteLesson(lesson.id);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleCreateLesson}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar Lección
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {selectedLesson && selectedLessonData && (
                  <LessonEditor
                    lesson={selectedLessonData}
                    onUpdate={handleRefresh}
                  />
                )}
              </>
            )}

            {!selectedModule && (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    Selecciona un módulo para comenzar a editar
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {activeTab === "evaluation" && (
        <FinalEvaluationBuilder
          courseId={course.id}
          initialData={course.finalEvaluation || undefined}
          onSaved={handleRefresh}
        />
      )}

      {/* Test Course Button */}
      <div className="flex justify-end">
        <Link href={`/admin/courses/${course.id}/test`}>
          <Button variant="outline" size="lg">
            <Play className="w-4 h-4 mr-2" />
            Probar Curso como Estudiante
          </Button>
        </Link>
      </div>
    </div>
  );
}
