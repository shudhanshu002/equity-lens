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
  };
}