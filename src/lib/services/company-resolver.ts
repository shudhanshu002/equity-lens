import type { CompanyProfile } from "@/lib/types/research";
import type {
  TickerCandidate,
  TickerResolverProvider,
} from "@/lib/services/ticker-resolver-types";
import { searchCompanySymbol } from "@/lib/services/symbol-search";
import { searchYahooCompanySymbol } from "@/lib/services/yahoo-symbol-search";
import { searchFinnhubCompanySymbol } from "@/lib/services/finnhub-symbol-search";
import { discoverPublicTicker } from "@/lib/services/public-ticker-discovery";

export type CompanyResolveResult = {
  company?: CompanyProfile;
  provider?: TickerResolverProvider | "GENERAL_COMPANY_RESOLVER";
  warnings: string[];
  ambiguous?: boolean;
  suggestions?: Array<{ symbol: string; name: string; exchange: string }>;
};

type ScoredCandidate = TickerCandidate & {
  finalScore: number;
  reasons: string[];
};

const PUBLIC_TICKER_CONFIDENCE_THRESHOLD = 55;

export async function resolveCompany(
  input: string
): Promise<CompanyResolveResult> {
  const query = cleanCompanyInput(input);

  if (query.toLowerCase() === "tata") {
    return {
      ambiguous: true,
      warnings: [],
      suggestions: [
        { symbol: "TCS", name: "Tata Consultancy Services Limited", exchange: "NSE" },
        { symbol: "TATAMOTORS", name: "Tata Motors Limited", exchange: "NSE" },
        { symbol: "TATASTEEL", name: "Tata Steel Limited", exchange: "NSE" }
      ]
    };
  }

  const candidates = await collectTickerCandidates(query);
  const ranked = rankTickerCandidates(query, candidates);

  const best = ranked[0];

  if (best && best.finalScore >= PUBLIC_TICKER_CONFIDENCE_THRESHOLD) {
    return {
      provider: best.provider,
      warnings: buildPublicResolverWarnings(query, best),
      company: {
        symbol: best.symbol,
        name: best.name,
        exchange: best.exchange,
        sector: "UNKNOWN",
        industry: "UNKNOWN",
        country: best.country,
        currency: best.currency,
        marketCap: 0,
        coverageMode: "PUBLIC_EQUITY",
        isPubliclyTraded: true,
        resolvedTicker: best.symbol,
        marketDataSymbol: best.rawSymbol,
      },
    };
  }

  return {
    provider: "GENERAL_COMPANY_RESOLVER",
    warnings: [
      `No reliable public stock ticker was found for "${query}". EquityLens continued in general company research mode.`,
    ],
    company: createGeneralCompanyProfile(query),
  };
}

async function collectTickerCandidates(query: string) {
  const results = await Promise.allSettled([
    getAlphaVantageCandidate(query),
    searchYahooCompanySymbol(query),
    searchFinnhubCompanySymbol(query),
    discoverPublicTicker(query),
  ]);

  return results
    .flatMap((result) => {
      if (result.status !== "fulfilled") return [];
      return result.value ? [result.value] : [];
    })
    .filter(Boolean);
}

async function getAlphaVantageCandidate(
  query: string
): Promise<TickerCandidate | null> {
  try {
    const result = await searchCompanySymbol(query);
    const bestMatch = result?.[0];

    if (!bestMatch) return null;

    return {
      symbol: bestMatch.company.symbol,
      rawSymbol: bestMatch.company.symbol,
      name: bestMatch.company.name,
      exchange: bestMatch.company.exchange || "UNKNOWN",
      country: bestMatch.company.country || "UNKNOWN",
      currency: bestMatch.company.currency || "USD",
      provider: "ALPHA_VANTAGE_SYMBOL_SEARCH",
      matchScore: bestMatch.matchScore ?? 0.7,
    };
  } catch (error) {
    console.warn("Alpha Vantage resolver failed:", error);
    return null;
  }
}

function rankTickerCandidates(
  query: string,
  candidates: TickerCandidate[]
): ScoredCandidate[] {
  const deduped = dedupeCandidates(candidates);

  return deduped
    .map((candidate) => scoreTickerCandidate(query, candidate, candidates))
    .sort((a, b) => b.finalScore - a.finalScore);
}

function scoreTickerCandidate(
  query: string,
  candidate: TickerCandidate,
  allCandidates: TickerCandidate[]
): ScoredCandidate {
  const reasons: string[] = [];

  let score = 0;

  const providerScore = getProviderScore(candidate.provider);
  score += providerScore;
  reasons.push(`provider:${providerScore}`);

  const matchScore = Math.round((candidate.matchScore || 0) * 45);
  score += matchScore;
  reasons.push(`match:${matchScore}`);

  const sameSymbolCount = allCandidates.filter(
    (item) =>
      normalizeSymbol(item.symbol) === normalizeSymbol(candidate.symbol) ||
      normalizeSymbol(item.rawSymbol) === normalizeSymbol(candidate.rawSymbol)
  ).length;

  if (sameSymbolCount > 1) {
    const boost = Math.min(20, sameSymbolCount * 8);
    score += boost;
    reasons.push(`cross-source:${boost}`);
  }

  if (candidate.exchange && candidate.exchange !== "UNKNOWN") {
    score += 8;
    reasons.push("known-exchange:+8");
  }

  if (candidate.country && candidate.country !== "UNKNOWN") {
    score += 5;
    reasons.push("known-country:+5");
  }

  if (isSuspiciousPrivateCandidate(candidate)) {
    score -= 35;
    reasons.push("private-name-penalty:-35");
  }

  if (isWeakSymbol(candidate.symbol)) {
    score -= 20;
    reasons.push("weak-symbol-penalty:-20");
  }

  if (hasVeryWeakNameMatch(query, candidate.name)) {
    score -= 25;
    reasons.push("weak-name-match:-25");
  }

  return {
    ...candidate,
    finalScore: Math.max(0, Math.min(100, score)),
    reasons,
  };
}

