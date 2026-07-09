import { ResearchState } from "@/lib/langgraph/state";
import { resolveCompany } from "@/lib/services/company-resolver";

type ResearchStateType = typeof ResearchState.State;

export async function resolveCompanyNode(
  state: ResearchStateType
): Promise<Partial<ResearchStateType>> {
  const company = await resolveCompany(state.input);

  return {
    status: "RESOLVING_COMPANY",
    company,
    metadata: {
      agentVersion: "1.0.0",
      warnings: [],
      trace: [
        {
          step: "resolve_company",
          status: "SUCCESS",
          provider: "LOCAL_RESOLVER",
          message: `Resolved "${state.input}" to ${company.symbol}.`,
          timestamp: new Date().toISOString(),
        },
      ],
    },
  };
}