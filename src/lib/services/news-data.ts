import { CompanyProfile, NewsItem } from "@/lib/types/research";
import { fetchFinnhubCompanyNews } from "@/lib/services/finnhub-news";
import { fetchMockNews } from "@/lib/services/mock-market-data";
import { filterRelevantCompanyNews } from "@/lib/services/news-filter";

type NewsDataResult = {
  news: NewsItem[];
  source: "FINNHUB" | "MOCK";
  warnings: string[];
};

export async function fetchCompanyNews(
  company: CompanyProfile
): Promise<NewsDataResult> {
  try {
    const rawNews = await fetchFinnhubCompanyNews(company.symbol);

    const relevanceResult = filterRelevantCompanyNews(rawNews, company, {
      minArticles: 2,
      maxArticles: 8,
    });

    if (relevanceResult.articles.length > 0) {
      return {
        news: relevanceResult.articles,
        source: "FINNHUB",
        warnings:
          relevanceResult.removedCount > 0
            ? [
                `Filtered out ${relevanceResult.removedCount} low-relevance news article(s) that did not directly match ${company.symbol} or ${company.name}.`,
              ]
            : [],
      };
    }

    const mockNews = await fetchMockNews(company.symbol);
    return {
      news: mockNews,
      source: "MOCK",
      warnings: [
        `Finnhub returned news, but no articles were relevant enough for ${company.symbol}. Used curated fallback news instead.`,
      ],
    };
  } catch (error) {
    const mockNews = await fetchMockNews(company.symbol);
    return {
      news: mockNews,
      source: "MOCK",
      warnings: [
        `Using mock news because real news API failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      ],
    };
  }
}