import { CompanyProfile } from "@/lib/types/research";

type AlphaVantageSearchMatch = {
  "1. symbol"?: string;
  "2. name"?: string;
  "3. type"?: string;
  "4. region"?: string;
  "5. marketOpen"?: string;
  "6. marketClose"?: string;
  "7. timezone"?: string;
  "8. currency"?: string;
  "9. matchScore"?: string;
};

type AlphaVantageSearchResponse = {
  bestMatches?: AlphaVantageSearchMatch[];
  Note?: string;
  Information?: string;
  "Error Message"?: string;
};

export type SymbolSearchResult = {
  company: CompanyProfile;
  matchScore: number;
};

function parseMatchScore(value?: string): number {
  const score = Number(value);

  return Number.isFinite(score) ? score : 0;
}

function normalizeExchange(region?: string): string {
  if (!region) return "UNKNOWN";

  if (region.toLowerCase().includes("united states")) {
    return "US";
  }

  if (region.toLowerCase().includes("india")) {
    return "INDIA";
  }

  return region.toUpperCase();
}

function validateSearchResponse(data: AlphaVantageSearchResponse): boolean {
  if (data.Note) {
    console.warn(`Alpha Vantage rate limit or note: ${data.Note}`);
    return false;
  }

  if (data.Information) {
    console.warn(`Alpha Vantage information: ${data.Information}`);
    return false;
  }

  if (data["Error Message"]) {
    console.warn(`Alpha Vantage error: ${data["Error Message"]}`);
    return false;
  }

  if (!Array.isArray(data.bestMatches)) {
    console.warn("Alpha Vantage returned invalid symbol search response.");
    return false;
  }

  return true;
}

export async function searchCompanySymbol(
  keywords: string
): Promise<SymbolSearchResult[]> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

  if (!apiKey) {
    throw new Error("Missing ALPHA_VANTAGE_API_KEY.");
  }

  const url = new URL("https://www.alphavantage.co/query");

  url.searchParams.set("function", "SYMBOL_SEARCH");
  url.searchParams.set("keywords", keywords);
  url.searchParams.set("apikey", apiKey);

  const response = await fetch(url.toString(), {
    method: "GET",
    next: {
      revalidate: 60 * 60 * 24,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Alpha Vantage symbol search failed with status ${response.status}.`
    );
  }

  const data = (await response.json()) as AlphaVantageSearchResponse;

  const isValid = validateSearchResponse(data);
  if (!isValid) return [];

  return data.bestMatches!
    .filter((item) => {
      const symbol = item["1. symbol"];
      const name = item["2. name"];
      const type = item["3. type"];

      return symbol && name && (!type || type.toLowerCase() === "equity");
    })
    .map((item) => ({
      company: {
        symbol: item["1. symbol"]!,
        name: item["2. name"]!,
        exchange: normalizeExchange(item["4. region"]),
        sector: "UNKNOWN",
        industry: "UNKNOWN",
        country: item["4. region"] || "UNKNOWN",
        currency: item["8. currency"] || "USD",
      },
      matchScore: parseMatchScore(item["9. matchScore"]),
    }))
    .sort((a, b) => b.matchScore - a.matchScore);
}