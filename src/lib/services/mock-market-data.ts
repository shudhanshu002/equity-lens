import { FinancialSnapshot, NewsItem } from "@/lib/types/research";

const MOCK_FINANCIALS: Record<string, FinancialSnapshot> = {
  AAPL: {
    revenueGrowthYoY: 3.1,
    profitMargin: 26.3,
    operatingMargin: 30.8,
    returnOnEquity: 151,
    debtToEquity: 1.4,
    currentRatio: 0.95,
    freeCashFlowPositive: true,
    peRatio: 31.2,
    forwardPe: 27.8,
    pegRatio: 2.4,
    priceToSales: 7.8,
    eps: 6.42,
    beta: 1.2,
  },

  TSLA: {
    revenueGrowthYoY: 8.7,
    profitMargin: 7.2,
    operatingMargin: 8.1,
    returnOnEquity: 12.4,
    debtToEquity: 0.18,
    currentRatio: 1.7,
    freeCashFlowPositive: true,
    peRatio: 65.4,
    forwardPe: 58.2,
    pegRatio: 3.7,
    priceToSales: 6.9,
    eps: 3.1,
    beta: 2.1,
  },

  NVDA: {
    revenueGrowthYoY: 120.4,
    profitMargin: 48.8,
    operatingMargin: 55.2,
    returnOnEquity: 69.2,
    debtToEquity: 0.22,
    currentRatio: 3.5,
    freeCashFlowPositive: true,
    peRatio: 54.6,
    forwardPe: 34.9,
    pegRatio: 1.4,
    priceToSales: 28.5,
    eps: 12.9,
    beta: 1.7,
  },
};

const MOCK_NEWS: Record<string, NewsItem[]> = {
  AAPL: [
    {
      headline: "Apple continues expanding services and ecosystem revenue",
      summary:
        "The company remains strongly positioned through services revenue, premium devices, and customer ecosystem lock-in.",
      source: "Mock Research Feed",
      sentiment: "POSITIVE",
    },
    {
      headline: "Investors monitor iPhone growth and China demand",
      summary:
        "Hardware growth remains a key risk as the market watches replacement cycles and regional demand.",
      source: "Mock Research Feed",
      sentiment: "NEUTRAL",
    },
  ],

  TSLA: [
    {
      headline: "Tesla faces margin pressure from EV competition",
      summary:
        "Pricing pressure and rising competition continue to affect investor expectations.",
      source: "Mock Research Feed",
      sentiment: "NEGATIVE",
    },
    {
      headline: "Autonomy and energy storage remain long-term upside drivers",
      summary:
        "Investors continue to value optionality from autonomous driving, software, and energy storage.",
      source: "Mock Research Feed",
      sentiment: "POSITIVE",
    },
  ],

  NVDA: [
    {
      headline: "NVIDIA benefits from strong AI infrastructure demand",
      summary:
        "Demand for AI accelerators and data center chips continues to support growth expectations.",
      source: "Mock Research Feed",
      sentiment: "POSITIVE",
    },
    {
      headline: "Valuation risk remains high after strong stock performance",
      summary:
        "Investors are watching whether earnings growth can continue supporting premium multiples.",
      source: "Mock Research Feed",
      sentiment: "NEUTRAL",
    },
  ],
};

export function hasMockFinancials(symbol: string): boolean {
  return Boolean(MOCK_FINANCIALS[symbol]);
}

export async function fetchMockFinancials(
  symbol: string
): Promise<FinancialSnapshot> {
  return MOCK_FINANCIALS[symbol] ?? {};
}

export async function fetchMockNews(symbol: string): Promise<NewsItem[]> {
  return (
    MOCK_NEWS[symbol] ?? [
      {
        headline: "No major mock news found",
        summary:
          "This backend is currently using mock data. Real company news will be connected when a news API key is available.",
        source: "Mock Research Feed",
        sentiment: "NEUTRAL",
      },
    ]
  );
}