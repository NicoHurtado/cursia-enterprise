"use client";

import { type ComponentType, useEffect, useMemo, useState } from "react";
import { FileStack, Presentation, Sparkles } from "lucide-react";
import PitchDeck from "@/components/pitch/PitchDeck";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PitchItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  component: ComponentType;
}

const PITCHES: PitchItem[] = [
  {
    id: "cursia-enterprise",
    title: "Pitch Cursia Enterprise",
    description: "Versión comercial principal con propuestas, planes y pricing.",
    tags: ["Comercial", "IA", "Corporativo"],
    component: PitchDeck,
  },
];

export function PitchsHub() {
  const [activePitchId, setActivePitchId] = useState<string | null>(null);
  const activePitch = useMemo(
    () => PITCHES.find((pitch) => pitch.id === activePitchId) || null,
    [activePitchId]
  );
  const ActivePitchComponent = activePitch?.component;

  useEffect(() => {
    if (!activePitch) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActivePitchId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [activePitch]);

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pitchs</h1>
          <p className="text-muted-foreground">
            Selecciona el pitch que quieres presentar en pantalla completa.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {PITCHES.map((pitch) => (
            <Card key={pitch.id} className="border-cursia-blue/20 shadow-sm">
              <CardHeader className="space-y-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Presentation className="h-5 w-5 text-cursia-blue" />
                  {pitch.title}
                </CardTitle>
                <CardDescription>{pitch.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {pitch.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full border border-cursia-blue/30 bg-cursia-blue/5 px-2.5 py-1 text-xs font-medium text-cursia-blue"
                    >
                      <Sparkles className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>
                <Button
                  onClick={() => setActivePitchId(pitch.id)}
                  className="w-full bg-cursia-blue hover:bg-blue-600"
                >
                  <FileStack className="mr-2 h-4 w-4" />
                  Abrir en pantalla completa
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {activePitch && (
        <div className="fixed inset-0 z-[120] bg-black">
          {/* Close is intentionally ESC-only as requested */}
          <div className="pointer-events-none fixed right-4 top-4 z-[130] rounded-full border border-white/30 bg-black/50 px-4 py-2 text-xs font-semibold tracking-wide text-white">
            Presiona ESC para salir
          </div>
          {ActivePitchComponent ? <ActivePitchComponent /> : null}
        </div>
      )}
    </>
  );
}

