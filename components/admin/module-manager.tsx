"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, GripVertical, Pencil, Check, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Module {
  id: string;
  title: string;
  description: string | null;
  order: number;
}

interface ModuleManagerProps {
  courseId: string;
  modules: Module[];
  selectedModule: string | null;
  onSelectModule: (moduleId: string) => void;
  onModuleUpdate?: () => void;
}

export function ModuleManager({
  courseId,
  modules,
  selectedModule,
  onSelectModule,
  onModuleUpdate,
}: ModuleManagerProps) {
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [draggedModuleIndex, setDraggedModuleIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Reset isCreating if it gets stuck
  useEffect(() => {
    if (isCreating) {
      const timer = setTimeout(() => {
        setIsCreating(false);
      }, 5000); // Reset after 5 seconds if stuck
      return () => clearTimeout(timer);
    }
  }, [isCreating]);

  const handleCreateModule = async () => {
    const trimmedTitle = newModuleTitle.trim();
    if (!trimmedTitle || isCreating) {
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch("/api/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          title: trimmedTitle,
          order: modules.reduce((max, m) => Math.max(max, m.order), -1) + 1,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error creating module:", errorData);
        alert(`Error al crear el módulo: ${errorData.error || "Error desconocido"}`);
        setIsCreating(false);
        return;
      }

      const newModule = await response.json();
      setNewModuleTitle("");
      setIsCreating(false);

      // Call the update callback to refresh the course data
      if (onModuleUpdate) {
        // Use setTimeout to ensure the API call completes before refreshing
        setTimeout(() => {
          onModuleUpdate();
        }, 100);
      }

      // Auto-select the newly created module
      if (newModule.id) {
        setTimeout(() => {
          onSelectModule(newModule.id);
        }, 200);
      }
    } catch (error) {
      console.error("Error creating module:", error);
      alert("Error al crear el módulo. Por favor, intenta de nuevo.");
      setIsCreating(false);
    }
  };

  const handleStartEdit = (module: Module) => {
    setEditingModule(module.id);
    setEditTitle(module.title);
  };

  const handleSaveEdit = async (moduleId: string) => {
    if (!editTitle.trim()) {
      setEditingModule(null);
      return;
    }

    try {
      // TODO: Add API endpoint for updating module title
      // For now, we'll need to add this endpoint
      const response = await fetch(`/api/modules/${moduleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle }),
      });

      if (response.ok) {
        setEditingModule(null);
        onModuleUpdate?.();
      }
    } catch (error) {
      console.error("Error updating module:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditingModule(null);
    setEditTitle("");
  };

  const handleModuleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedModuleIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleModuleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedModuleIndex === null || draggedModuleIndex === index) return;
    setDragOverIndex(index);
  };

  const handleModuleDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = draggedModuleIndex;
    setDraggedModuleIndex(null);
    setDragOverIndex(null);

    if (sourceIndex === null || sourceIndex === targetIndex || modules.length === 0) {
      return;
    }

    setIsReordering(true);
    try {
      const newModules = [...modules];
      const [movedModule] = newModules.splice(sourceIndex, 1);
      newModules.splice(targetIndex, 0, movedModule);

      const response = await fetch("/api/modules/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          moduleIds: newModules.map((m) => m.id),
        }),
      });

      if (response.ok) {
        onModuleUpdate?.();
      }
    } catch (error) {
      console.error("Error reordering modules:", error);
    } finally {
      setIsReordering(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Módulos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Nuevo módulo..."
            value={newModuleTitle}
            onChange={(e) => setNewModuleTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleCreateModule();
              }
            }}
          />
          <Button
            onClick={handleCreateModule}
            size="icon"
            disabled={isCreating || isReordering}
            type="button"
          >
            {isCreating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </Button>
        </div>

        <div className="space-y-2 relative">
          {isReordering && (
            <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center rounded-lg">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}
          {modules.map((module, index) => (
            <div
              key={module.id}
              draggable={!editingModule && !isReordering}
              onDragStart={(e) => handleModuleDragStart(e, index)}
              onDragOver={(e) => handleModuleDragOver(e, index)}
              onDrop={(e) => handleModuleDrop(e, index)}
              onDragEnd={() => {
                setDraggedModuleIndex(null);
                setDragOverIndex(null);
              }}
              className={`p-3 border rounded-lg transition-all duration-200 ${selectedModule === module.id
                ? "border-primary bg-primary/5"
                : "hover:bg-accent border-transparent"
                } ${draggedModuleIndex === index ? "opacity-40 scale-95" : "opacity-100"}
              ${dragOverIndex === index ? "border-t-primary border-t-4" : ""}
              ${!editingModule && !isReordering ? "cursor-grab active:cursor-grabbing" : ""}
              bg-card`}
            >
              {editingModule === module.id ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSaveEdit(module.id);
                      } else if (e.key === "Escape") {
                        handleCancelEdit();
                      }
                    }}
                    className="flex-1"
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleSaveEdit(module.id)}
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCancelEdit}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground mr-1" />
                  <span
                    className="font-medium flex-1 cursor-pointer"
                    onClick={() => onSelectModule(module.id)}
                  >
                    {module.title}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleStartEdit(module)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {modules.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No hay módulos. Crea uno para comenzar.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
