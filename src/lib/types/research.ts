export type InvestmentDecision = "INVEST" | "WATCHLIST" | "PASS" | "INSUFFICIENT_DATA";

export type ResearchStatus =
  | "PENDING"
  | "RESOLVING_COMPANY"
  | "FETCHING_FINANCIALS"
  | "FETCHING_NEWS"
  | "SCORING"
  | "GENERATING_DECISION"
  | "COMPLETED"
  | "FAILED";

export type CompanyCoverageMode = "PUBLIC_EQUITY" | "GENERAL_COMPANY";

export type CompanyProfile = {
  symbol: string;
  name: string;
  exchange: string;
  sector: string;
  industry: string;
  country: string;
  currency: string;
  marketCap?: number | null;

  coverageMode?: CompanyCoverageMode;
  isPubliclyTraded?: boolean;
  resolvedTicker?: string | null;

  marketDataSymbol?: string | null;
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
  history?: HistoricalFinancialPeriod[];
};

export type HistoricalFinancialPeriod = {
  fiscalYear: number;
  revenue?: number;
  netIncome?: number;
  operatingIncome?: number;
  operatingCashFlow?: number;
  capitalExpenditure?: number;
  freeCashFlow?: number;
};

export type NewsItem = {
  headline: string;
  summary: string;
  source: string;
  url?: string;
  publishedAt?: string;
  sentiment?: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
};

export type EvidenceSource = {
  id: string;
  category: "FINANCIAL" | "FILING" | "NEWS" | "AI_SYNTHESIS";
  title: string;
  provider: string;
  url?: string;
  publishedAt?: string;
};

export type ValuationAssessment = {
  status: "ATTRACTIVE" | "FAIR" | "EXPENSIVE" | "UNKNOWN";
  summary: string;
  scenarios: Array<{
    name: "BEAR" | "BASE" | "BULL";
    assumptions: string[];
    signal: string;
  }>;
};

export type ScoreBreakdown = {
  growth: number;
  profitability: number;
  balanceSheet: number;
  valuation: number;
  sentiment: number;
  total: number;
  coverage?: {
    growth: boolean;
    profitability: boolean;
    balanceSheet: boolean;
    valuation: boolean;
    sentiment: boolean;
  };
};

export type FinancialDataSource = "ALPHA_VANTAGE" | "SEC_EDGAR" | "MOCK" | "NOT_AVAILABLE" | "PUBLIC_LISTING_DISCOVERY" | "YAHOO_FINANCE_QUOTE_LIMITED";
export type NewsDataSource = "FINNHUB" | "MOCK" | "GENERAL_WEB_RESEARCH" | "NOT_AVAILABLE";
export type MemoProvider = "GEMINI" | "FALLBACK";

export type AgentTraceStep = {
  step: string;
  status: "SUCCESS" | "FALLBACK" | "FAILED" | "SKIPPED";
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
  evidenceQuality?: {
    level: "HIGH" | "MEDIUM" | "LOW" | "INSUFFICIENT";
    financialCompleteness: number;
    hasRealFinancials: boolean;
    hasRealNews: boolean;
    reasons: string[];
  };
  scoringModelVersion?: string;
  promptVersion?: string;
  dataRetrievedAt?: string;
  staleAfter?: string;
  citationValidation?: {
    valid: boolean;
    referencedIds: string[];
    invalidIds: string[];
  };
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
  catalysts?: string[];
  monitoringTriggers?: string[];
  valuationAssessment?: ValuationAssessment;
  sources?: EvidenceSource[];
  metadata: ResearchMetadata;
  generatedAt: string;
};
