import { CompanyProfile, NewsItem } from "@/lib/types/research";
import { fetchFinnhubCompanyNews } from "@/lib/services/finnhub-news";
import { fetchMockNews } from "@/lib/services/mock-market-data";

type NewsDataResult = {
  news: NewsItem[];
  source: "FINNHUB" | "MOCK";
  warning?: string;
};

export async function fetchCompanyNews(
  company: CompanyProfile
): Promise<NewsDataResult> {
  try {
    const news = await fetchFinnhubCompanyNews(company.symbol);

    if (news.length === 0) {
      throw new Error("Finnhub returned no recent news.");
    }

    return {
      news,
      source: "FINNHUB",
    };
  } catch (error) {
    const mockNews = await fetchMockNews(company.symbol);

    return {
      news: mockNews,
      source: "MOCK",
      warning:
        error instanceof Error
          ? `Using mock news because real news API failed: ${error.message}`
          : "Using mock news because real news API failed.",
    };
  }
}