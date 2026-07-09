export type InvestmentDecision = "INVEST" | "WATCHLIST" | "PASS";

export type ResearchStatus =
  | "PENDING"
  | "RESOLVING_COMPANY"
  | "FETCHING_FINANCIALS"
  | "FETCHING_NEWS"
  | "SCORING"
  | "GENERATING_DECISION"
  | "COMPLETED"
  | "FAILED";

export type CompanyProfile = {
  symbol: string;
  name: string;
  exchange?: string;
  sector?: string;
  industry?: string;
  country?: string;
  currency?: string;
  marketCap?: number;
};

export type FinancialSnapshot = {
  revenueGrowthYoY?: number;
  profitMargin?: number;
  operatingMargin?: number;
  returnOnEquity?: number;
  debtToEquity?: number;
  currentRatio?: number;
  freeCashFlowPositive?: boolean;
  peRatio?: number;
  forwardPe?: number;
  pegRatio?: number;
  priceToSales?: number;
  eps?: number;
  beta?: number;
};

export type NewsItem = {
  headline: string;
  summary: string;
  source: string;
  url?: string;
  publishedAt?: string;
  sentiment?: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
};

export type ScoreBreakdown = {
  growth: number;
  profitability: number;
  balanceSheet: number;
  valuation: number;
  sentiment: number;
  total: number;
};

export type FinancialDataSource = "ALPHA_VANTAGE" | "MOCK";
export type NewsDataSource = "FINNHUB" | "MOCK";
export type MemoProvider = "GEMINI" | "FALLBACK";

export type AgentTraceStep = {
  step: string;
  status: "SUCCESS" | "FALLBACK" | "FAILED";
  provider?: string;
  message: string;
  timestamp: string;
};

export type ResearchMetadata = {
  financialDataSource?: FinancialDataSource;
  newsDataSource?: NewsDataSource;
  memoProvider?: MemoProvider;
  agentVersion: string;
  warnings: string[];
  trace: AgentTraceStep[];
};

export type InvestmentResearchReport = {
  company: CompanyProfile;
  financials: FinancialSnapshot;
  news: NewsItem[];
  score: ScoreBreakdown;
  decision: InvestmentDecision;
  confidence: number;
  thesis: string;
  bullCase: string[];
  bearCase: string[];
  risks: string[];
  whatWouldChangeDecision: string[];
  metadata: ResearchMetadata;
  generatedAt: string;
};