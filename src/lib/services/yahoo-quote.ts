import axios from "axios";

export type YahooQuoteSnapshot = {
  symbol: string;
  marketCap?: number | null;
  regularMarketPrice?: number | null;
  regularMarketChangePercent?: number | null;
  currency?: string | null;
  exchange?: string | null;
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
