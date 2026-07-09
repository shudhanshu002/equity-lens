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
    metadata: {
      agentVersion: "1.0.0",
      newsDataSource: result.source,
      warnings: result.warning ? [result.warning] : [],
      trace: [
        {
          step: "fetch_news",
          status: result.source === "FINNHUB" ? "SUCCESS" : "FALLBACK",
          provider: result.source,
          message:
            result.source === "FINNHUB"
              ? `Fetched recent company news for ${state.company.symbol} from Finnhub.`
              : `Used mock news for ${state.company.symbol}.`,
          timestamp: new Date().toISOString(),
        },
      ],
    },
  };
}