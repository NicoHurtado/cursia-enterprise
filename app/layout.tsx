import type { Metadata } from "next";
import { Nunito, Plus_Jakarta_Sans, Manrope } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ExternalScripts } from "@/components/analytics/external-scripts";
import { CriticalResources } from "@/components/performance/critical-resources";

const nunito = Nunito({ subsets: ["latin"] });
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["400", "500", "600", "700", "800"],
});
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Cursia for Enterprise | Formación Corporativa de Alto Impacto con IA",
  description: "Evalúe a su equipo gratis con IA. Creamos evaluaciones personalizadas con preguntas abiertas que miden el conocimiento real de sus empleados y revelan dónde capacitar. Sin compromisos.",
  icons: {
    icon: "/favicon.png",
  },
  alternates: {
    canonical: "https://www.cursia.online",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Cursia for Enterprise | Formación Corporativa de Alto Impacto con IA",
    description: "Evalúe a su equipo gratis con IA. Evaluaciones personalizadas con preguntas abiertas que revelan dónde capacitar. Sin compromisos.",
    url: "https://www.cursia.online",
    siteName: "Cursia for Enterprise",
    locale: "es_CO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cursia for Enterprise | Formación Corporativa de Alto Impacto con IA",
    description: "La plataforma B2B que garantiza que sus empleados realmente aprenden. Evaluaciones con IA, resultados verificables.",
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
        {/* Schema Markup — Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Cursia for Enterprise",
              "url": "https://www.cursia.online",
              "logo": "https://www.cursia.online/favicon.png",
              "description": "Plataforma B2B de capacitación corporativa con Inteligencia Artificial. Evaluaciones con preguntas abiertas, detección de fraude y resultados verificables.",
              "contactPoint": [
                {
                  "@type": "ContactPoint",
                  "telephone": "+57-318-552-9534",
                  "contactType": "sales",
                  "areaServed": "CO",
                  "availableLanguage": "Spanish"
                }
              ],
              "sameAs": [
                "https://instagram.com/cursia.online"
              ]
            })
          }}
        />
      </head>
      <body className={`${nunito.className} ${plusJakarta.variable} ${manrope.variable}`}>
        {/* Optimización de recursos críticos */}
        <CriticalResources />
        <Providers>{children}</Providers>
        {/* Scripts externos optimizados - cargan después del contenido crítico */}
        <ExternalScripts metaPixelId={META_PIXEL_ID} />
      </body>
    </html>
  );
}

