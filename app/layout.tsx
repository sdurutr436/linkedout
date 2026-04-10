import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: {
    default: "LinkedOut",
    template: "%s — LinkedOut",
  },
  description:
    "Automatiza tu búsqueda de empleo en LinkedIn e Infojobs con CVs optimizados por IA y seguimiento completo de solicitudes.",
  openGraph: {
    type: "website",
    url: APP_URL,
    title: "LinkedOut — Automatización de Empleo",
    description:
      "Automatiza tu búsqueda de empleo en LinkedIn e Infojobs con CVs optimizados por IA.",
    siteName: "LinkedOut",
    images: [{ url: `${APP_URL}/og-image.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "LinkedOut",
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
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-slate-950 text-white antialiased">
        {children}
      </body>
    </html>
  );
}