function getProviderScore(provider: TickerResolverProvider) {
  switch (provider) {
    case "YAHOO_FINANCE_SEARCH":
      return 28;
    case "PUBLIC_TICKER_DISCOVERY":
      return 26;
    case "ALPHA_VANTAGE_SYMBOL_SEARCH":
      return 24;
    case "FINNHUB_SYMBOL_SEARCH":
      return 20;
    case "LOCAL_RESOLVER":
      return 30;
    default:
      return 15;
  }
}

function dedupeCandidates(candidates: TickerCandidate[]) {
  const map = new Map<string, TickerCandidate>();

  for (const candidate of candidates) {
    const key = `${normalizeSymbol(candidate.symbol)}:${candidate.exchange}`;

    const existing = map.get(key);

    if (!existing || candidate.matchScore > existing.matchScore) {
      map.set(key, candidate);
    }
  }

  return Array.from(map.values());
}

function isSuspiciousPrivateCandidate(candidate: TickerCandidate) {
  const name = candidate.name.toLowerCase();

  return (
    name.includes("pvt ltd") ||
    name.includes("private limited") ||
    name.includes("pvt. ltd") ||
    name.includes("unlisted")
  );
}

function isWeakSymbol(symbol: string) {
  const upper = symbol.toUpperCase();

  const badSymbols = new Set([
    "IPO",
    "ETF",
    "NSE",
    "BSE",
    "USD",
    "INR",
    "CEO",
    "CFO",
    "EPS",
    "PE",
    "NA",
    "N/A",
  ]);

  if (badSymbols.has(upper)) return true;
  if (upper.length < 2) return true;
  if (upper.length > 20) return true;

  return false;
}

function hasVeryWeakNameMatch(query: string, companyName: string) {
  const q = normalizeText(query);
  const n = normalizeText(companyName);

  if (!q || !n) return true;

  if (n.includes(q)) return false;

  const queryTokens = q.split(" ").filter(Boolean);
  const nameTokens = n.split(" ").filter(Boolean);

  if (!queryTokens.length) return true;

  const matched = queryTokens.filter((token) =>
    nameTokens.some((nameToken) => nameToken.startsWith(token))
  );

  return matched.length / queryTokens.length < 0.45;
}

function buildPublicResolverWarnings(query: string, candidate: ScoredCandidate) {
  const warnings: string[] = [];

  if (candidate.provider !== "ALPHA_VANTAGE_SYMBOL_SEARCH") {
    warnings.push(
      `Public ticker was discovered through ${formatProviderName(
        candidate.provider
      )} because primary symbol search did not confidently resolve "${query}".`
    );
  }

  if (candidate.finalScore < 70) {
    warnings.push(
      `Ticker resolution confidence is moderate. EquityLens selected ${candidate.symbol} based on available resolver evidence.`
    );
  }

  return warnings;
}

function formatProviderName(provider: TickerResolverProvider) {
  if (provider === "YAHOO_FINANCE_SEARCH") return "Yahoo Finance search";
  if (provider === "FINNHUB_SYMBOL_SEARCH") return "Finnhub symbol search";
  if (provider === "PUBLIC_TICKER_DISCOVERY") return "general web ticker discovery";
  if (provider === "ALPHA_VANTAGE_SYMBOL_SEARCH") return "Alpha Vantage symbol search";
  return provider;
}

function createGeneralCompanyProfile(query: string): CompanyProfile {
  return {
    symbol: "N/A",
    name: toTitleCase(query),
    exchange: "PRIVATE / UNLISTED / GENERAL COMPANY",
    sector: "UNKNOWN",
    industry: "UNKNOWN",
    country: "UNKNOWN",
    currency: "N/A",
    marketCap: null,
    coverageMode: "GENERAL_COMPANY",
    isPubliclyTraded: false,
    resolvedTicker: null,
  };
}

function cleanCompanyInput(value: string) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/^please\s+/i, "")
    .replace(/^can you\s+/i, "")
    .replace(/^could you\s+/i, "")
    .replace(/^analyze\s+/i, "")
    .replace(/^analyse\s+/i, "")
    .replace(/^research\s+/i, "")
    .replace(/^evaluate\s+/i, "")
    .replace(/^should i invest in\s+/i, "")
    .replace(/^is\s+/i, "")
    .replace(/\s+a good investment\??$/i, "")
    .replace(/\s+a good stock\??$/i, "")
    .replace(/\s+a good long[\s-]?term stock\??$/i, "")
    .replace(/\s+fundamentals\??$/i, "")
    .replace(/\s+financials\??$/i, "")
    .replace(/\?+$/g, "")
    .trim();
}

function normalizeSymbol(value: string) {
  return value.toUpperCase().replace(/\.(NS|BO)$/i, "").trim();
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/&amp;/g, "&")
    .replace(/[^a-z0-9\s.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toTitleCase(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}