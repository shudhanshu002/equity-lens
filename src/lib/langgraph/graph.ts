import { END, START, StateGraph } from "@langchain/langgraph";
import { ResearchState } from "@/lib/langgraph/state";
import { fetchFinancialsNode } from "@/lib/langgraph/nodes/fetch-financials";
import { fetchNewsNode } from "@/lib/langgraph/nodes/fetch-news";
import { generateDecisionNode } from "@/lib/langgraph/nodes/generate-decision";
import { resolveCompanyNode } from "@/lib/langgraph/nodes/resolve-company";
import { scoreCompanyNode } from "@/lib/langgraph/nodes/score-company";
import type {
  EvidenceSource,
  FinancialSnapshot,
  NewsItem,
  ResearchMetadata,
  ValuationAssessment,
} from "@/lib/types/research";

export function createResearchGraph() {
  const workflow = new StateGraph(ResearchState)
    .addNode("resolveCompany", resolveCompanyNode)
    .addNode("fetchFinancials", fetchFinancialsNode)
    .addNode("fetchNews", fetchNewsNode)
    .addNode("scoreCompany", scoreCompanyNode)
    .addNode("generateDecision", generateDecisionNode)
    .addEdge(START, "resolveCompany")
    .addEdge("resolveCompany", "fetchFinancials")
    .addEdge("fetchFinancials", "fetchNews")
    .addEdge("fetchNews", "scoreCompany")
    .addEdge("scoreCompany", "generateDecision")
    .addEdge("generateDecision", END);

  return workflow.compile();
}

export async function runInvestmentResearch(input: string) {
  const graph = createResearchGraph();

  const result = await graph.invoke({
    input,
    status: "PENDING",
    company: null,
    financials: null,
    news: [],
    score: null,
    decision: null,
    confidence: 0,
    thesis: "",
    bullCase: [],
    bearCase: [],
    risks: [],
    whatWouldChangeDecision: [],
    catalysts: [],
    monitoringTriggers: [],
    metadata: {
      agentVersion: "1.0.0",
      warnings: [],
      trace: [],
    },
  });

  const generatedAt = new Date();
  const citationValidation = validateCitations(result, result.news?.length ?? 0);
  return {
    ...result,
    valuationAssessment: buildValuationAssessment(result.financials ?? {}),
    sources: buildEvidenceSources(result.news ?? [], result.metadata),
    metadata: {
      ...result.metadata,
      scoringModelVersion: "2.0.0",
      promptVersion: "2.0.0",
      dataRetrievedAt: generatedAt.toISOString(),
      staleAfter: new Date(generatedAt.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      citationValidation,
      warnings: [
        ...result.metadata.warnings,
        ...(citationValidation.invalidIds.length ? [`The AI memo contained invalid citation identifiers: ${citationValidation.invalidIds.join(", ")}. Review cited claims before relying on them.`] : []),
      ],
    },
    generatedAt: generatedAt.toISOString(),
  };
}

function validateCitations(result: { thesis?: string; bullCase?: string[]; bearCase?: string[]; risks?: string[]; whatWouldChangeDecision?: string[] }, newsCount: number) {
  const text = [result.thesis, ...(result.bullCase ?? []), ...(result.bearCase ?? []), ...(result.risks ?? []), ...(result.whatWouldChangeDecision ?? [])].join(" ");
  const referencedIds = Array.from(new Set(Array.from(text.matchAll(/\[N(\d+)\]/g)).map((match) => `N${match[1]}`)));
  const invalidIds = referencedIds.filter((id) => {
    const number = Number(id.slice(1));
    return number < 1 || number > newsCount;
  });
  return { valid: invalidIds.length === 0, referencedIds, invalidIds };
}

function buildValuationAssessment(financials: FinancialSnapshot): ValuationAssessment {
  const pe = financials.forwardPe ?? financials.peRatio;
  const peg = financials.pegRatio;
  const status = pe === undefined
    ? "UNKNOWN"
    : pe > 45 || (peg !== undefined && peg > 2.5)
      ? "EXPENSIVE"
      : pe < 20 && (peg === undefined || peg < 1.5)
        ? "ATTRACTIVE"
        : "FAIR";
  const summary = status === "UNKNOWN"
    ? "A defensible valuation view cannot be formed from the available multiples."
    : status === "EXPENSIVE"
      ? "Current multiples imply strong future execution and leave less room for disappointment."
      : status === "ATTRACTIVE"
        ? "Available multiples appear moderate relative to tracked growth, subject to earnings quality."
        : "Available multiples are neither clearly cheap nor clearly excessive on their own.";

  return {
    status,
    summary,
    scenarios: [
      { name: "BEAR", assumptions: ["Growth slows", "Margins compress", "Valuation multiple contracts"], signal: "The case weakens if operating results miss expectations while valuation remains elevated." },
      { name: "BASE", assumptions: ["Current growth broadly persists", "Margins remain stable", "No major balance-sheet deterioration"], signal: "The recommendation follows the current score and evidence quality." },
      { name: "BULL", assumptions: ["Growth exceeds the recent trend", "Margins expand", "Cash conversion remains healthy"], signal: "Upside improves only when stronger execution is confirmed in reported results." },
    ],
  };
}

function buildEvidenceSources(news: NewsItem[], metadata: ResearchMetadata): EvidenceSource[] {
  const sources: EvidenceSource[] = [];
  if (metadata.financialDataSource === "SEC_EDGAR") {
    sources.push({ id: "financial-sec", category: "FILING", title: "SEC EDGAR Company Facts and issuer filings", provider: "SEC EDGAR", url: "https://www.sec.gov/search-filings" });
  }
  if (metadata.financialDataSource === "ALPHA_VANTAGE") {
    sources.push({ id: "financial-alpha", category: "FINANCIAL", title: "Company overview and fundamental metrics", provider: "Alpha Vantage", url: "https://www.alphavantage.co/documentation/" });
  }
  news.forEach((item, index) => sources.push({ id: `news-${index}`, category: "NEWS", title: item.headline, provider: item.source, url: item.url, publishedAt: item.publishedAt }));
  sources.push({ id: "ai-synthesis", category: "AI_SYNTHESIS", title: "Investment memo synthesized from supplied evidence", provider: metadata.memoProvider ?? "Fallback reasoning" });
  return sources;
}
