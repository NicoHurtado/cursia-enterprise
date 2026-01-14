"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, GripVertical, Pencil, Check, X } from "lucide-react";
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
          order: modules.length,
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
            disabled={isCreating}
            type="button"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2">
          {modules.map((module) => (
            <div
              key={module.id}
              className={`p-3 border rounded-lg transition-colors ${
                selectedModule === module.id
                  ? "border-primary bg-primary/5"
                  : "hover:bg-accent"
              }`}
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
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
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
