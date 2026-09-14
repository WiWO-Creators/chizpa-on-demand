import type { Metadata } from "next";
import "@fontsource/fredoka/600.css";
import "@fontsource/fredoka/700.css";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/plus-jakarta-sans/700.css";
import "@fontsource/plus-jakarta-sans/800.css";
import { ExperienceLayer } from "./components/experience-layer";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://chizpa.com"),
  title: "Chizpa.com — Haz que pase en menos de 72 horas",
  description: "Cuéntale tu proyecto a Chizpita. Especialistas Wiwo lo convierten en una entrega profesional en menos de 72 horas.",
  keywords: ["proyectos on-demand", "ejecución de proyectos", "Wiwo", "presentaciones", "videos", "automatizaciones"],
  openGraph: {
    title: "¿Tienes un proyecto? Chízalo.",
    description: "Tú lo cuentas. Chizpita lo ordena. El equipo lo hace en menos de 72 horas.",
    images: ["/brand/chizpa-logo-flat.png"],
    siteName: "Chizpa.com",
    locale: "es_CL",
  },
  alternates: { canonical: "/" },
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon.png", type: "image/png", sizes: "192x192" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(sessionStorage.getItem("chizpa-ready")==="1")document.documentElement.classList.add("chizpa-ready")}catch(e){}`,
          }}
        />
        <ExperienceLayer />
        {children}
      </body>
    </html>
  );
}
