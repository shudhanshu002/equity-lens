import axios from "axios";
import {
  calculateCompanyMatchScore,
  inferExchangeFromSymbol,
  normalizeTickerSymbol,
  type TickerCandidate,
} from "@/lib/services/resolver-types";

type YahooQuote = {
  symbol?: string;
  shortname?: string;
  longname?: string;
  quoteType?: string;
  exchDisp?: string;
  exchange?: string;
  typeDisp?: string;
};

type YahooSearchResponse = {
  quotes?: YahooQuote[];
};

export async function searchYahooCompanySymbol(
  query: string
): Promise<TickerCandidate | null> {
  const cleanedQuery = query.trim();

  if (!cleanedQuery) return null;

  const response = await axios.get<YahooSearchResponse>(
    "https://query2.finance.yahoo.com/v1/finance/search",
    {
      params: {
        q: cleanedQuery,
        quotesCount: 10,
        newsCount: 0,
      },
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      timeout: 15_000,
    }
  );

  const candidates = (response.data.quotes ?? [])
    .map((quote) => toCandidate(quote, cleanedQuery))
    .filter((item): item is TickerCandidate => Boolean(item))
    .filter((item) => item.matchScore >= 0.45)
    .sort((a, b) => b.matchScore - a.matchScore);

  return candidates[0] ?? null;
}

function toCandidate(
  quote: YahooQuote,
  query: string
): TickerCandidate | null {
  const rawSymbol = quote.symbol?.trim();
  const name = quote.longname?.trim() || quote.shortname?.trim();

  if (!rawSymbol || !name) return null;

  const quoteType = quote.quoteType?.toLowerCase() || "";
  const typeDisp = quote.typeDisp?.toLowerCase() || "";

  const isEquity =
    quoteType === "equity" ||
    typeDisp.includes("equity") ||
    typeDisp.includes("stock");

  if (!isEquity) return null;

  const exchangeInfo = inferExchangeFromSymbol(
    rawSymbol,
    `${quote.exchDisp ?? ""} ${quote.exchange ?? ""}`
  );

  return {
    symbol: normalizeTickerSymbol(rawSymbol),
    rawSymbol,
    name,
    exchange: exchangeInfo.exchange,
    country: exchangeInfo.country,
    currency: exchangeInfo.currency,
    provider: "YAHOO_FINANCE_SEARCH",
    matchScore: calculateCompanyMatchScore(query, rawSymbol, name),
  };
}