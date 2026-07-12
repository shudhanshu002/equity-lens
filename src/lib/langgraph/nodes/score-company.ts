import { ResearchState } from "@/lib/langgraph/state";
import {
  calculateInvestmentScore,
  decideInvestment,
} from "@/lib/scoring/investment-score";

type ResearchStateType = typeof ResearchState.State;

export async function scoreCompanyNode(
  state: ResearchStateType
): Promise<Partial<ResearchStateType>> {
  if (state.company?.coverageMode === "GENERAL_COMPANY") {
    const sentiment = calculateGeneralSentimentScore(state.news ?? []);

    const score = {
      growth: 55,
      profitability: 50,
      balanceSheet: 50,
      valuation: 45,
      sentiment,
      total: Math.round(55 * 0.25 + 50 * 0.2 + 50 * 0.2 + 45 * 0.15 + sentiment * 0.2),
    };

    const decision = "INSUFFICIENT_DATA" as const;

    return {
      score,
      decision,
      confidence: 25,
      metadata: {
        agentVersion: "1.0.0",
        warnings: [
          "No verified public-equity fundamentals are available. EquityLens will not issue an investment recommendation from general web signals alone.",
        ],
        evidenceQuality: {
          level: "INSUFFICIENT",
          financialCompleteness: 0,
          hasRealFinancials: false,
          hasRealNews: !["MOCK", "NOT_AVAILABLE"].includes(state.metadata.newsDataSource ?? "NOT_AVAILABLE"),
          reasons: ["No supported public ticker or filing-backed financial statements were resolved."],
        },
        trace: [
          {
            step: "score_company",
            status: "SUCCESS",
            provider: "GENERAL_COMPANY_SCORING_MODEL",
            message: `Generated general company score ${score.total} and decision ${decision}.`,
            timestamp: new Date().toISOString(),
          },
        ],
      },
    };
  }

  const isPublicEquityWithLimitedData =
    state.company?.coverageMode === "PUBLIC_EQUITY" &&
    state.company.exchange &&
    ["NSE", "BSE"].includes(state.company.exchange) &&
    Object.keys(state.financials ?? {}).length === 0;

  if (isPublicEquityWithLimitedData) {
    const sentiment = calculateGeneralSentimentScore(state.news ?? []);

    const score = {
      growth: 55,
      profitability: 50,
      balanceSheet: 50,
      valuation: 45,
      sentiment,
      total: Math.round(
        55 * 0.25 +
          50 * 0.2 +
          50 * 0.2 +
          45 * 0.15 +
          sentiment * 0.2
      ),
    };

    const decision = "INSUFFICIENT_DATA" as const;

    return {
      score,
      decision,
      confidence: 30,
      metadata: {
        agentVersion: "1.0.0",
        warnings: [
          "Detailed financial statements were unavailable. EquityLens will not issue an investment recommendation from quote and news signals alone.",
        ],
        evidenceQuality: {
          level: "INSUFFICIENT",
          financialCompleteness: 0,
          hasRealFinancials: false,
          hasRealNews: !["MOCK", "NOT_AVAILABLE"].includes(state.metadata.newsDataSource ?? "NOT_AVAILABLE"),
          reasons: ["Only limited quote/listing coverage was available."],
        },
        trace: [
          {
            step: "score_company",
            status: "SUCCESS",
            provider: "PUBLIC_EQUITY_LIMITED_DATA_SCORING_MODEL",
            message: `Generated limited public-equity score ${score.total} and decision ${decision}.`,
            timestamp: new Date().toISOString(),
          },
        ],
      },
    };
  }

  if (!state.financials) {
    throw new Error("Financials are required before scoring.");
  }

  const score = calculateInvestmentScore(state.financials, state.news);
  const quality = assessEvidenceQuality(state);
  const initialDecision = quality.level === "INSUFFICIENT" ? "INSUFFICIENT_DATA" : decideInvestment(score.total);
  const gate = applyRecommendationGates(initialDecision, score, state);
  const decision = gate.decision;

  return {
    status: "SCORING",
    score,
    decision,
    confidence: quality.confidence,
    metadata: {
      agentVersion: "1.0.0",
      warnings: [
        ...(quality.level === "INSUFFICIENT" ? ["The score is shown for diagnostics, but no recommendation was issued because verified evidence is insufficient."] : []),
        ...gate.reasons,
      ],
      evidenceQuality: quality.evidenceQuality,
      trace: [
        {
          step: "score_company",
          status: "SUCCESS",
          provider: "RULE_BASED_SCORING_MODEL",
          message: `Generated score ${score.total} and decision ${decision}.`,
          timestamp: new Date().toISOString(),
        },
      ],
    },
  };
}

