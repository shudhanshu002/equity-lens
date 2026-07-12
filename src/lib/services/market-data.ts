import {
  CompanyProfile,
  FinancialSnapshot,
} from "@/lib/types/research";
import { fetchAlphaVantageOverview } from "@/lib/services/alpha-vantage";
import {
  fetchMockFinancials,
  hasMockFinancials,
} from "@/lib/services/mock-market-data";
import { fetchSecFinancials } from "@/lib/services/sec-filings";

type MarketDataResult = {
  companyPatch?: Partial<CompanyProfile>;
  financials: FinancialSnapshot;
  source: "ALPHA_VANTAGE" | "SEC_EDGAR" | "MOCK";
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

    // Important:
    // Do not convert missing FCF data into false.
    // false means "verified negative", undefined means "unknown".
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

function buildMissingDataWarning(financials: FinancialSnapshot): string | undefined {
  const missingFields: string[] = [];

  if (financials.debtToEquity === undefined) missingFields.push("debtToEquity");
  if (financials.currentRatio === undefined) missingFields.push("currentRatio");
  if (financials.freeCashFlowPositive === undefined) {
    missingFields.push("freeCashFlowPositive");
  }

  if (missingFields.length === 0) return undefined;

  return `Some financial fields were unavailable from the selected data source: ${missingFields.join(
    ", "
  )}. The agent treats these as unknown, not negative.`;
}

export async function fetchCompanyFinancials(
  company: CompanyProfile
): Promise<MarketDataResult> {
  const fallbackFinancials = await fetchMockFinancials(company.symbol);

  try {
    const overview = await fetchAlphaVantageOverview(company.symbol);
    const financials = mergeFinancials(overview.financials, fallbackFinancials);

    const missingDataWarning = buildMissingDataWarning(financials);

    return {
      companyPatch: overview.company,
      financials,
      source: "ALPHA_VANTAGE",
      warning:
        missingDataWarning ??
        (!hasMockFinancials(company.symbol)
          ? undefined
          : "Some unavailable fields were supplemented with curated demo fallback data."),
    };
  } catch (error) {
    try {
      const sec = await fetchSecFinancials(company.symbol);
      return {
        financials: sec.financials,
        source: "SEC_EDGAR",
        warning: `Alpha Vantage was unavailable, so filing-backed SEC Company Facts were used. Valuation ratios may remain unavailable.`,
      };
    } catch (secError) {
    return {
      financials: fallbackFinancials,
      source: "MOCK",
      warning:
        error instanceof Error
          ? `Using mock financial data because Alpha Vantage failed (${error.message}) and SEC filing data was unavailable (${secError instanceof Error ? secError.message : "unknown error"}).`
          : "Using mock financial data because real providers failed.",
    };
    }
  }
}
