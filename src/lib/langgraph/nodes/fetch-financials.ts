import { ResearchState } from "@/lib/langgraph/state";
import { fetchCompanyFinancials } from "@/lib/services/market-data";

type ResearchStateType = typeof ResearchState.State;

export async function fetchFinancialsNode(
  state: ResearchStateType
): Promise<Partial<ResearchStateType>> {
  if (!state.company) {
    throw new Error("Company must be resolved before fetching financials.");
  }

  const result = await fetchCompanyFinancials(state.company);

  return {
    status: "FETCHING_FINANCIALS",
    company: {
      ...state.company,
      ...result.companyPatch,
    },
    financials: result.financials,
    metadata: {
      agentVersion: "1.0.0",
      financialDataSource: result.source,
      warnings: result.warning ? [result.warning] : [],
      trace: [
        {
          step: "fetch_financials",
          status: result.source === "ALPHA_VANTAGE" ? "SUCCESS" : "FALLBACK",
          provider: result.source,
          message:
            result.source === "ALPHA_VANTAGE"
              ? `Fetched financial metrics for ${state.company.symbol} from Alpha Vantage.`
              : `Used mock financial data for ${state.company.symbol}.`,
          timestamp: new Date().toISOString(),
        },
      ],
    },
  };
}