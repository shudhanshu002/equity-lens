import {
  FinancialSnapshot,
  InvestmentDecision,
  NewsItem,
  ScoreBreakdown,
} from "@/lib/types/research";

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function scoreGrowth(financials: FinancialSnapshot): number {
  const growth = financials.revenueGrowthYoY ?? 0;

  if (growth >= 50) return 95;
  if (growth >= 20) return 85;
  if (growth >= 10) return 70;
  if (growth >= 5) return 60;
  if (growth >= 0) return 45;

  return 25;
}

function scoreProfitability(financials: FinancialSnapshot): number {
  const margin = financials.profitMargin ?? 0;
  const roe = financials.returnOnEquity ?? 0;

  const marginScore = clamp(margin * 2);
  const roeScore = clamp(roe);

  return clamp(marginScore * 0.6 + roeScore * 0.4);
}

function scoreBalanceSheet(financials: FinancialSnapshot): number {
  const debtToEquity = financials.debtToEquity;
  const currentRatio = financials.currentRatio;
  const freeCashFlowPositive = financials.freeCashFlowPositive;

  const debtScore =
    debtToEquity === undefined
      ? 25
      : debtToEquity <= 0.3
        ? 45
        : debtToEquity <= 1
          ? 35
          : debtToEquity <= 2
            ? 20
            : 10;

  const liquidityScore =
    currentRatio === undefined
      ? 20
      : currentRatio >= 2
        ? 35
        : currentRatio >= 1.2
          ? 25
          : currentRatio >= 1
            ? 15
            : 5;

  const fcfScore =
    freeCashFlowPositive === undefined ? 10 : freeCashFlowPositive ? 20 : 0;

  return clamp(debtScore + liquidityScore + fcfScore);
}

function scoreValuation(financials: FinancialSnapshot): number {
  const pe = financials.peRatio ?? 0;
  const peg = financials.pegRatio ?? 0;
  const ps = financials.priceToSales ?? 0;

  let score = 70;

  if (pe <= 0) score -= 20;
  else if (pe < 20) score += 15;
  else if (pe < 35) score += 5;
  else if (pe < 60) score -= 10;
  else score -= 25;

  if (peg > 0 && peg < 1.5) score += 15;
  else if (peg > 2.5) score -= 15;

  if (ps > 15) score -= 20;
  else if (ps > 8) score -= 10;

  return clamp(score);
}

function scoreSentiment(news: NewsItem[]): number {
  if (news.length === 0) return 50;

  const total = news.reduce((sum, item) => {
    if (item.sentiment === "POSITIVE") return sum + 80;
    if (item.sentiment === "NEGATIVE") return sum + 25;
    return sum + 55;
  }, 0);

  return clamp(total / news.length);
}

export function calculateInvestmentScore(
  financials: FinancialSnapshot,
  news: NewsItem[]
): ScoreBreakdown {
  const growth = scoreGrowth(financials);
  const profitability = scoreProfitability(financials);
  const balanceSheet = scoreBalanceSheet(financials);
  const valuation = scoreValuation(financials);
  const sentiment = scoreSentiment(news);

  const total = Math.round(
    growth * 0.25 +
      profitability * 0.2 +
      balanceSheet * 0.2 +
      valuation * 0.2 +
      sentiment * 0.15
  );

  return {
    growth: Math.round(growth),
    profitability: Math.round(profitability),
    balanceSheet: Math.round(balanceSheet),
    valuation: Math.round(valuation),
    sentiment: Math.round(sentiment),
    total,
  };
}

export function decideInvestment(score: number): InvestmentDecision {
  if (score >= 75) return "INVEST";
  if (score >= 55) return "WATCHLIST";
  return "PASS";
}