function calculateGeneralSentimentScore(news: any[]) {
  if (!news.length) return 50;

  let score = 50;

  for (const item of news) {
    if (item.sentiment === "POSITIVE") score += 5;
    if (item.sentiment === "NEGATIVE") score -= 7;
  }

  return Math.max(20, Math.min(80, score));
}

function applyRecommendationGates(
  decision: ReturnType<typeof decideInvestment> | "INSUFFICIENT_DATA",
  score: ReturnType<typeof calculateInvestmentScore>,
  state: ResearchStateType
) {
  if (decision === "INSUFFICIENT_DATA") return { decision, reasons: [] as string[] };
  const reasons: string[] = [];
  let gatedDecision: ReturnType<typeof decideInvestment> | "INSUFFICIENT_DATA" = decision;

  if (!score.coverage?.valuation && gatedDecision === "INVEST") {
    gatedDecision = "WATCHLIST";
    reasons.push("Recommendation capped at WATCHLIST because no verified valuation metric was available.");
  }
  if (score.coverage?.balanceSheet && score.balanceSheet < 40 && gatedDecision === "INVEST") {
    gatedDecision = "WATCHLIST";
    reasons.push("Recommendation capped at WATCHLIST because balance-sheet quality is below the investment gate.");
  }
  if (state.financials?.freeCashFlowPositive === false && gatedDecision === "INVEST") {
    gatedDecision = "WATCHLIST";
    reasons.push("Recommendation capped at WATCHLIST because reported free cash flow is negative.");
  }
  if (!score.coverage?.growth || !score.coverage?.profitability) {
    gatedDecision = "INSUFFICIENT_DATA";
    reasons.push("No recommendation issued because growth and profitability evidence are both required.");
  }

  return { decision: gatedDecision, reasons };
}

function assessEvidenceQuality(state: ResearchStateType) {
  const trackedKeys = ["revenueGrowthYoY", "profitMargin", "operatingMargin", "returnOnEquity", "debtToEquity", "currentRatio", "freeCashFlowPositive", "peRatio", "forwardPe", "pegRatio", "priceToSales", "eps", "beta"] as const;
  const fields = trackedKeys.map((key) => state.financials?.[key]);
  const populated = fields.filter((value) => value !== undefined && value !== null).length;
  const financialCompleteness = Math.round((populated / 13) * 100);
  const hasRealFinancials = state.metadata.financialDataSource !== "MOCK" && state.metadata.financialDataSource !== "NOT_AVAILABLE";
  const hasRealNews = !["MOCK", "NOT_AVAILABLE"].includes(state.metadata.newsDataSource ?? "NOT_AVAILABLE");
  const insufficient = !hasRealFinancials || financialCompleteness < 35;
  const level: "HIGH" | "MEDIUM" | "LOW" | "INSUFFICIENT" = insufficient ? "INSUFFICIENT" : financialCompleteness >= 75 && hasRealNews ? "HIGH" : financialCompleteness >= 50 ? "MEDIUM" : "LOW";
  const confidence = insufficient ? 30 : Math.min(92, Math.round(financialCompleteness * 0.7 + (hasRealNews ? 20 : 5)));
  const reasons = [
    `${financialCompleteness}% of tracked financial fields are populated.`,
    hasRealFinancials ? "Verified market fundamentals are available." : "Only mock or unavailable financial data is present.",
    hasRealNews ? "Current non-mock research signals are available." : "News coverage is using demo fallback data.",
  ];
  return { level, confidence, evidenceQuality: { level, financialCompleteness, hasRealFinancials, hasRealNews, reasons } };
}
