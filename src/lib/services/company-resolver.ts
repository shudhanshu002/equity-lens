import { CompanyProfile } from "@/lib/types/research";

const MOCK_COMPANIES: Record<string, CompanyProfile> = {
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
};

export async function resolveCompany(companyInput: string): Promise<CompanyProfile> {
  const key = companyInput.trim().toLowerCase();

  const company = MOCK_COMPANIES[key];

  if (!company) {
    return {
      symbol: companyInput.trim().toUpperCase(),
      name: companyInput.trim(),
      exchange: "UNKNOWN",
      sector: "UNKNOWN",
      industry: "UNKNOWN",
      country: "UNKNOWN",
      currency: "USD",
    };
  }

  return company;
}