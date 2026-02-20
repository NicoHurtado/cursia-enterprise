import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ExternalScripts } from "@/components/analytics/external-scripts";
import { CriticalResources } from "@/components/performance/critical-resources";

const nunito = Nunito({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cursia for Enterprise | Formación Corporativa de Alto Impacto con IA",
  description: "Optimice el desarrollo de talento en su organización con Cursia. Nuestra plataforma B2B combina consultoría estratégica e Inteligencia Artificial avanzada para garantizar un aprendizaje auténtico, verificable y escalable.",
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    title: "Cursia for Enterprise | Formación Corporativa de Alto Impacto con IA",
    description: "Optimice el desarrollo de talento en su organización con Cursia. Plataforma B2B con IA avanzada para capacitación corporativa.",
    url: "https://www.cursia.online",
    siteName: "Cursia for Enterprise",
    locale: "es_CO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cursia for Enterprise | Formación Corporativa de Alto Impacto con IA",
    description: "Optimice el desarrollo de talento en su organización con Cursia. Plataforma B2B con IA avanzada.",
  },
};

// Obtener el Meta Pixel ID desde variables de entorno
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        {/* Preconnect a dominios críticos para mejorar tiempos de carga */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={nunito.className}>
        {/* Optimización de recursos críticos */}
        <CriticalResources />
        <Providers>{children}</Providers>
        {/* Scripts externos optimizados - cargan después del contenido crítico */}
        <ExternalScripts metaPixelId={META_PIXEL_ID} />
      </body>
    </html>
  );
}

