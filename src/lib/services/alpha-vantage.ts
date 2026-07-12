import {
  CompanyProfile,
  FinancialSnapshot,
} from "@/lib/types/research";

type AlphaVantageOverviewResponse = {
  Symbol?: string;
  Name?: string;
  Exchange?: string;
  Currency?: string;
  Country?: string;
  Sector?: string;
  Industry?: string;
  MarketCapitalization?: string;

  QuarterlyRevenueGrowthYOY?: string;
  ProfitMargin?: string;
  OperatingMarginTTM?: string;
  ReturnOnEquityTTM?: string;
  DebtEquityRatio?: string;
  CurrentRatio?: string;
  PERatio?: string;
  ForwardPE?: string;
  PEGRatio?: string;
  PriceToSalesRatioTTM?: string;
  EPS?: string;
  Beta?: string;

  Note?: string;
  Information?: string;
  "Error Message"?: string;
};

export type AlphaVantageOverviewResult = {
  company: Partial<CompanyProfile>;
  financials: FinancialSnapshot;
  source: "ALPHA_VANTAGE";
};

function parseNumber(value?: string): number | undefined {
  if (!value) return undefined;

  const invalidValues = ["None", "null", "-", "N/A", "NaN"];

  if (invalidValues.includes(value)) {
    return undefined;
  }

  const normalized = value.replace(/,/g, "").replace("%", "");
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : undefined;
}

function ratioToPercent(value?: string): number | undefined {
  const parsed = parseNumber(value);

  if (parsed === undefined) return undefined;

  // Alpha Vantage commonly returns ratios as decimals.
  // Example:
  // 0.272 = 27.2%
  // 1.415 = 141.5%
  if (Math.abs(parsed) <= 5) {
    return Number((parsed * 100).toFixed(2));
  }

  return parsed;
}

function validateOverviewResponse(data: AlphaVantageOverviewResponse) {
  if (data.Note) {
    throw new Error(`Alpha Vantage rate limit or note: ${data.Note}`);
  }

  if (data.Information) {
    throw new Error(`Alpha Vantage information: ${data.Information}`);
  }

  if (data["Error Message"]) {
    throw new Error(`Alpha Vantage error: ${data["Error Message"]}`);
  }

  if (!data.Symbol || !data.Name) {
    throw new Error("Alpha Vantage returned incomplete company overview data.");
  }
}

export async function fetchAlphaVantageOverview(
  symbol: string
): Promise<AlphaVantageOverviewResult> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

  if (!apiKey) {
    throw new Error("Missing ALPHA_VANTAGE_API_KEY.");
  }

  const url = new URL("https://www.alphavantage.co/query");

  url.searchParams.set("function", "OVERVIEW");
  url.searchParams.set("symbol", symbol);
  url.searchParams.set("apikey", apiKey);

  const response = await fetch(url.toString(), {
    method: "GET",
    next: {
      // The standard Alpha Vantage plan is very limited. Fundamentals do not
      // need minute-level refreshes, so reuse successful responses for a day.
      revalidate: 60 * 60 * 24,
    },
  });

  if (!response.ok) {
    throw new Error(`Alpha Vantage request failed with status ${response.status}.`);
  }

  const data = (await response.json()) as AlphaVantageOverviewResponse;

  validateOverviewResponse(data);

  return {
    source: "ALPHA_VANTAGE",
    company: {
      symbol: data.Symbol,
      name: data.Name,
      exchange: data.Exchange,
      sector: data.Sector,
      industry: data.Industry,
      country: data.Country,
      currency: data.Currency,
      marketCap: parseNumber(data.MarketCapitalization),
    },
    financials: {
      revenueGrowthYoY: ratioToPercent(data.QuarterlyRevenueGrowthYOY),
      profitMargin: ratioToPercent(data.ProfitMargin),
      operatingMargin: ratioToPercent(data.OperatingMarginTTM),
      returnOnEquity: ratioToPercent(data.ReturnOnEquityTTM),
      debtToEquity: parseNumber(data.DebtEquityRatio),
      currentRatio: parseNumber(data.CurrentRatio),
      freeCashFlowPositive: undefined,
      peRatio: parseNumber(data.PERatio),
      forwardPe: parseNumber(data.ForwardPE),
      pegRatio: parseNumber(data.PEGRatio),
      priceToSales: parseNumber(data.PriceToSalesRatioTTM),
      eps: parseNumber(data.EPS),
      beta: parseNumber(data.Beta),
    },
  };
}
