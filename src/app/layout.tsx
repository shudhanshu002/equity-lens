import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeInitScript } from "@/components/research/theme-init-script";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EquityLens AI | Investment Research Agent",
  description:
    "Professional AI-powered investment research platform built with Next.js, LangGraph.js, Gemini, Alpha Vantage, and explainable scoring.",
  keywords: [
    "AI investment research",
    "LangGraph",
    "Next.js",
    "Gemini",
    "stock analysis",
    "financial research agent",
    "investment memo generator",
  ],
  authors: [
    {
      name: "Shudhanshu Kumar Singh",
    },
  ],
  creator: "Shudhanshu Kumar Singh",
  applicationName: "EquityLens AI",
};

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${jakarta.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <ThemeInitScript />
        {children}
      </body>
    </html>
  );
}