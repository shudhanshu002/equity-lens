import {
  CompanyProfile,
  FinancialSnapshot,
} from "@/lib/types/research";
import { fetchAlphaVantageOverview } from "@/lib/services/alpha-vantage";
import { fetchMockFinancials } from "@/lib/services/mock-market-data";

type MarketDataResult = {
  companyPatch?: Partial<CompanyProfile>;
  financials: FinancialSnapshot;
  source: "ALPHA_VANTAGE" | "MOCK";
  warning?: string;
};

function mergeFinancials(
  real: FinancialSnapshot,
  fallback: FinancialSnapshot
): FinancialSnapshot {
  return {
    revenueGrowthYoY: real.revenueGrowthYoY ?? fallback.revenueGrowthYoY,
    profitMargin: real.profitMargin ?? fallback.profitMargin,
    operatingMargin: real.operatingMargin ?? fallback.operatingMargin,
    returnOnEquity: real.returnOnEquity ?? fallback.returnOnEquity,
    debtToEquity: real.debtToEquity ?? fallback.debtToEquity,
    currentRatio: real.currentRatio ?? fallback.currentRatio,
    freeCashFlowPositive:
      real.freeCashFlowPositive ?? fallback.freeCashFlowPositive,
    peRatio: real.peRatio ?? fallback.peRatio,
    forwardPe: real.forwardPe ?? fallback.forwardPe,
    pegRatio: real.pegRatio ?? fallback.pegRatio,
    priceToSales: real.priceToSales ?? fallback.priceToSales,
    eps: real.eps ?? fallback.eps,
    beta: real.beta ?? fallback.beta,
  };
}

export async function fetchCompanyFinancials(
  company: CompanyProfile
): Promise<MarketDataResult> {
  const fallbackFinancials = await fetchMockFinancials(company.symbol);

  try {
    const overview = await fetchAlphaVantageOverview(company.symbol);

    return {
      companyPatch: overview.company,
      financials: mergeFinancials(overview.financials, fallbackFinancials),
      source: "ALPHA_VANTAGE",
    };
  } catch (error) {
    return {
      financials: fallbackFinancials,
      source: "MOCK",
      warning:
        error instanceof Error
          ? `Using mock financial data because real API failed: ${error.message}`
          : "Using mock financial data because real API failed.",
    };
  }
}