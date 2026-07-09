import { CompanyProfile } from "@/lib/types/research";
import { searchCompanySymbol } from "@/lib/services/symbol-search";

type CompanyResolutionSource =
  | "LOCAL_RESOLVER"
  | "ALPHA_VANTAGE_SYMBOL_SEARCH"
  | "USER_INPUT_FALLBACK";

export type CompanyResolutionResult = {
  company: CompanyProfile;
  source: CompanyResolutionSource;
  warning?: string;
};

const LOCAL_COMPANIES: Record<string, CompanyProfile> = {
  apple: {
    symbol: "AAPL",
    name: "Apple Inc.",
    exchange: "NASDAQ",
    sector: "Technology",
    industry: "Consumer Electronics",
    country: "USA",
    currency: "USD",
    marketCap: 3000000000000,
  },

  aapl: {
    symbol: "AAPL",
    name: "Apple Inc.",
    exchange: "NASDAQ",
    sector: "Technology",
    industry: "Consumer Electronics",
    country: "USA",
    currency: "USD",
    marketCap: 3000000000000,
  },

  tesla: {
    symbol: "TSLA",
    name: "Tesla Inc.",
    exchange: "NASDAQ",
    sector: "Consumer Cyclical",
    industry: "Auto Manufacturers",
    country: "USA",
    currency: "USD",
    marketCap: 750000000000,
  },

  tsla: {
    symbol: "TSLA",
    name: "Tesla Inc.",
    exchange: "NASDAQ",
    sector: "Consumer Cyclical",
    industry: "Auto Manufacturers",
    country: "USA",
    currency: "USD",
    marketCap: 750000000000,
  },

  nvidia: {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    exchange: "NASDAQ",
    sector: "Technology",
    industry: "Semiconductors",
    country: "USA",
    currency: "USD",
    marketCap: 2800000000000,
  },

  nvda: {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    exchange: "NASDAQ",
    sector: "Technology",
    industry: "Semiconductors",
    country: "USA",
    currency: "USD",
    marketCap: 2800000000000,
  },

  microsoft: {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    exchange: "NASDAQ",
    sector: "Technology",
    industry: "Software Infrastructure",
    country: "USA",
    currency: "USD",
  },

  msft: {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    exchange: "NASDAQ",
    sector: "Technology",
    industry: "Software Infrastructure",
    country: "USA",
    currency: "USD",
  },

  amazon: {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    exchange: "NASDAQ",
    sector: "Consumer Cyclical",
    industry: "Internet Retail",
    country: "USA",
    currency: "USD",
  },

  amzn: {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    exchange: "NASDAQ",
    sector: "Consumer Cyclical",
    industry: "Internet Retail",
    country: "USA",
    currency: "USD",
  },

  meta: {
    symbol: "META",
    name: "Meta Platforms Inc.",
    exchange: "NASDAQ",
    sector: "Communication Services",
    industry: "Internet Content & Information",
    country: "USA",
    currency: "USD",
  },

  netflix: {
    symbol: "NFLX",
    name: "Netflix Inc.",
    exchange: "NASDAQ",
    sector: "Communication Services",
    industry: "Entertainment",
    country: "USA",
    currency: "USD",
  },
};

function buildFallbackCompany(companyInput: string): CompanyProfile {
  const input = companyInput.trim();

  return {
    symbol: input.toUpperCase(),
    name: input,
    exchange: "UNKNOWN",
    sector: "UNKNOWN",
    industry: "UNKNOWN",
    country: "UNKNOWN",
    currency: "USD",
  };
}

export async function resolveCompany(
  companyInput: string
): Promise<CompanyResolutionResult> {
  const key = companyInput.trim().toLowerCase();

  const localCompany = LOCAL_COMPANIES[key];

  if (localCompany) {
    return {
      company: localCompany,
      source: "LOCAL_RESOLVER",
    };
  }

  try {
    const matches = await searchCompanySymbol(companyInput);
    const bestMatch = matches[0];

    if (!bestMatch) {
      throw new Error("No matching company found.");
    }

    return {
      company: bestMatch.company,
      source: "ALPHA_VANTAGE_SYMBOL_SEARCH",
    };
  } catch (error) {
    return {
      company: buildFallbackCompany(companyInput),
      source: "USER_INPUT_FALLBACK",
      warning:
        error instanceof Error
          ? `Using user input as ticker because symbol search failed: ${error.message}`
          : "Using user input as ticker because symbol search failed.",
    };
  }
}