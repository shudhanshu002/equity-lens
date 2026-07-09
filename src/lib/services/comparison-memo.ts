import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { z } from "zod";
import { InvestmentResearchReport } from "@/lib/types/research";

const ComparisonMemoSchema = z.object({
  winner: z.string(),
  summary: z.string(),
  ranking: z.array(
    z.object({
      symbol: z.string(),
      name: z.string(),
      rank: z.number(),
      reason: z.string(),
    })
  ),
  keyTradeoffs: z.array(z.string()).min(3).max(6),
});

export type ComparisonMemo = z.infer<typeof ComparisonMemoSchema>;

type ComparisonMemoResult = {
  memo: ComparisonMemo;
  provider: "GEMINI" | "FALLBACK";
  warning?: string;
};

function buildFallbackComparison(reports: InvestmentResearchReport[]): ComparisonMemo {
  const sorted = [...reports].sort((a, b) => b.score.total - a.score.total);
  const winner = sorted[0];

  return {
    winner: winner.company.symbol,
    summary: `${winner.company.name} ranks highest in this comparison with a score of ${winner.score.total}. The ranking is based on the agent's weighted assessment of growth, profitability, balance sheet quality, valuation, and sentiment.`,
    ranking: sorted.map((report, index) => ({
      symbol: report.company.symbol,
      name: report.company.name,
      rank: index + 1,
      reason: `${report.company.name} scored ${report.score.total} with a ${report.decision} decision.`,
    })),
    keyTradeoffs: [
      "Higher growth companies may also carry higher valuation risk.",
      "Strong profitability can offset moderate valuation concerns.",
      "Missing or unavailable data is treated cautiously rather than assumed positive or negative.",
    ],
  };
}

function compactReports(reports: InvestmentResearchReport[]) {
  return reports.map((report) => ({
    company: report.company,
    score: report.score,
    decision: report.decision,
    confidence: report.confidence,
    thesis: report.thesis,
    financials: report.financials,
    risks: report.risks,
    metadata: {
      financialDataSource: report.metadata.financialDataSource,
      newsDataSource: report.metadata.newsDataSource,
      memoProvider: report.metadata.memoProvider,
      warnings: report.metadata.warnings,
    },
  }));
}

export async function generateComparisonMemo(
  reports: InvestmentResearchReport[]
): Promise<ComparisonMemoResult> {
  if (!process.env.GOOGLE_API_KEY) {
    return {
      memo: buildFallbackComparison(reports),
      provider: "FALLBACK",
      warning: "Using fallback comparison because GOOGLE_API_KEY is missing.",
    };
  }

  try {
    const model = new ChatGoogleGenerativeAI({
      model: process.env.GOOGLE_MODEL ?? "gemini-2.5-flash",
      temperature: 0.2,
      maxRetries: 2,
      apiKey: process.env.GOOGLE_API_KEY,
    });

    const structuredModel = model.withStructuredOutput(ComparisonMemoSchema, {
      name: "investment_comparison_memo",
    });

    const memo = await structuredModel.invoke([
      {
        role: "system",
        content:
          "You are a cautious senior equity research analyst. Compare the supplied companies using only the provided reports. Do not invent metrics. Prefer clear trade-offs over hype. This is for an investment research demo, not personalized financial advice.",
      },
      {
        role: "user",
        content: JSON.stringify(
          {
            task: "Compare these investment research reports and choose the strongest candidate.",
            reports: compactReports(reports),
            rules: [
              "Use the score, decision, financials, risks, and metadata.",
              "Mention if data quality is limited.",
              "Do not guarantee returns.",
              "Make ranking clear and explain trade-offs.",
            ],
          },
          null,
          2
        ),
      },
    ]);

    return {
      memo: ComparisonMemoSchema.parse(memo),
      provider: "GEMINI",
    };
  } catch (error) {
    return {
      memo: buildFallbackComparison(reports),
      provider: "FALLBACK",
      warning:
        error instanceof Error
          ? `Using fallback comparison because Gemini failed: ${error.message}`
          : "Using fallback comparison because Gemini failed.",
    };
  }
}