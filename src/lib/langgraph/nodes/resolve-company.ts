import { ResearchState } from "@/lib/langgraph/state";
import { resolveCompany } from "@/lib/services/company-resolver";

type ResearchStateType = typeof ResearchState.State;

export async function resolveCompanyNode(
  state: ResearchStateType
): Promise<Partial<ResearchStateType>> {
  const result = await resolveCompany(state.input);

  return {
    status: "RESOLVING_COMPANY",
    company: result.company,
    metadata: {
      agentVersion: "1.0.0",
      warnings: result.warning ? [result.warning] : [],
      trace: [
        {
          step: "resolve_company",
          status:
            result.source === "USER_INPUT_FALLBACK" ? "FALLBACK" : "SUCCESS",
          provider: result.source,
          message: `Resolved "${state.input}" to ${result.company.symbol}.`,
          timestamp: new Date().toISOString(),
        },
      ],
    },
  };
}