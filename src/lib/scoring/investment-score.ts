import type {
  FinancialSnapshot,
  InvestmentDecision,
  NewsItem,
  ScoreBreakdown,
} from "@/lib/types/research";

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function scoreGrowth(financials: FinancialSnapshot): number | undefined {
  const growth = financials.revenueGrowthYoY;
  if (growth === undefined) return undefined;

  if (growth >= 50) return 95;
  if (growth >= 20) return 85;
  if (growth >= 10) return 70;
  if (growth >= 5) return 60;
  if (growth >= 0) return 45;

  return 25;
}

function scoreProfitability(financials: FinancialSnapshot): number | undefined {
  const parts: Array<{ value: number; weight: number }> = [];
  if (financials.profitMargin !== undefined) parts.push({ value: clamp(financials.profitMargin * 2), weight: 0.6 });
  if (financials.returnOnEquity !== undefined) parts.push({ value: clamp(financials.returnOnEquity), weight: 0.4 });
  return weightedAvailable(parts);
}

function scoreBalanceSheet(financials: FinancialSnapshot): number | undefined {
  const debtToEquity = financials.debtToEquity;
  const currentRatio = financials.currentRatio;
  const freeCashFlowPositive = financials.freeCashFlowPositive;

  const parts: Array<{ value: number; weight: number }> = [];
  if (debtToEquity !== undefined) parts.push({ value: debtToEquity <= 0.3 ? 100 : debtToEquity <= 1 ? 78 : debtToEquity <= 2 ? 44 : 20, weight: 0.45 });
  if (currentRatio !== undefined) parts.push({ value: currentRatio >= 2 ? 100 : currentRatio >= 1.2 ? 72 : currentRatio >= 1 ? 43 : 14, weight: 0.35 });
  if (freeCashFlowPositive !== undefined) parts.push({ value: freeCashFlowPositive ? 100 : 0, weight: 0.2 });
  return weightedAvailable(parts);
}

function scoreValuation(financials: FinancialSnapshot): number | undefined {
  const pe = financials.peRatio;
  const peg = financials.pegRatio;
  const ps = financials.priceToSales;
  if (pe === undefined && peg === undefined && ps === undefined) return undefined;

  let score = 70;

  if (pe !== undefined) {
    if (pe <= 0) score -= 20;
    else if (pe < 20) score += 15;
    else if (pe < 35) score += 5;
    else if (pe < 60) score -= 10;
    else score -= 25;
  }

  if (peg !== undefined && peg > 0 && peg < 1.5) score += 15;
  else if (peg !== undefined && peg > 2.5) score -= 15;

  if (ps !== undefined && ps > 15) score -= 20;
  else if (ps !== undefined && ps > 8) score -= 10;

  return clamp(score);
}

function scoreSentiment(news: NewsItem[]): number | undefined {
  if (news.length === 0) return undefined;

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

  const total = Math.round(weightedAvailable([
    ...(growth !== undefined ? [{ value: growth, weight: 0.25 }] : []),
    ...(profitability !== undefined ? [{ value: profitability, weight: 0.2 }] : []),
    ...(balanceSheet !== undefined ? [{ value: balanceSheet, weight: 0.2 }] : []),
    ...(valuation !== undefined ? [{ value: valuation, weight: 0.2 }] : []),
    ...(sentiment !== undefined ? [{ value: sentiment, weight: 0.15 }] : []),
  ]) ?? 50);

  return {
    growth: Math.round(growth ?? 50),
    profitability: Math.round(profitability ?? 50),
    balanceSheet: Math.round(balanceSheet ?? 50),
    valuation: Math.round(valuation ?? 50),
    sentiment: Math.round(sentiment ?? 50),
    total,
    coverage: {
      growth: growth !== undefined,
      profitability: profitability !== undefined,
      balanceSheet: balanceSheet !== undefined,
      valuation: valuation !== undefined,
      sentiment: sentiment !== undefined,
    },
  };
}

function weightedAvailable(parts: Array<{ value: number; weight: number }>): number | undefined {
  if (!parts.length) return undefined;
  const weight = parts.reduce((sum, part) => sum + part.weight, 0);
  return clamp(parts.reduce((sum, part) => sum + part.value * part.weight, 0) / weight);
}

export function decideInvestment(score: number): InvestmentDecision {
  if (score >= 75) return "INVEST";
  if (score >= 55) return "WATCHLIST";
  return "PASS";
}
