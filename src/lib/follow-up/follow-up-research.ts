import { fetchFinnhubCompanyNews } from "@/lib/services/finnhub-news";
import { fetchGeneralCompanyResearch } from "@/lib/services/general-company-research";
import type { CompanyProfile } from "@/lib/types/research";
import type { FollowUpIntent } from "@/lib/follow-up/follow-up-intent";

export type FollowUpSource = {
  title: string;
  summary: string;
  source: string;
  url?: string;
  publishedAt?: string;
  sentiment?: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
};

export async function fetchFollowUpResearch(params: {
  company: CompanyProfile;
  intent: FollowUpIntent;
  question: string;
}): Promise<FollowUpSource[]> {
  const { company, intent, question } = params;

  const canUseFinnhub =
    company.coverageMode === "PUBLIC_EQUITY" &&
    !["NSE", "BSE"].includes(company.exchange) &&
    company.symbol !== "N/A";

  if (intent === "LATEST_NEWS" && canUseFinnhub) {
    try {
      const news = await fetchFinnhubCompanyNews(company.symbol);

      if (news.length > 0) {
        return news.slice(0, 8).map((item) => ({
          title: item.headline,
          summary: item.summary,
          source: item.source,
          url: item.url,
          publishedAt: item.publishedAt,
          sentiment: item.sentiment,
        }));
      }
    } catch {
      // fall through to general web research
    }
  }

  const focusedQuery = buildFocusedCompanyQuery(company, intent, question);
  const webSignals = await fetchGeneralCompanyResearch(focusedQuery, {
    rawQuery: true,
    num: 8,
  });

  return webSignals.map((item) => ({
    title: item.headline,
    summary: item.summary,
    source: item.source,
    url: item.url,
    publishedAt: item.publishedAt,
    sentiment: item.sentiment,
  }));
}

function buildFocusedCompanyQuery(
  company: CompanyProfile,
  intent: FollowUpIntent,
  question: string
) {
  const companyName = company.name;
  const symbol = company.symbol !== "N/A" ? company.symbol : "";
  const exchange = company.exchange !== "UNKNOWN" ? company.exchange : "";

  const identity = [companyName, symbol, exchange].filter(Boolean).join(" ");

  if (intent === "LATEST_NEWS") {
    return `${identity} latest news stock earnings business updates`;
  }

  if (intent === "RECENT_GROWTH") {
    return `${identity} revenue growth profit earnings expansion market share quarterly results`;
  }

  if (intent === "COMPETITORS") {
    return `${identity} competitors market share industry rivals comparison`;
  }

  if (intent === "RISKS") {
    return `${identity} risks competition regulation losses margin pressure challenges`;
  }

  if (intent === "VALUATION") {
    return `${identity} valuation share price PE ratio market cap analyst view`;
  }

  if (intent === "DECISION_UPDATE") {
    return `${identity} latest news earnings risks growth analyst rating investment outlook`;
  }

  if (intent === "COMPARE") {
    return `${identity} ${question} comparison competitors market position`;
  }

  return `${identity} ${question}`;
}