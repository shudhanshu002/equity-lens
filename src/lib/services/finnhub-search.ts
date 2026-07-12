import axios from "axios";
import {
  calculateCompanyMatchScore,
  inferExchangeFromSymbol,
  normalizeTickerSymbol,
  type TickerCandidate,
} from "@/lib/services/resolver-types";

type FinnhubSearchItem = {
  description?: string;
  displaySymbol?: string;
  symbol?: string;
  type?: string;
};

type FinnhubSearchResponse = {
  count?: number;
  result?: FinnhubSearchItem[];
};

export async function searchFinnhubCompanySymbol(
  query: string
): Promise<TickerCandidate | null> {
  const apiKey = process.env.FINNHUB_API_KEY;

  if (!apiKey) return null;

  const cleanedQuery = query.trim();

  if (!cleanedQuery) return null;

  const response = await axios.get<FinnhubSearchResponse>(
    "https://finnhub.io/api/v1/search",
    {
      params: {
        q: cleanedQuery,
        token: apiKey,
      },
      timeout: 15_000,
    }
  );

  const candidates = (response.data.result ?? [])
    .map((item) => toCandidate(item, cleanedQuery))
    .filter((item): item is TickerCandidate => Boolean(item))
    .filter((item) => item.matchScore >= 0.45)
    .sort((a, b) => b.matchScore - a.matchScore);

  return candidates[0] ?? null;
}

function toCandidate(
  item: FinnhubSearchItem,
  query: string
): TickerCandidate | null {
  const rawSymbol = item.displaySymbol?.trim() || item.symbol?.trim();
  const name = item.description?.trim();

  if (!rawSymbol || !name) return null;

  const type = item.type?.toLowerCase() || "";

  if (type && !type.includes("common") && !type.includes("stock")) {
    return null;
  }

  const exchangeInfo = inferExchangeFromSymbol(rawSymbol);

  return {
    symbol: normalizeTickerSymbol(rawSymbol),
    rawSymbol,
    name,
    exchange: exchangeInfo.exchange,
    country: exchangeInfo.country,
    currency: exchangeInfo.currency,
    provider: "FINNHUB_SYMBOL_SEARCH",
    matchScore: calculateCompanyMatchScore(query, rawSymbol, name),
  };
}