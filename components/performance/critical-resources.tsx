"use client";

import { useEffect } from "react";

/**
 * Componente para optimizar la carga de recursos críticos
 * Preconecta a dominios externos importantes para mejorar tiempos de carga
 */
export function CriticalResources() {
  useEffect(() => {
    // Preconnect a dominios críticos cuando el componente se monte
    const domains = [
      "https://connect.facebook.net",
      "https://assets.calendly.com",
      "https://fonts.googleapis.com",
      "https://fonts.gstatic.com",
    ];

    domains.forEach((domain) => {
      const link = document.createElement("link");
      link.rel = "preconnect";
      link.href = domain;
      if (domain.includes("fonts.gstatic.com")) {
        link.crossOrigin = "anonymous";
      }
      document.head.appendChild(link);
    });

    // DNS prefetch para otros dominios menos críticos
    const dnsPrefetchDomains = [
      "https://wa.me",
      "https://www.facebook.com",
    ];

    dnsPrefetchDomains.forEach((domain) => {
      const link = document.createElement("link");
      link.rel = "dns-prefetch";
      link.href = domain;
      document.head.appendChild(link);
    });
  }, []);

  return null;
}
