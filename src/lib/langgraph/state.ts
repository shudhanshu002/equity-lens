import { Annotation } from "@langchain/langgraph";
import {
  CompanyProfile,
  FinancialSnapshot,
  InvestmentDecision,
  NewsItem,
  ResearchMetadata,
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

  metadata: Annotation<ResearchMetadata>({
    reducer: (current, update) => {
      return {
        agentVersion: update.agentVersion ?? current.agentVersion,
        financialDataSource:
          update.financialDataSource ?? current.financialDataSource,
        newsDataSource: update.newsDataSource ?? current.newsDataSource,
        memoProvider: update.memoProvider ?? current.memoProvider,
        warnings: [...current.warnings, ...update.warnings],
        trace: [...current.trace, ...update.trace],
      };
    },
    default: () => ({
      agentVersion: "1.0.0",
      warnings: [],
      trace: [],
    }),
  }),
});