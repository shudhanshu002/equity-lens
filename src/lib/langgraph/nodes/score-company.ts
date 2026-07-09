import { ResearchState } from "@/lib/langgraph/state";
import {
  calculateInvestmentScore,
  decideInvestment,
} from "@/lib/scoring/investment-score";

type ResearchStateType = typeof ResearchState.State;

export async function scoreCompanyNode(
  state: ResearchStateType
): Promise<Partial<ResearchStateType>> {
  if (!state.financials) {
    throw new Error("Financials are required before scoring.");
  }

  const score = calculateInvestmentScore(state.financials, state.news);
  const decision = decideInvestment(score.total);

  return {
    status: "SCORING",
    score,
    decision,
    confidence: Math.min(95, Math.max(55, score.total + 10)),
    metadata: {
      agentVersion: "1.0.0",
      warnings: [],
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