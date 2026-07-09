import { ResearchState } from "@/lib/langgraph/state";
import { fetchCompanyNews } from "@/lib/services/news-data";

type ResearchStateType = typeof ResearchState.State;

export async function fetchNewsNode(
  state: ResearchStateType
): Promise<Partial<ResearchStateType>> {
  if (!state.company) {
    throw new Error("Company must be resolved before fetching news.");
  }

  const result = await fetchCompanyNews(state.company);

  return {
    status: "FETCHING_NEWS",
    news: result.news,
  };
}