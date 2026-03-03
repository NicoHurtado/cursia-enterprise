"use client";

import { type ComponentType, useEffect, useMemo, useState, useRef } from "react";
import { FileStack, Presentation, Sparkles, Download, Loader2 } from "lucide-react";
import PitchDeck from "@/components/pitch/PitchDeck";
import { ENTERPRISE_PITCH_SLIDES, ADDITIONAL_PITCH_SLIDES } from "@/components/pitch/pitch-content";
import { EnterpriseFormal } from "@/components/pitch/EnterpriseFormal";
import { AgenteFormal } from "@/components/pitch/AgenteFormal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface PitchItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  component: ComponentType<any>;
  formalComponent: ComponentType<any>;
  fileName: string;
}

const PITCHES: PitchItem[] = [
  {
    id: "cursia-enterprise",
    title: "Pitch Cursia Enterprise",
    description: "Versión comercial principal con propuestas, planes y pricing.",
    tags: ["Comercial", "IA", "Corporativo"],
    component: () => <PitchDeck slides={ENTERPRISE_PITCH_SLIDES} />,
    formalComponent: EnterpriseFormal,
    fileName: "Cursia_Enterprise_Propuesta.pdf",
  },
  {
    id: "cursia-additional",
    title: "Presentación Adicional",
    description: "Contenido complementario enfocado en el Agente Cursia y diagnóstico.",
    tags: ["Especializado", "Agente IA", "Diagnóstico"],
    component: () => <PitchDeck slides={ADDITIONAL_PITCH_SLIDES} />,
    formalComponent: AgenteFormal,
    fileName: "Cursia_Agente_IA_Dossier.pdf",
  },
];

export function PitchsHub() {
  const [activePitchId, setActivePitchId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const formalDocRef = useRef<HTMLDivElement>(null);

  const activePitch = useMemo(
    () => PITCHES.find((pitch) => pitch.id === activePitchId) || null,
    [activePitchId]
  );
  const ActivePitchComponent = activePitch?.component;

  const handleDownload = async (pitch: PitchItem) => {
    setDownloadingId(pitch.id);

    // Allow a small delay for the hidden component to render if needed
    await new Promise(resolve => setTimeout(resolve, 100));

    const element = document.getElementById(`${pitch.id}-formal-render`);
    if (!element) {
      setDownloadingId(null);
      return;
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        removeContainer: true
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      const pageHeight = pdf.internal.pageSize.getHeight();

      let heightLeft = pdfHeight;
      let position = 0;

      // Add the first page
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      // Add more pages if content is longer than one page
      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }

      pdf.save(pitch.fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setDownloadingId(null);
    }
  };

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
          <h1 className="text-3xl font-bold tracking-tight">Pitchs Hub</h1>
          <p className="text-muted-foreground">
            Gestiona tus presentaciones y descarga documentos formales para clientes.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PITCHES.map((pitch) => (
            <Card key={pitch.id} className="border-cursia-blue/20 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <CardHeader className="space-y-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Presentation className="h-5 w-5 text-cursia-blue" />
                  {pitch.title}
                </CardTitle>
                <CardDescription>{pitch.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 flex-grow flex flex-col justify-between">
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

                <div className="space-y-3">
                  <Button
                    onClick={() => setActivePitchId(pitch.id)}
                    className="w-full bg-cursia-blue hover:bg-blue-600"
                  >
                    <FileStack className="mr-2 h-4 w-4" />
                    Presentar
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => handleDownload(pitch)}
                    disabled={downloadingId === pitch.id}
                    className="w-full border-cursia-blue/20 text-cursia-blue hover:bg-cursia-blue/5"
                  >
                    {downloadingId === pitch.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    {downloadingId === pitch.id ? "Generando..." : "Descargar Formal"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Hidden container for rendering formal documents for PDF capture */}
      <div className="fixed -left-[10000px] top-0 opacity-0 pointer-events-none" aria-hidden="true">
        {PITCHES.map(pitch => {
          const FormalComp = pitch.formalComponent;
          return (
            <div key={pitch.id} id={`${pitch.id}-formal-render`} className="w-[210mm]">
              <FormalComp />
            </div>
          );
        })}
      </div>

      {activePitch && (
        <div className="fixed inset-0 z-[120] bg-black">
          <div className="pointer-events-none fixed right-4 top-4 z-[130] rounded-full border border-white/30 bg-black/50 px-4 py-2 text-xs font-semibold tracking-wide text-white">
            Presiona ESC para salir
          </div>
          {ActivePitchComponent ? <ActivePitchComponent key={activePitchId} /> : null}
        </div>
      )}
    </>
  );
}


