import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: {
    default: "LINKEDOUT_CORE",
    template: "%s // LINKEDOUT_CORE",
  },
  description:
    "Automatiza tu búsqueda de empleo en LinkedIn e Infojobs con CVs optimizados por IA y seguimiento completo de solicitudes.",
  openGraph: {
    type: "website",
    url: APP_URL,
    title: "LINKEDOUT_CORE — Job Automation Engine",
    description:
      "Automatiza tu búsqueda de empleo en LinkedIn e Infojobs con CVs optimizados por IA.",
    siteName: "LinkedOut",
    images: [{ url: `${APP_URL}/og-image.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "LINKEDOUT_CORE",
    description: "Automatiza tu búsqueda de empleo con IA.",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  metadataBase: new URL(APP_URL),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${spaceGrotesk.variable} ${inter.variable} dark h-full`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
        />
      </head>
      <body className="min-h-full bg-surface text-on-surface font-body antialiased selection:bg-primary-container selection:text-on-primary-container">
        {children}
      </body>
    </html>
  );
}
