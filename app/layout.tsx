import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const nunito = Nunito({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cursia for Enterprise | Formación Corporativa de Alto Impacto con IA",
  description: "Optimice el desarrollo de talento en su organización con Cursia. Nuestra plataforma B2B combina consultoría estratégica e Inteligencia Artificial avanzada para garantizar un aprendizaje auténtico, verificable y escalable.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={nunito.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

