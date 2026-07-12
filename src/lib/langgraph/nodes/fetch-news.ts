import { ResearchState } from "@/lib/langgraph/state";
import { fetchCompanyNews } from "@/lib/services/news-data";
import { fetchGeneralCompanyResearch } from "@/lib/services/general-company-research";

type ResearchStateType = typeof ResearchState.State;

export async function fetchNewsNode(
  state: ResearchStateType
): Promise<Partial<ResearchStateType>> {
  if (!state.company) {
    throw new Error("Company must be resolved before fetching news.");
  }

  if (state.company.coverageMode === "GENERAL_COMPANY") {
    const news = await fetchGeneralCompanyResearch(state.company.name);
    const usable = hasUsableResearchSignals(news);

    return {
      news,
      metadata: {
        agentVersion: "1.0.0",
        newsDataSource: usable ? "GENERAL_WEB_RESEARCH" : "NOT_AVAILABLE",
        warnings: usable ? [] : ["No live general-company research provider returned usable evidence."],
        trace: [
          {
            step: "fetch_news",
            status: usable ? "SUCCESS" : "FALLBACK",
            provider: usable ? "GENERAL_WEB_RESEARCH" : "NOT_AVAILABLE",
            message: `Fetched general company research signals for ${state.company.name}.`,
            timestamp: new Date().toISOString(),
          },
        ],
      },
    };
  }

  const isIndianListedCompany =
    state.company.coverageMode === "PUBLIC_EQUITY" &&
    ["NSE", "BSE"].includes(state.company.exchange || "");

  if (isIndianListedCompany) {
    const news = await fetchGeneralCompanyResearch(state.company.name || "");
    const usable = hasUsableResearchSignals(news);

    return {
      news,
      metadata: {
        agentVersion: "1.0.0",
        newsDataSource: usable ? "GENERAL_WEB_RESEARCH" : "NOT_AVAILABLE",
        warnings: usable ? [] : ["No live company-news provider returned usable evidence."],
        trace: [
          {
            step: "fetch_news",
            status: usable ? "SUCCESS" : "FALLBACK",
            provider: usable ? "GENERAL_WEB_RESEARCH" : "NOT_AVAILABLE",
            message: `Fetched general market and company research signals for ${state.company.name}.`,
            timestamp: new Date().toISOString(),
          },
        ],
      },
    };
  }

  const result = await fetchCompanyNews(state.company);

  if (result.source !== "FINNHUB") {
    try {
      const webNews = await fetchGeneralCompanyResearch(state.company.name || "");
      const isUnavailable =
        webNews.length === 1 &&
        (webNews[0].headline.includes("unavailable") ||
          webNews[0].headline.includes("General company research mode"));

      if (webNews.length > 0 && !isUnavailable) {
        return {
          news: webNews,
          metadata: {
            agentVersion: "1.0.0",
            newsDataSource: "GENERAL_WEB_RESEARCH",
            warnings: [
              `Finnhub returned no sufficiently relevant articles for ${state.company.symbol}, so EquityLens used general web research instead.`,
            ],
            trace: [
              {
                step: "fetch_news",
                status: "SUCCESS",
                provider: "GENERAL_WEB_RESEARCH",
                message: `Fetched general company research signals for ${state.company.name}.`,
                timestamp: new Date().toISOString(),
              },
            ],
          },
        };
      }
    } catch (error) {
      console.warn("General company research news fallback failed:", error);
    }
  }

  return {
    status: "FETCHING_NEWS",
    news: result.news,
    metadata: {
      agentVersion: "1.0.0",
      newsDataSource: result.source,
      warnings: result.warnings,
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

function hasUsableResearchSignals(news: Array<{ source?: string; headline?: string }>) {
  return news.some((item) => item.source !== "EquityLens" && !/unavailable|research mode/i.test(item.headline ?? ""));
}
