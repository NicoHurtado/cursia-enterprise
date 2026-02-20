"use client";

import Script from "next/script";
import { useEffect } from "react";

interface MetaPixelProps {
  pixelId?: string;
}

export function MetaPixel({ pixelId }: MetaPixelProps) {
  // Hook siempre debe ejecutarse (regla de React Hooks)
  useEffect(() => {
    // Solo inicializar si hay pixelId y el script ya se cargó
    if (pixelId && typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("init", pixelId);
      (window as any).fbq("track", "PageView");
    }
  }, [pixelId]);

  // Solo renderizar si hay pixelId configurado
  if (!pixelId) return null;

  return (
    <>
      {/* Script base de Meta Pixel - carga después de la interacción */}
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
          `,
        }}
      />
      {/* Noscript fallback para cuando JavaScript está deshabilitado */}
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
