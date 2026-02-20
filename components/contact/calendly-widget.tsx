"use client";

import { useState } from "react";
import Script from "next/script";

interface CalendlyWidgetProps {
  url: string;
  name?: string;
  email?: string;
  onClose?: () => void;
  /** Cuando true, se muestra el iframe del calendario (usuario hizo clic en Agendar) */
  shouldLoad?: boolean;
  /** Cuando true, solo se precarga el script (sin iframe). La página lo pone en true ~3s después de cargar. */
  preloadScriptOnly?: boolean;
  /** Si la página ya precargó el script a los 3s, no volver a inyectar el script al abrir el calendario. */
  scriptAlreadyPreloaded?: boolean;
}

export function CalendlyWidget({
  url,
  name,
  email,
  shouldLoad: showIframe = true,
  preloadScriptOnly = false,
  scriptAlreadyPreloaded = false,
}: CalendlyWidgetProps) {
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);

  // Script: precarga a los ~3s O cuando el usuario abre el calendario (y aún no se había precargado)
  const loadScript = preloadScriptOnly || (showIframe && !scriptAlreadyPreloaded);

  const calendlyUrl = `${url}?embed_domain=${
    typeof window !== "undefined" ? window.location.hostname : ""
  }&embed_type=Inline${name ? `&name=${encodeURIComponent(name)}` : ""}${
    email ? `&email=${encodeURIComponent(email)}` : ""
  }`;

  return (
    <>
      {loadScript && (
        <Script
          id="calendly-script"
          src="https://assets.calendly.com/assets/external/widget.js"
          strategy="lazyOnload"
        />
      )}

      {!preloadScriptOnly && (
        <div className="calendly-inline-widget" style={{ minWidth: "320px", height: "700px" }}>
          {showIframe ? (
            <iframe
              src={calendlyUrl}
              width="100%"
              height="100%"
              frameBorder="0"
              className="rounded-2xl"
              title="Calendly Scheduling"
              loading="lazy"
              onLoad={() => setIsIframeLoaded(true)}
              style={{ opacity: isIframeLoaded ? 1 : 0, transition: "opacity 0.3s" }}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-slate-50 rounded-2xl">
              <div className="text-slate-400 text-sm">Preparando calendario...</div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
