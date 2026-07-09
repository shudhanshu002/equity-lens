import { ResearchState } from "@/lib/langgraph/state";

type ResearchStateType = typeof ResearchState.State;

export async function generateDecisionNode(
  state: ResearchStateType
): Promise<Partial<ResearchStateType>> {
  if (!state.company || !state.financials || !state.score || !state.decision) {
    throw new Error("Company, financials, score, and decision are required.");
  }

  const { company, financials, score, decision } = state;

  const thesis =
    decision === "INVEST"
      ? `${company.name} looks attractive because it combines strong business quality with a total investment score of ${score.total}. The company shows good growth, profitability, balance sheet strength, or valuation support.`
      : decision === "WATCHLIST"
        ? `${company.name} has some attractive qualities, but the current risk/reward is not strong enough for a clear investment decision. It should remain on the watchlist until valuation, growth, or risk signals improve.`
        : `${company.name} does not currently offer a strong enough investment case. The score of ${score.total} suggests that valuation, profitability, balance sheet, or sentiment risks outweigh the upside.`;

  const risks: string[] = [];

  if ((financials.peRatio ?? 0) > 50) {
    risks.push("High valuation creates downside risk if growth slows.");
  }

  if ((financials.debtToEquity ?? 0) > 1.5) {
    risks.push("Elevated leverage may reduce financial flexibility.");
  }

  if ((financials.profitMargin ?? 0) < 10) {
    risks.push("Low profit margin leaves less room for execution mistakes.");
  }

  if ((financials.revenueGrowthYoY ?? 0) < 5) {
    risks.push("Revenue growth is weak compared with higher-growth opportunities.");
  }

  return {
    status: "COMPLETED",
    thesis,
    bullCase: [
      "Business quality improves or remains durable.",
      "Revenue and earnings compound over time.",
      "Market sentiment improves as execution becomes clearer.",
    ],
    bearCase: [
      "Growth slows faster than expected.",
      "Valuation multiple contracts.",
      "Competition, regulation, or execution risk hurts margins.",
    ],
    risks:
      risks.length > 0
        ? risks
        : ["No major risk found in the current mock dataset."],
    whatWouldChangeDecision: [
      "A major change in revenue growth trend.",
      "A large valuation correction or expansion.",
      "Clear improvement or deterioration in margins.",
      "Material change in debt, cash flow, or competitive position.",
    ],
  };
}