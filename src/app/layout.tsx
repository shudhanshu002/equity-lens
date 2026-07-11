import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeInitScript } from "@/components/research/theme-init-script";
import { AuthSessionProvider } from "@/components/auth/session-provider";

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
      <body className="font-sans antialiased">
        <ThemeInitScript />
        <AuthSessionProvider>
          {children}
        </AuthSessionProvider>
      </body>
    </html>
  );
}
