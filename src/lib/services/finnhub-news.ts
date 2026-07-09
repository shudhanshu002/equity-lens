import { NewsItem } from "@/lib/types/research";

type FinnhubNewsItem = {
  category?: string;
  datetime?: number;
  headline?: string;
  id?: number;
  image?: string;
  related?: string;
  source?: string;
  summary?: string;
  url?: string;
};

type Sentiment = "POSITIVE" | "NEUTRAL" | "NEGATIVE";

function getDateDaysAgo(daysAgo: number): string {
  const date = new Date();

  date.setDate(date.getDate() - daysAgo);

  return date.toISOString().split("T")[0];
}

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

function classifyNewsSentiment(text: string): Sentiment {
  const lowerText = text.toLowerCase();

  const negativeWords = [
    "lawsuit",
    "probe",
    "investigation",
    "decline",
    "drop",
    "falls",
    "miss",
    "weak",
    "risk",
    "concern",
    "cut",
    "layoff",
    "pressure",
    "slows",
    "warning",
    "downgrade",
  ];

  const positiveWords = [
    "growth",
    "beats",
    "beat",
    "surge",
    "record",
    "strong",
    "upgrade",
    "profit",
    "rally",
    "expands",
    "partnership",
    "launch",
    "demand",
    "raises",
    "outperform",
  ];

  const negativeScore = negativeWords.reduce((score, word) => {
    return lowerText.includes(word) ? score + 1 : score;
  }, 0);

  const positiveScore = positiveWords.reduce((score, word) => {
    return lowerText.includes(word) ? score + 1 : score;
  }, 0);

  if (positiveScore > negativeScore) return "POSITIVE";
  if (negativeScore > positiveScore) return "NEGATIVE";

  return "NEUTRAL";
}

function mapFinnhubNewsItem(item: FinnhubNewsItem): NewsItem {
  const headline = item.headline ?? "Untitled news item";
  const summary = item.summary ?? "No summary available.";

  return {
    headline,
    summary,
    source: item.source ?? "Finnhub",
    url: item.url,
    publishedAt: item.datetime
      ? new Date(item.datetime * 1000).toISOString()
      : undefined,
    sentiment: classifyNewsSentiment(`${headline} ${summary}`),
  };
}

export async function fetchFinnhubCompanyNews(
  symbol: string
): Promise<NewsItem[]> {
  const apiKey = process.env.FINNHUB_API_KEY;

  if (!apiKey) {
    throw new Error("Missing FINNHUB_API_KEY.");
  }

  const url = new URL("https://finnhub.io/api/v1/company-news");

  url.searchParams.set("symbol", symbol);
  url.searchParams.set("from", getDateDaysAgo(30));
  url.searchParams.set("to", getTodayDate());
  url.searchParams.set("token", apiKey);

  const response = await fetch(url.toString(), {
    method: "GET",
    next: {
      revalidate: 60 * 30,
    },
  });

  if (!response.ok) {
    throw new Error(`Finnhub news request failed with status ${response.status}.`);
  }

  const data = (await response.json()) as FinnhubNewsItem[];

  if (!Array.isArray(data)) {
    throw new Error("Finnhub returned invalid news response.");
  }

  return data
    .filter((item) => item.headline && item.summary)
    .slice(0, 8)
    .map(mapFinnhubNewsItem);
}