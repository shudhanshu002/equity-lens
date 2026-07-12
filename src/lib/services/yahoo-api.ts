import axios from "axios";
import type { FinancialSnapshot } from "@/lib/types/research";

export type YahooQuoteSnapshot = {
  symbol: string;
  marketCap?: number | null;
  regularMarketPrice?: number | null;
  regularMarketChangePercent?: number | null;
  currency?: string | null;
  exchange?: string | null;
};

export type YahooFundamentalsSnapshot = {
  financials: FinancialSnapshot;
  marketCap?: number | null;
  currency?: string | null;
};

type YahooQuoteResponse = {
  quoteResponse?: {
    result?: Array<{
      symbol?: string;
      marketCap?: number;
      regularMarketPrice?: number;
      regularMarketChangePercent?: number;
      currency?: string;
      fullExchangeName?: string;
      exchange?: string;
    }>;
  };
};

export async function fetchYahooQuoteSnapshot(
  symbol: string
): Promise<YahooQuoteSnapshot | null> {
  const cleanSymbol = symbol.trim();

  if (!cleanSymbol) return null;

  const response = await axios.get<YahooQuoteResponse>(
    "https://query1.finance.yahoo.com/v7/finance/quote",
    {
      params: {
        symbols: cleanSymbol,
      },
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      timeout: 15_000,
    }
  );

  const quote = response.data.quoteResponse?.result?.[0];

  if (!quote) return null;

  return {
    symbol: quote.symbol ?? cleanSymbol,
    marketCap: quote.marketCap ?? null,
    regularMarketPrice: quote.regularMarketPrice ?? null,
    regularMarketChangePercent:
      quote.regularMarketChangePercent ?? null,
    currency: quote.currency ?? null,
    exchange: quote.fullExchangeName ?? quote.exchange ?? null,
  };
}

export async function fetchYahooFundamentalsSnapshot(
  symbol: string
): Promise<YahooFundamentalsSnapshot | null> {
  const cleanSymbol = symbol.trim();
  if (!cleanSymbol) return null;

  const metricTypes = [
    "quarterlyTotalRevenue",
    "quarterlyNetIncome",
    "quarterlyOperatingIncome",
    "quarterlyStockholdersEquity",
    "quarterlyTotalDebt",
    "quarterlyCurrentAssets",
    "quarterlyCurrentLiabilities",
    "trailingMarketCap",
    "trailingPeRatio",
    "trailingForwardPeRatio",
    "trailingPegRatio",
    "trailingPsRatio",
    "trailingDilutedEPS",
    "trailingFreeCashFlow",
  ];
  const period2 = Math.floor(Date.now() / 1000) + 86_400;
  const period1 = period2 - 3 * 365 * 86_400;
  const response = await axios.get(
    `https://query1.finance.yahoo.com/ws/fundamentals-timeseries/v1/finance/timeseries/${encodeURIComponent(cleanSymbol)}`,
    {
      params: {
        symbol: cleanSymbol,
        type: metricTypes.join(","),
        merge: "false",
        period1,
        period2,
      },
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      timeout: 15_000,
    }
  );

  const results = response.data?.timeseries?.result;
  if (!Array.isArray(results)) return null;

  const metrics = new Map<string, unknown[]>();
  for (const result of results) {
    const type = result?.meta?.type?.[0];
    if (typeof type === "string" && Array.isArray(result[type])) {
      metrics.set(type, result[type]);
    }
  }

  const revenues = values(metrics.get("quarterlyTotalRevenue"));
  const latestRevenue = revenues.at(-1);
  const yearAgoRevenue = revenues.at(-5);
  const netIncome = latest(metrics.get("quarterlyNetIncome"));
  const operatingIncome = latest(metrics.get("quarterlyOperatingIncome"));
  const equity = latest(metrics.get("quarterlyStockholdersEquity"));
  const totalDebt = latest(metrics.get("quarterlyTotalDebt"));
  const currentAssets = latest(metrics.get("quarterlyCurrentAssets"));
  const currentLiabilities = latest(metrics.get("quarterlyCurrentLiabilities"));
  const freeCashFlow = latest(metrics.get("trailingFreeCashFlow"));

  const financials: FinancialSnapshot = {
    revenueGrowthYoY: growthPercent(latestRevenue, yearAgoRevenue),
    profitMargin: ratioPercent(netIncome, latestRevenue),
    operatingMargin: ratioPercent(operatingIncome, latestRevenue),
    returnOnEquity: ratioPercent(netIncome, equity),
    debtToEquity: ratio(totalDebt, equity),
    currentRatio: ratio(currentAssets, currentLiabilities),
    freeCashFlowPositive: positive(freeCashFlow),
    peRatio: latest(metrics.get("trailingPeRatio")),
    forwardPe: latest(metrics.get("trailingForwardPeRatio")),
    pegRatio: latest(metrics.get("trailingPegRatio")),
    priceToSales: latest(metrics.get("trailingPsRatio")),
    eps: latest(metrics.get("trailingDilutedEPS")),
  };

  if (!Object.values(financials).some((value) => value !== undefined)) return null;

  return {
    financials,
    marketCap: latest(metrics.get("trailingMarketCap")) ?? null,
    currency: currencyCode(metrics.get("quarterlyTotalRevenue")),
  };
}

function values(series: unknown[] | undefined) {
  return (series ?? [])
    .map((item) => rawNumber(item))
    .filter((value): value is number => value !== undefined);
}

function latest(series: unknown[] | undefined) {
  return values(series).at(-1);
}

function rawNumber(value: unknown): number | undefined {
  const candidate =
    typeof value === "object" && value !== null && "reportedValue" in value
      ? (value as { reportedValue?: { raw?: unknown } }).reportedValue?.raw
      : typeof value === "object" && value !== null && "raw" in value
        ? (value as { raw?: unknown }).raw
      : value;
  return typeof candidate === "number" && Number.isFinite(candidate)
    ? candidate
    : undefined;
}

function ratio(numerator: number | undefined, denominator: number | undefined) {
  return numerator === undefined || denominator === undefined || denominator === 0
    ? undefined
    : numerator / denominator;
}

function ratioPercent(numerator: number | undefined, denominator: number | undefined) {
  const result = ratio(numerator, denominator);
  return result === undefined ? undefined : result * 100;
}

function growthPercent(current: number | undefined, previous: number | undefined) {
  return current === undefined || previous === undefined || previous === 0
    ? undefined
    : ((current - previous) / Math.abs(previous)) * 100;
}

function positive(value: number | undefined) {
  return value === undefined ? undefined : value > 0;
}

function currencyCode(series: unknown[] | undefined) {
  const item = series?.at(-1);
  return typeof item === "object" && item !== null && "currencyCode" in item
    ? String((item as { currencyCode?: unknown }).currencyCode ?? "") || null
    : null;
}
