"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { QuizBuilder } from "./quiz-builder";
import { FlashcardBuilder } from "./flashcard-builder";
import { Save, Video, Music, Bold, Italic, List, Code, Table, Eye, Edit, Sparkles, Upload, X, Image as ImageIcon, Trash2 } from "lucide-react";
import { StructuredContentRenderer } from "@/components/course/StructuredContentRenderer";

interface LessonImage {
  url: string;
  title: string;
  description: string;
}

interface LessonEditorProps {
  lesson: {
    id: string;
    title: string;
    content: string;
    videoUrl: string | null;
    audioUrl: string | null;
    images?: LessonImage[] | string[] | any;
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
  };
  onUpdate: () => void;
}

export function LessonEditor({ lesson, onUpdate }: LessonEditorProps) {
  // Normalize images to new format
  const normalizeImages = (imgs: any): LessonImage[] => {
    // console.log("Normalizing images:", imgs); // Debug log
    if (!imgs) return [];

    if (Array.isArray(imgs) && imgs.length === 0) return [];

    if (typeof imgs === 'string') {
      try {
        const parsed = JSON.parse(imgs);
        return Array.isArray(parsed) ? parsed.map((img: any) =>
          typeof img === 'string' ? { url: img, title: '', description: '' } : img
        ) : [];
      } catch {
        // console.error("Error parsing images JSON string:", imgs);
        return [];
      }
    }

    if (Array.isArray(imgs)) {
      return imgs.map((img: any) =>
        typeof img === 'string'
          ? { url: img, title: '', description: '' }
          : { ...img, title: img.title || '', description: img.description || '' }
      );
    }

    // Handle potential object/map case if Prisma returns something weird
    if (typeof imgs === 'object') {
      return [];
    }

    return [];
  };

  const [title, setTitle] = useState(lesson.title);
  const [content, setContent] = useState(lesson.content || "");
  const [videoUrl, setVideoUrl] = useState(lesson.videoUrl || "");
  const [audioUrl, setAudioUrl] = useState(lesson.audioUrl || "");
  const [images, setImages] = useState<LessonImage[]>(normalizeImages(lesson.images));
  const [isUploading, setIsUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null);

  const titleDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const contentDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const videoUrlDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const audioUrlDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const lessonIdRef = useRef(lesson.id);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const titleRef = useRef(title);
  const contentRef = useRef(content);
  const videoUrlRef = useRef(videoUrl);
  const audioUrlRef = useRef(audioUrl);
  const imagesRef = useRef(images);

  useEffect(() => { titleRef.current = title; }, [title]);
  useEffect(() => { contentRef.current = content; }, [content]);
  useEffect(() => { videoUrlRef.current = videoUrl; }, [videoUrl]);
  useEffect(() => { audioUrlRef.current = audioUrl; }, [audioUrl]);
  useEffect(() => { imagesRef.current = images; }, [images]);

  // Sync local title if it changes externally (e.g. from sidebar)
  useEffect(() => {
    setTitle(lesson.title);
  }, [lesson.title]);

  // Reset editor when lesson changes
  useEffect(() => {
    if (lessonIdRef.current !== lesson.id) {
      lessonIdRef.current = lesson.id;
      setContent(lesson.content || "");
      setTitle(lesson.title);
      setVideoUrl(lesson.videoUrl || "");
      setAudioUrl(lesson.audioUrl || "");
      setImages(normalizeImages(lesson.images));
      setEditingImageIndex(null);
    }
  }, [lesson.id]); // Simplified dependencies since we handle prop updates separately now

  // Save on unmount or lesson change
  useEffect(() => {
    return () => {
      // Check for unsaved changes and save immediately
      // We use the refs to get values because this runs on unmount
      if (titleRef.current !== lesson.title && titleRef.current.trim()) {
        handleSaveTitle(titleRef.current);
      }
      if (contentRef.current !== (lesson.content || "")) {
        handleSaveContent(contentRef.current);
      }
      if (videoUrlRef.current !== (lesson.videoUrl || "")) {
        handleSaveVideoUrl(videoUrlRef.current);
      }
      if (audioUrlRef.current !== (lesson.audioUrl || "")) {
        handleSaveAudioUrl(audioUrlRef.current);
      }
    };
  }, [lesson.id]); // Run cleanup when ID changes (switching lessons)

  // Auto-save title with debounce
  useEffect(() => {
    if (title !== lesson.title && title.trim() && lessonIdRef.current === lesson.id) {
      if (titleDebounceRef.current) clearTimeout(titleDebounceRef.current);
      titleDebounceRef.current = setTimeout(() => handleSaveTitle(title), 2000);
    }
    return () => { if (titleDebounceRef.current) clearTimeout(titleDebounceRef.current); };
  }, [title, lesson.title, lesson.id]);

  // Auto-save content with debounce
  useEffect(() => {
    if (content !== (lesson.content || "") && lessonIdRef.current === lesson.id) {
      if (contentDebounceRef.current) clearTimeout(contentDebounceRef.current);
      contentDebounceRef.current = setTimeout(() => handleSaveContent(content), 3000);
    }
    return () => { if (contentDebounceRef.current) clearTimeout(contentDebounceRef.current); };
  }, [content, lesson.content, lesson.id]);

  // Auto-save video URL
  useEffect(() => {
    if (videoUrl !== (lesson.videoUrl || "") && lessonIdRef.current === lesson.id) {
      if (videoUrlDebounceRef.current) clearTimeout(videoUrlDebounceRef.current);
      videoUrlDebounceRef.current = setTimeout(() => handleSaveVideoUrl(videoUrl), 2000);
    }
    return () => { if (videoUrlDebounceRef.current) clearTimeout(videoUrlDebounceRef.current); };
  }, [videoUrl, lesson.videoUrl, lesson.id]);

  // Auto-save audio URL
  useEffect(() => {
    if (audioUrl !== (lesson.audioUrl || "") && lessonIdRef.current === lesson.id) {
      if (audioUrlDebounceRef.current) clearTimeout(audioUrlDebounceRef.current);
      audioUrlDebounceRef.current = setTimeout(() => handleSaveAudioUrl(audioUrl), 2000);
    }
    return () => { if (audioUrlDebounceRef.current) clearTimeout(audioUrlDebounceRef.current); };
  }, [audioUrl, lesson.audioUrl, lesson.id]);

  const handleSaveTitle = async (newTitle: string) => {
    try {
      const response = await fetch(`/api/lessons/${lesson.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      if (response.ok) {
        setLastSaved(new Date());
        onUpdate();
      }
    } catch (error) {
      console.error("Error saving title:", error);
    }
  };

  const handleSaveContent = async (newContent: string) => {
    try {
      const response = await fetch(`/api/lessons/${lesson.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newContent }),
      });
      if (response.ok) {
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error("Error saving content:", error);
    }
  };

  const handleSaveVideoUrl = async (url: string) => {
    try {
      const response = await fetch(`/api/lessons/${lesson.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl: url || null }),
      });
      if (response.ok) {
        setLastSaved(new Date());
        onUpdate();
      }
    } catch (error) {
      console.error("Error saving video URL:", error);
    }
  };

  const handleSaveAudioUrl = async (url: string) => {
    try {
      const response = await fetch(`/api/lessons/${lesson.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioUrl: url || null }),
      });
      if (response.ok) {
        setLastSaved(new Date());
        onUpdate();
      }
    } catch (error) {
      console.error("Error saving audio URL:", error);
    }
  };

  const handleSaveImages = async (newImages: LessonImage[]) => {
    try {
      const response = await fetch(`/api/lessons/${lesson.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: newImages }),
      });
      if (response.ok) {
        setLastSaved(new Date());
        onUpdate();
      }
    } catch (error) {
      console.error("Error saving images:", error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", e.target.files[0]);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      const newImages = [...images, { url: data.url, title: '', description: '' }];
      setImages(newImages);
      handleSaveImages(newImages);
      // Auto-open editing for new image
      setEditingImageIndex(newImages.length - 1);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error al subir la imagen");
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    handleSaveImages(newImages);
    if (editingImageIndex === index) {
      setEditingImageIndex(null);
    }
  };

  const updateImageData = (index: number, field: 'title' | 'description', value: string) => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], [field]: value };
    setImages(newImages);
  };

  const saveImageData = (index: number) => {
    handleSaveImages(images);
    setEditingImageIndex(null);
  };


  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/lessons/${lesson.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          videoUrl: videoUrl || null,
          audioUrl: audioUrl || null,
          images,
        }),
      });

      if (response.ok) {
        setLastSaved(new Date());
        onUpdate();
      }
    } catch (error) {
      console.error("Error saving lesson:", error);
    } finally {
      setSaving(false);
    }
  };

  const insertText = (before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);

    setContent(newText);

    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };
  const [isGenerating, setIsGenerating] = useState(false);
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("content");

  const handleGenerateContent = async () => {
    setIsGenerating(true);
    setIsDialogOpen(false); // Close dialog immediately
    try {
      const response = await fetch("/api/admin/ai/generate-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: lesson.id,
          additionalInstructions
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setContent(data.content);
        setLastSaved(new Date());
        onUpdate();
        setAdditionalInstructions(""); // Reset instructions
      } else {
        console.error("Failed to generate content");
      }
    } catch (error) {
      console.error("Error generating content:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // ... existing code

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Editar Lección</CardTitle>
          <div className="flex items-center gap-2">
            {lastSaved && (
              <span className="text-xs text-muted-foreground">
                Guardado {lastSaved.toLocaleTimeString()}
              </span>
            )}

            {activeTab === "content" && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isGenerating || saving}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {isGenerating ? "Generando..." : "Generar con AI"}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Generar Contenido con AI</DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <Label htmlFor="instructions" className="mb-2 block">Instrucciones Adicionales (Opcional)</Label>
                    <Textarea
                      id="instructions"
                      placeholder="Ej: Incluye un ejemplo de código en Python, hazlo más breve, enfócate en..."
                      value={additionalInstructions}
                      onChange={(e) => setAdditionalInstructions(e.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleGenerateContent} disabled={isGenerating}>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            <Button onClick={handleSave} disabled={saving} size="sm">
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Guardando..." : "Guardar Todo"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lesson-title">Título</Label>
            <Input
              id="lesson-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título de la lección..."
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="content">Contenido</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
              <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4">
              <div className="border rounded-lg">
                <div className="border-b p-2 flex gap-2 flex-wrap items-center bg-slate-50 dark:bg-slate-900">
                  <div className="flex gap-1 mr-4 border-r pr-4">
                    <Button
                      variant={viewMode === "edit" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("edit")}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      variant={viewMode === "preview" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("preview")}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Previsualizar
                    </Button>
                  </div>

                  {viewMode === "edit" && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => insertText("**", "**")}
                        title="Negrita"
                      >
                        <Bold className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => insertText("*", "*")}
                        title="Cursiva"
                      >
                        <Italic className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => insertText("[HIGHLIGHT] ")}
                        title="Resaltar"
                      >
                        <span className="bg-yellow-200 text-black px-1 rounded text-xs font-bold">H</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => insertText("- ")}
                        title="Lista"
                      >
                        <List className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => insertText("[CODE_BLOCK]\n", "\n")}
                        title="Bloque de Código"
                      >
                        <Code className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => insertText("[COMPARISON_TABLE]\n| Header 1 | Header 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |")}
                        title="Tabla"
                      >
                        <Table className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>

                <div className="min-h-[400px] bg-white dark:bg-black">
                  {viewMode === "edit" ? (
                    <Textarea
                      ref={textareaRef}
                      value={content}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
                      className="w-full h-[400px] p-4 font-mono text-sm resize-none border-0 focus-visible:ring-0"
                      placeholder="Escribe tu contenido aquí... Usa Markdown y etiquetas como [HIGHLIGHT]"
                    />
                  ) : (
                    <div className="p-4 prose max-w-none dark:prose-invert h-[400px] overflow-y-auto">
                      <StructuredContentRenderer content={content} images={images} />
                    </div>
                  )}
                </div>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>💡 Usa <code>[HIGHLIGHT] Texto</code> para resaltar, <code>[PYTHON_CODE]</code> para código, y Markdown estándar.</p>
                {images.length > 0 && (
                  <p>🖼️ Para insertar imágenes usa: <code>[IMAGE:0]</code>, <code>[IMAGE:1]</code>, etc. (ver pestañaMedia para índices)</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="media" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="video-url" className="flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  URL del Video (YouTube, Vimeo, etc.)
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="video-url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... o https://vimeo.com/..."
                  />
                  {videoUrl && (
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => {
                        setVideoUrl("");
                        handleSaveVideoUrl("");
                      }}
                      title="Eliminar video"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Se guarda automáticamente. Soporta YouTube, Vimeo y otros servicios.
                </p>
                {videoUrl && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
                    ✓ URL guardada: {videoUrl}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="audio-url" className="flex items-center gap-2">
                  <Music className="w-4 h-4" />
                  URL del Audio
                </Label>
                <Input
                  id="audio-url"
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  placeholder="https://..."
                />
                <p className="text-xs text-muted-foreground">
                  Se guarda automáticamente.
                </p>
                {audioUrl && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
                    ✓ URL guardada: {audioUrl}
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Imágenes del Curso (Mapas, Infografías)
                    </Label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                      />
                      <Button variant="outline" size="sm" disabled={isUploading}>
                        <Upload className="w-4 h-4 mr-2" />
                        {isUploading ? "Subiendo..." : "Subir Imagen"}
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    💡 Después de subir, usa <code className="bg-slate-100 px-1 py-0.5 rounded">[IMAGE:0]</code> en el contenido para insertar la primera imagen, <code className="bg-slate-100 px-1 py-0.5 rounded">[IMAGE:1]</code> para la segunda, etc.
                  </p>
                </div>

                {images.length === 0 ? (
                  <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground text-sm">
                    No hay imágenes. Sube mapas, diagramas o infografías para complementar la lección.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {images.map((img, index) => (
                      <Card key={index} className="overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-indigo-200">
                        <div className="grid md:grid-cols-[300px,1fr] gap-4">
                          <div className="relative bg-white m-2 rounded-lg overflow-hidden">
                            <div className="aspect-video bg-slate-100 flex items-center justify-center">
                              <img
                                src={img.url}
                                alt={img.title || `Imagen ${index + 1}`}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="absolute top-2 right-2 flex gap-2">
                              <Button
                                variant="destructive"
                                size="icon"
                                className="h-8 w-8 bg-red-500 hover:bg-red-600"
                                onClick={() => removeImage(index)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                              <a
                                href={img.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-blue-500 text-white hover:bg-blue-600"
                              >
                                <Eye className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                          <div className="p-4 space-y-3">
                            <div className="bg-indigo-100 border border-indigo-300 rounded-lg px-3 py-2 mb-3">
                              <p className="text-xs font-mono font-bold text-indigo-900">
                                Código para insertar: <code className="bg-white px-2 py-1 rounded text-indigo-700">[IMAGE:{index}]</code>
                              </p>
                            </div>
                            {editingImageIndex === index ? (
                              <>
                                <div>
                                  <Label htmlFor={`title-${index}`} className="text-xs text-muted-foreground">Título de la imagen</Label>
                                  <Input
                                    id={`title-${index}`}
                                    value={img.title}
                                    onChange={(e) => updateImageData(index, 'title', e.target.value)}
                                    placeholder="Ej: Diagrama del ciclo de vida"
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`desc-${index}`} className="text-xs text-muted-foreground">Descripción</Label>
                                  <Textarea
                                    id={`desc-${index}`}
                                    value={img.description}
                                    onChange={(e) => updateImageData(index, 'description', e.target.value)}
                                    placeholder="Breve descripción de la imagen..."
                                    rows={3}
                                    className="mt-1"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => saveImageData(index)}
                                    size="sm"
                                    className="flex-1"
                                  >
                                    <Save className="w-4 h-4 mr-2" />
                                    Guardar
                                  </Button>
                                  <Button
                                    onClick={() => setEditingImageIndex(null)}
                                    size="sm"
                                    variant="outline"
                                  >
                                    Cancelar
                                  </Button>
                                </div>
                              </>
                            ) : (
                              <>
                                <div>
                                  <h4 className="font-semibold text-sm">
                                    {img.title || <span className="text-muted-foreground italic">Sin título</span>}
                                  </h4>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {img.description || <span className="italic">Sin descripción</span>}
                                  </p>
                                </div>
                                <Button
                                  onClick={() => setEditingImageIndex(index)}
                                  size="sm"
                                  variant="outline"
                                  className="w-full"
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Editar Título y Descripción
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="quizzes">
              <QuizBuilder lessonId={lesson.id} quizzes={lesson.quizzes} onUpdate={onUpdate} />
              <div className="mt-4 text-xs text-muted-foreground">
                💡 Cada lección tiene un quiz. Agrega múltiples preguntas al quiz.
              </div>
            </TabsContent>

            <TabsContent value="flashcards">
              <FlashcardBuilder lessonId={lesson.id} flashcards={lesson.flashcards} onUpdate={onUpdate} />
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}
