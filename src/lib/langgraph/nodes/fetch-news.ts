import { ResearchState } from "@/lib/langgraph/state";
import { fetchMockNews } from "@/lib/services/mock-market-data";

type ResearchStateType = typeof ResearchState.State;

export async function fetchNewsNode(
  state: ResearchStateType
): Promise<Partial<ResearchStateType>> {
  if (!state.company) {
    throw new Error("Company must be resolved before fetching news.");
  }

  const news = await fetchMockNews(state.company.symbol);

  return {
    status: "FETCHING_NEWS",
    news,
  };
}