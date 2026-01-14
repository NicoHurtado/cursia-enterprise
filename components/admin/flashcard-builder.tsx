"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

interface FlashcardBuilderProps {
  lessonId: string;
  flashcards: Flashcard[];
  onUpdate: () => void;
}

export function FlashcardBuilder({
  lessonId,
  flashcards,
  onUpdate,
}: FlashcardBuilderProps) {
  const [localFlashcards, setLocalFlashcards] = useState<Flashcard[]>(flashcards);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});

  // Sync with props when they change (only if different)
  useEffect(() => {
    if (JSON.stringify(flashcards) !== JSON.stringify(localFlashcards)) {
      setLocalFlashcards(flashcards);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flashcards]);

  const handleCreateFlashcard = async () => {
    try {
      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          front: "Frente",
          back: "Reverso",
          order: localFlashcards.length,
        }),
      });

      if (response.ok) {
        const newFlashcard = await response.json();
        setLocalFlashcards((prev) => [...prev, newFlashcard]);
      }
    } catch (error) {
      console.error("Error creating flashcard:", error);
    }
  };

  const handleUpdateFlashcard = useCallback(async (
    flashcardId: string,
    data: Partial<Flashcard>
  ) => {
    // Update local state immediately (optimistic update)
    setLocalFlashcards((prev) =>
      prev.map((f) => (f.id === flashcardId ? { ...f, ...data } : f))
    );

    // Clear existing debounce timer for this flashcard
    if (debounceTimers.current[flashcardId]) {
      clearTimeout(debounceTimers.current[flashcardId]);
    }

    setSaving((prev) => ({ ...prev, [flashcardId]: true }));

    // Debounce text changes (3 seconds for less frequent saves)
    debounceTimers.current[flashcardId] = setTimeout(async () => {
      try {
        const response = await fetch(`/api/flashcards/${flashcardId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          // Success - state already updated optimistically
        } else {
          // Revert on error
          setLocalFlashcards((prev) =>
            prev.map((f) => (f.id === flashcardId ? flashcards.find((f2) => f2.id === flashcardId) || f : f))
          );
        }
      } catch (error) {
        console.error("Error updating flashcard:", error);
        // Revert on error
        setLocalFlashcards((prev) =>
          prev.map((f) => (f.id === flashcardId ? flashcards.find((f2) => f2.id === flashcardId) || f : f))
        );
      } finally {
        setSaving((prev) => ({ ...prev, [flashcardId]: false }));
        delete debounceTimers.current[flashcardId];
      }
    }, 3000);
  }, [flashcards]);

  const handleDeleteFlashcard = async (flashcardId: string) => {
    if (!confirm("¿Estás seguro de eliminar esta flashcard?")) return;

    // Optimistic update
    setLocalFlashcards((prev) => prev.filter((f) => f.id !== flashcardId));

    try {
      const response = await fetch(`/api/flashcards/${flashcardId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onUpdate();
      } else {
        // Revert on error
        setLocalFlashcards(flashcards);
      }
    } catch (error) {
      console.error("Error deleting flashcard:", error);
      // Revert on error
      setLocalFlashcards(flashcards);
    }
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach((timer) => clearTimeout(timer));
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Flashcards</h3>
        <Button onClick={handleCreateFlashcard} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Agregar Flashcard
        </Button>
      </div>

      {localFlashcards.map((flashcard) => (
        <Card key={flashcard.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Flashcard</CardTitle>
              <div className="flex items-center gap-2">
                {saving[flashcard.id] && (
                  <span className="text-xs text-muted-foreground">Guardando...</span>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteFlashcard(flashcard.id)}
                  disabled={saving[flashcard.id]}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Frente</Label>
              <textarea
                value={flashcard.front}
                onChange={(e) =>
                  handleUpdateFlashcard(flashcard.id, { front: e.target.value })
                }
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Texto del frente de la flashcard..."
              />
            </div>
            <div className="space-y-2">
              <Label>Reverso</Label>
              <textarea
                value={flashcard.back}
                onChange={(e) =>
                  handleUpdateFlashcard(flashcard.id, { back: e.target.value })
                }
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Texto del reverso de la flashcard..."
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {localFlashcards.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">
              No hay flashcards en esta lección
            </p>
            <Button onClick={handleCreateFlashcard}>
              <Plus className="w-4 h-4 mr-2" />
              Crear primera flashcard
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
