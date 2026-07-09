import { ResearchState } from "@/lib/langgraph/state";
import { fetchMockFinancials } from "@/lib/services/mock-market-data";

type ResearchStateType = typeof ResearchState.State;

export async function fetchFinancialsNode(
  state: ResearchStateType
): Promise<Partial<ResearchStateType>> {
  if (!state.company) {
    throw new Error("Company must be resolved before fetching financials.");
  }

  const financials = await fetchMockFinancials(state.company.symbol);

  return {
    status: "FETCHING_FINANCIALS",
    financials,
  };
}