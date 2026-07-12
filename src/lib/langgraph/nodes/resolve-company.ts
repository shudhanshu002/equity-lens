import { ResearchState } from "@/lib/langgraph/state";
import { resolveCompany } from "@/lib/services/company-resolver";

type ResearchStateType = typeof ResearchState.State;

export async function resolveCompanyNode(
  state: ResearchStateType
): Promise<Partial<ResearchStateType>> {
  const result = await resolveCompany(state.input);

  return {
    status: "RESOLVING_COMPANY",
    company: result.company!,
    metadata: {
      agentVersion: "1.0.0",
      warnings: result.warnings,
      trace: [
        {
          step: "resolve_company",
          status: "SUCCESS",
          provider: result.provider!,
          message:
            result.company!.coverageMode === "PUBLIC_EQUITY"
              ? `Resolved "${state.input}" to ${result.company!.symbol}.`
              : `Resolved "${state.input}" as a general company research target.`,
          timestamp: new Date().toISOString(),
        },
      ],
    },
  };
}