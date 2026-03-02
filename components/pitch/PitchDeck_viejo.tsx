"use client";

import { useState, useEffect, useCallback, ReactNode } from "react";
import { AnimatePresence } from "framer-motion";
import Slide from "./Slide";
import ProgressBar from "./ProgressBar";
import { ChevronLeft, ChevronRight, Printer } from "lucide-react";

export interface SlideContent {
  id?: string;
  title?: string;
  content?: ReactNode;
  bullets?: Array<string | { text: string; icon: any; color: string }>;
}

interface PitchDeckProps {
  slides: SlideContent[];
}

export default function PitchDeck({ slides = [] }: PitchDeckProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPrintMode, setIsPrintMode] = useState(false);

  useEffect(() => {
    if (!slides || slides.length === 0 || isPrintMode) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") {
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        prevSlide();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlide, slides.length, isPrintMode]);

  const nextSlide = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      setDirection(1);
      setCurrentSlide(prev => prev + 1);
    }
  }, [currentSlide, slides.length]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide(prev => prev - 1);
    }
  }, [currentSlide]);

  const togglePrintMode = () => {
    setIsPrintMode(!isPrintMode);
    // Give time for the layout to change before triggering print
    if (!isPrintMode) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  };

  if (isPrintMode) {
    return (
      <div className="bg-white text-black min-h-screen">
        <div className="fixed top-4 right-4 no-print z-[100] flex gap-2">
          <button
            onClick={() => setIsPrintMode(false)}
            className="px-4 py-2 bg-gray-100 text-gray-900 rounded-full font-bold hover:bg-gray-200 transition-colors"
          >
            Salir de Vista Impresión
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-cursia-blue text-white rounded-full font-bold hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Printer className="w-4 h-4" /> Imprimir / PDF
          </button>
        </div>

        {slides.map((slide, idx) => (
          <div key={idx} className="slide-container bg-white">
            {slide.content ? (
              slide.content
            ) : (
              <div className="flex flex-col h-full justify-center max-w-6xl mx-auto w-full px-8">
                <h2 className="text-6xl md:text-7xl font-bold text-gray-900 tracking-tight mb-20 border-l-8 border-cursia-blue pl-8">
                  {slide.title}
                </h2>
                <div className="space-y-8 pl-8">
                  {slide.bullets?.map((bullet, i) => (
                    <div key={i} className="flex items-start gap-8 group">
                      {typeof bullet !== 'string' && bullet.icon ? (
                        <div className="p-3 rounded-2xl bg-gray-50 border border-transparent">
                          <bullet.icon className={`w-8 h-8 ${bullet.color}`} strokeWidth={2.5} />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-cursia-blue mt-5 flex-shrink-0" />
                      )}
                      <p className="text-3xl md:text-4xl text-gray-600 font-medium leading-relaxed">
                        {typeof bullet === 'string' ? bullet : bullet.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  const slideData = slides[currentSlide];

  if (!slideData) return null;

  return (
    <div className="relative w-screen h-screen bg-white text-black overflow-hidden selection:bg-cursia-blue/20 flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-tr from-white via-white to-blue-50/30 pointer-events-none z-0" />

      <div className="absolute top-6 left-8 z-50 no-print">
        <button
          onClick={togglePrintMode}
          className="flex items-center gap-2 px-4 py-2 bg-gray-50/50 hover:bg-white text-gray-400 hover:text-cursia-blue rounded-full transition-all border border-transparent hover:border-gray-100 font-medium text-sm"
        >
          <Printer className="w-4 h-4" /> Exportar PDF
        </button>
      </div>

      <AnimatePresence initial={false} custom={direction} mode="wait">
        <Slide key={currentSlide} direction={direction} className="z-10">
          {slideData.content ? (
            slideData.content
          ) : (
            <div className="flex flex-col h-full justify-center max-w-6xl mx-auto w-full px-8">
              <h2 className="text-6xl md:text-7xl font-bold text-gray-900 tracking-tight mb-20 border-l-8 border-cursia-blue pl-8">
                {slideData.title}
              </h2>
              <div className="space-y-8 pl-8">
                {slideData.bullets?.map((bullet, i) => (
                  <div key={i} className="flex items-start gap-8 group">
                    {typeof bullet !== 'string' && bullet.icon ? (
                      <div className="p-3 rounded-2xl bg-gray-50 group-hover:bg-white group-hover:shadow-lg transition-all border border-transparent group-hover:border-gray-100">
                        <bullet.icon className={`w-8 h-8 ${bullet.color}`} strokeWidth={2.5} />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-cursia-blue mt-5 flex-shrink-0 shadow-sm shadow-blue-200" />
                    )}
                    <p className="text-3xl md:text-4xl text-gray-600 font-medium leading-relaxed group-hover:text-gray-900 transition-colors">
                      {typeof bullet === 'string' ? bullet : bullet.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Slide>
      </AnimatePresence>

      <div className="absolute inset-y-0 left-0 w-24 flex items-center justify-start pl-4 opacity-0 hover:opacity-100 transition-opacity z-20 no-print">
        <button onClick={prevSlide} className="p-4 rounded-full hover:bg-white hover:shadow-xl transition-all disabled:opacity-0" disabled={currentSlide === 0}>
          <ChevronLeft className="w-8 h-8 text-gray-400" />
        </button>
      </div>
      <div className="absolute inset-y-0 right-0 w-24 flex items-center justify-end pr-4 opacity-0 hover:opacity-100 transition-opacity z-20 no-print">
        <button onClick={nextSlide} className="p-4 rounded-full hover:bg-white hover:shadow-xl transition-all disabled:opacity-0" disabled={currentSlide === slides.length - 1}>
          <ChevronRight className="w-8 h-8 text-gray-400" />
        </button>
      </div>

      <div className="no-print">
        <ProgressBar current={currentSlide} total={slides.length} />
      </div>

      <div className="absolute bottom-6 right-8 text-gray-300 font-mono text-sm z-50 no-print">
        {currentSlide + 1} / {slides.length}
      </div>
    </div>
  );
}
