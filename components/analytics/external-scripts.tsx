"use client";

import Script from "next/script";
import { MetaPixel } from "./meta-pixel";

interface ExternalScriptsProps {
  metaPixelId?: string;
}

/**
 * Componente optimizado para cargar scripts externos de forma no bloqueante
 * - Meta Pixel: carga después de la interacción (afterInteractive)
 * - Otros scripts se pueden agregar aquí con estrategias apropiadas
 */
export function ExternalScripts({ metaPixelId }: ExternalScriptsProps) {
  return (
    <>
      {/* Meta Pixel con carga optimizada */}
      {metaPixelId && <MetaPixel pixelId={metaPixelId} />}

      {/* Preconnect a dominios externos para mejorar tiempos de carga */}
      <link rel="preconnect" href="https://connect.facebook.net" />
      <link rel="preconnect" href="https://assets.calendly.com" />
      <link rel="dns-prefetch" href="https://connect.facebook.net" />
      <link rel="dns-prefetch" href="https://assets.calendly.com" />
    </>
  );
}
