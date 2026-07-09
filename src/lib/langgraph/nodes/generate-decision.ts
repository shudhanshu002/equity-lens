import { ResearchState } from "@/lib/langgraph/state";
import { generateAnalystMemo } from "@/lib/services/llm-memo";

type ResearchStateType = typeof ResearchState.State;

export async function generateDecisionNode(
  state: ResearchStateType
): Promise<Partial<ResearchStateType>> {
  if (!state.company || !state.financials || !state.score || !state.decision) {
    throw new Error("Company, financials, score, and decision are required.");
  }

  const result = await generateAnalystMemo({
    company: state.company,
    financials: state.financials,
    news: state.news,
    score: state.score,
    decision: state.decision,
  });

  return {
    status: "COMPLETED",
    thesis: result.memo.thesis,
    bullCase: result.memo.bullCase,
    bearCase: result.memo.bearCase,
    risks: result.memo.risks,
    whatWouldChangeDecision: result.memo.whatWouldChangeDecision,
    metadata: {
      agentVersion: "1.0.0",
      memoProvider: result.provider,
      warnings: result.warning ? [result.warning] : [],
      trace: [
        {
          step: "generate_memo",
          status: result.provider === "GEMINI" ? "SUCCESS" : "FALLBACK",
          provider: result.provider,
          message:
            result.provider === "GEMINI"
              ? "Generated investment memo using Gemini."
              : "Generated investment memo using fallback logic.",
          timestamp: new Date().toISOString(),
        },
      ],
    },
  };
}