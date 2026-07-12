export type TickerResolverProvider =
  | "LOCAL_RESOLVER"
  | "ALPHA_VANTAGE_SYMBOL_SEARCH"
  | "YAHOO_FINANCE_SEARCH"
  | "FINNHUB_SYMBOL_SEARCH"
  | "PUBLIC_TICKER_DISCOVERY";

export type TickerCandidate = {
  symbol: string;
  rawSymbol: string;
  name: string;
  exchange: string;
  country: string;
  currency: string;
  provider: TickerResolverProvider;
  matchScore: number;
};

export function normalizeTickerSymbol(rawSymbol: string) {
  const upper = rawSymbol.toUpperCase().trim();

  if (upper.endsWith(".NS")) return upper.replace(".NS", "");
  if (upper.endsWith(".BO")) return upper.replace(".BO", "");

  return upper;
}

export function inferExchangeFromSymbol(rawSymbol: string, exchangeText = "") {
  const upper = rawSymbol.toUpperCase();
  const lowerExchange = exchangeText.toLowerCase();

  if (upper.endsWith(".NS") || lowerExchange.includes("nse")) {
    return {
      exchange: "NSE",
      country: "India",
      currency: "INR",
    };
  }

  if (upper.endsWith(".BO") || lowerExchange.includes("bse")) {
    return {
      exchange: "BSE",
      country: "India",
      currency: "INR",
    };
  }

  if (lowerExchange.includes("nasdaq")) {
    return {
      exchange: "NASDAQ",
      country: "USA",
      currency: "USD",
    };
  }

  if (lowerExchange.includes("nyse")) {
    return {
      exchange: "NYSE",
      country: "USA",
      currency: "USD",
    };
  }

  return {
    exchange: exchangeText || "UNKNOWN",
    country: "UNKNOWN",
    currency: "USD",
  };
}

export function calculateCompanyMatchScore(
  query: string,
  symbol: string,
  name: string
) {
  const q = normalizeText(query);
  const s = normalizeText(symbol.replace(/\.(NS|BO)$/i, ""));
  const n = normalizeText(name);

  if (!q) return 0;

  if (q === s) return 1;
  if (q === n) return 1;
  if (n.startsWith(q)) return 0.95;
  if (n.includes(q)) return 0.8;

  const queryTokens = q.split(" ").filter(Boolean);
  const nameTokens = n.split(" ").filter(Boolean);

  if (!queryTokens.length) return 0;

  const matched = queryTokens.filter((token) =>
    nameTokens.some((nameToken) => nameToken.startsWith(token))
  );

  return matched.length / queryTokens.length;
}

export function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/&amp;/g, "&")
    .replace(/[^a-z0-9\s.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}