import axios from "axios";

export type GeneralCompanySignal = {
  headline: string;
  summary: string;
  source: string;
  url?: string;
  publishedAt?: string;
  sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
};

export async function fetchGeneralCompanyResearch(
  companyOrQuery: string,
  options?: {
    rawQuery?: boolean;
    num?: number;
  }
): Promise<GeneralCompanySignal[]> {
  const apiKey = process.env.SERPER_API_KEY;

  if (!apiKey) {
    return getLimitedResearchFallback();
  }

  const query = options?.rawQuery
    ? companyOrQuery
    : `${companyOrQuery} company business model revenue growth competitors risks latest news`;

  try {
    const response = await axios.post(
      "https://google.serper.dev/news",
      {
        q: query,
        num: options?.num ?? 8,
      },
      {
        headers: {
          "X-API-KEY": apiKey,
          "Content-Type": "application/json",
        },
        timeout: 15_000,
      }
    );

    const news = response.data?.news ?? [];

    if (!news.length) {
      return getLimitedResearchFallback();
    }

    return news.slice(0, options?.num ?? 8).map((item: any) => ({
      headline: item.title || "Company signal",
      summary: item.snippet || "No summary available.",
      source: item.source || "Web",
      url: item.link,
      publishedAt: item.date,
      sentiment: getSimpleSentiment(`${item.title ?? ""} ${item.snippet ?? ""}`),
    }));
  } catch (error: any) {
    const status = error?.response?.status;

    return [
      {
        headline: "General company research provider unavailable",
        summary:
          status === 403
            ? "Serper rejected the request. Check SERPER_API_KEY in the backend environment."
            : "The web-search provider failed. EquityLens continued with limited company research mode.",
        source: "EquityLens",
        sentiment: "NEUTRAL",
      },
    ];
  }
}

function getLimitedResearchFallback(): GeneralCompanySignal[] {
  return [
    {
      headline: "General company research mode",
      summary:
        "No web-search provider is configured. EquityLens can still answer with limited context, but live research coverage is reduced.",
      source: "EquityLens",
      sentiment: "NEUTRAL",
    },
  ];
}

function getSimpleSentiment(text: string): "POSITIVE" | "NEUTRAL" | "NEGATIVE" {
  const lower = text.toLowerCase();

  const negativeWords = [
    "loss",
    "decline",
    "lawsuit",
    "fraud",
    "layoff",
    "debt",
    "risk",
    "shutdown",
    "crisis",
    "fall",
    "weak",
    "competition",
    "pressure",
    "miss",
  ];

  const positiveWords = [
    "growth",
    "funding",
    "profit",
    "expansion",
    "raises",
    "partnership",
    "launch",
    "revenue",
    "acquisition",
    "beat",
    "strong",
    "improves",
  ];

  if (negativeWords.some((word) => lower.includes(word))) return "NEGATIVE";
  if (positiveWords.some((word) => lower.includes(word))) return "POSITIVE";

  return "NEUTRAL";
}