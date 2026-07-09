import { ResearchState } from "@/lib/langgraph/state";
import { generateAnalystMemo } from "@/lib/services/llm-memo";

type ResearchStateType = typeof ResearchState.State;

export async function generateDecisionNode(
  state: ResearchStateType
): Promise<Partial<ResearchStateType>> {
  if (!state.company || !state.financials || !state.score || !state.decision) {
    throw new Error("Company, financials, score, and decision are required.");
  }

  const memo = await generateAnalystMemo({
    company: state.company,
    financials: state.financials,
    news: state.news,
    score: state.score,
    decision: state.decision,
  });

  return {
    status: "COMPLETED",
    thesis: memo.thesis,
    bullCase: memo.bullCase,
    bearCase: memo.bearCase,
    risks: memo.risks,
    whatWouldChangeDecision: memo.whatWouldChangeDecision,
  };
}