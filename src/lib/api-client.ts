import { InvestmentResearchReport } from "@/lib/types/research";

export type ResearchApiResponse = {
  success: boolean;
  data?: InvestmentResearchReport;
  error?: string;
};

export type ComparisonApiResponse = {
  success: boolean;
  data?: {
    companies: InvestmentResearchReport[];
    comparison: {
      winner: string;
      summary: string;
      ranking: {
        symbol: string;
        name: string;
        rank: number;
        reason: string;
      }[];
      keyTradeoffs: string[];
      winnerSymbol: string;
      winnerName: string;
      winnerScore: number;
      winnerDecision: string;
    };
    metadata: {
      comparisonProvider: "GEMINI" | "FALLBACK";
      warnings: string[];
      dataQuality: {
        financialSources: string[];
        newsSources: string[];
        memoProviders: string[];
        companiesUsingMockNews: string[];
        companiesUsingMockFinancials: string[];
        companiesUsingFallbackMemo: string[];
        hasMockNews: boolean;
        hasMockFinancials: boolean;
        hasFallbackMemo: boolean;
      };
      generatedAt: string;
    };
  };
  error?: string;
};

export async function researchCompany(
  company: string
): Promise<ResearchApiResponse> {
  const response = await fetch("/api/research", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ company }),
  });

  return response.json();
}

export async function compareCompanies(
  companies: string[]
): Promise<ComparisonApiResponse> {
  const response = await fetch("/api/compare", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ companies }),
  });

  return response.json();
}