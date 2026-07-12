import axios from "axios";
import {
  calculateCompanyMatchScore,
  type TickerCandidate,
} from "@/lib/services/resolver-types";

type SerperOrganicResult = {
  title?: string;
  snippet?: string;
  link?: string;
  source?: string;
};

type SerperSearchResponse = {
  organic?: SerperOrganicResult[];
  news?: SerperOrganicResult[];
};

const EXCHANGE_PATTERNS = [
  {
    exchange: "NSE",
    country: "India",
    currency: "INR",
    patterns: [
      /\bNSE\s*:\s*([A-Z0-9&.-]{2,20})\b/i,
      /\bNSE\s+symbol\s*[:\-]?\s*([A-Z0-9&.-]{2,20})\b/i,
      /\bsymbol\s*[:\-]?\s*([A-Z0-9&.-]{2,20})\b.*\bNSE\b/i,
    ],
  },
  {
    exchange: "BSE",
    country: "India",
    currency: "INR",
    patterns: [
      /\bBSE\s*:\s*([A-Z0-9&.-]{2,20})\b/i,
      /\bBSE\s+symbol\s*[:\-]?\s*([A-Z0-9&.-]{2,20})\b/i,
      /\bscrip\s+code\s*[:\-]?\s*([0-9]{4,8})\b/i,
    ],
  },
  {
    exchange: "NASDAQ",
    country: "USA",
    currency: "USD",
    patterns: [
      /\bNASDAQ\s*:\s*([A-Z]{1,8})\b/i,
      /\bNASDAQ\s+symbol\s*[:\-]?\s*([A-Z]{1,8})\b/i,
    ],
  },
  {
    exchange: "NYSE",
    country: "USA",
    currency: "USD",
    patterns: [
      /\bNYSE\s*:\s*([A-Z]{1,8})\b/i,
      /\bNYSE\s+symbol\s*[:\-]?\s*([A-Z]{1,8})\b/i,
    ],
  },
];

const BAD_SYMBOLS = new Set([
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

export async function discoverPublicTicker(
  companyName: string
): Promise<TickerCandidate | null> {
  const query = companyName.trim();

  if (!query) return null;

  const apiKey = process.env.SERPER_API_KEY;

  if (!apiKey) {
    return null;
  }

  const searchQueries = [
    `${query} stock ticker symbol exchange`,
    `${query} listed company ticker NSE BSE NASDAQ NYSE`,
    `${query} parent company listed stock symbol`,
    `${query} IPO listed stock exchange symbol`,
    `${query} share price NSE BSE ticker`,
  ];

  try {
    const response = await axios.post<any>(
      "https://google.serper.dev/search",
      searchQueries.map((q) => ({ q, num: 6 })),
      {
        headers: {
          "X-API-KEY": apiKey,
          "Content-Type": "application/json",
        },
        timeout: 15_000,
      }
    );

    const responses = Array.isArray(response.data) ? response.data : [response.data];

    let combinedText = "";
    for (const res of responses) {
      const results = res.organic ?? [];
      combinedText += results
        .map((item: any) => `${item.title ?? ""} ${item.snippet ?? ""} ${item.link ?? ""}`)
        .join("\n") + "\n";
    }

    return extractTickerFromText(combinedText, query);
  } catch (error: any) {
    const status = error?.response?.status;

    if (status === 403) {
      throw new Error(
        "Serper rejected the request with 403. Check SERPER_API_KEY in .env.local."
      );
    }

    throw new Error(
      `Serper ticker discovery failed${
        status ? ` with status ${status}` : ""
      }.`
    );
  }
}

function extractTickerFromText(
  text: string,
  companyName: string
): TickerCandidate | null {
  for (const exchangeConfig of EXCHANGE_PATTERNS) {
    for (const pattern of exchangeConfig.patterns) {
      const match = text.match(pattern);

      if (!match?.[1]) continue;

      const symbol = cleanSymbol(match[1]);

      if (!isValidSymbol(symbol)) continue;

      return {
        symbol,
        rawSymbol: symbol,
        name: toTitleCase(companyName),
        exchange: exchangeConfig.exchange,
        country: exchangeConfig.country,
        currency: exchangeConfig.currency,
        provider: "PUBLIC_TICKER_DISCOVERY",
        matchScore: calculateCompanyMatchScore(companyName, symbol, companyName),
      } satisfies TickerCandidate;
    }
  }

  return null;
}

function cleanSymbol(value: string) {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9&.-]/g, "")
    .trim();
}

function isValidSymbol(symbol: string) {
  if (!symbol) return false;
  if (symbol.length < 2) return false;
  if (symbol.length > 20) return false;
  if (BAD_SYMBOLS.has(symbol)) return false;

  return true;
}

function toTitleCase(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => {
      if (word.toLowerCase() === "swiggy") return "Swiggy";
      if (word.toLowerCase() === "boat") return "boAt";
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}