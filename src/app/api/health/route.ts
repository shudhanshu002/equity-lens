import { NextResponse } from "next/server";

function hasEnv(value: string | undefined): boolean {
  return Boolean(value && value.trim().length > 0);
}

export async function GET() {
  const services = {
    alphaVantage: {
      configured: hasEnv(process.env.ALPHA_VANTAGE_API_KEY),
      purpose: "Company overview, fundamentals, valuation metrics",
    },
    finnhub: {
      configured: hasEnv(process.env.FINNHUB_API_KEY),
      purpose: "Company news and market sentiment",
    },
    gemini: {
      configured: hasEnv(process.env.GOOGLE_API_KEY),
      model: process.env.GOOGLE_MODEL ?? "gemini-2.5-flash",
      purpose: "Investment memo and comparison reasoning",
    },
  };

  const warnings: string[] = [];

  if (!services.alphaVantage.configured) {
    warnings.push("ALPHA_VANTAGE_API_KEY is missing. Financials will use fallback data.");
  }

  if (!services.finnhub.configured) {
    warnings.push("FINNHUB_API_KEY is missing. News will use mock fallback data.");
  }

  if (!services.gemini.configured) {
    warnings.push("GOOGLE_API_KEY is missing. Memo generation will use fallback logic.");
  }

  return NextResponse.json({
    success: true,
    status: "ok",
    service: "EquityLens AI Investment Research Agent",
    version: "1.0.0",
    environment: process.env.NODE_ENV ?? "development",
    services,
    warnings,
    endpoints: {
      research: "POST /api/research",
      compare: "POST /api/compare",
      health: "GET /api/health",
    },
    timestamp: new Date().toISOString(),
  });
}