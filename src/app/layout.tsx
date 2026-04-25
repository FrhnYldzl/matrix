import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Matrix — Agent Orchestrator",
  description:
    "Wake up, Neo. Vizyondan ajana, ajandan iş akışına, iş akışından KPI'a kadar — şirketinin dijital organizasyonunu tek katmanda tasarla, işlet ve evrilt.",
};

// Matrix state-driven app — workspace verileri Zustand'dan okur, prerender
// edilemez. Layout level'ında force-dynamic, tüm sayfalar runtime render.
// Bu sayede empty workspace state'inde build kırılmıyor.
export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <div id="app-root" className="min-h-screen">
          <AppShell>{children}</AppShell>
        </div>
      </body>
    </html>
  );
}
