import { END, START, StateGraph } from "@langchain/langgraph";
import { ResearchState } from "@/lib/langgraph/state";
import { fetchFinancialsNode } from "@/lib/langgraph/nodes/fetch-financials";
import { fetchNewsNode } from "@/lib/langgraph/nodes/fetch-news";
import { generateDecisionNode } from "@/lib/langgraph/nodes/generate-decision";
import { resolveCompanyNode } from "@/lib/langgraph/nodes/resolve-company";
import { scoreCompanyNode } from "@/lib/langgraph/nodes/score-company";

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
    metadata: {
      agentVersion: "1.0.0",
      warnings: [],
      trace: [],
    },
  });

  return result;
}