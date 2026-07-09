import { Annotation } from "@langchain/langgraph";
import {
  CompanyProfile,
  FinancialSnapshot,
  InvestmentDecision,
  NewsItem,
  ResearchStatus,
  ScoreBreakdown,
} from "@/lib/types/research";

export const ResearchState = Annotation.Root({
  input: Annotation<string>(),

  status: Annotation<ResearchStatus>(),

  company: Annotation<CompanyProfile | null>(),

  financials: Annotation<FinancialSnapshot | null>(),

  news: Annotation<NewsItem[]>({
    reducer: (_current, update) => update,
    default: () => [],
  }),

  score: Annotation<ScoreBreakdown | null>(),

  decision: Annotation<InvestmentDecision | null>(),

  confidence: Annotation<number>(),

  thesis: Annotation<string>(),

  bullCase: Annotation<string[]>({
    reducer: (_current, update) => update,
    default: () => [],
  }),

  bearCase: Annotation<string[]>({
    reducer: (_current, update) => update,
    default: () => [],
  }),

  risks: Annotation<string[]>({
    reducer: (_current, update) => update,
    default: () => [],
  }),

  whatWouldChangeDecision: Annotation<string[]>({
    reducer: (_current, update) => update,
    default: () => [],
  }),
});