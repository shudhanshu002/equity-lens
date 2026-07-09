import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { z } from "zod";
import {
  CompanyProfile,
  FinancialSnapshot,
  InvestmentDecision,
  NewsItem,
  ScoreBreakdown,
} from "@/lib/types/research";

const AnalystMemoSchema = z.object({
  thesis: z
    .string()
    .describe("One concise paragraph explaining the investment decision."),
  bullCase: z
    .array(z.string())
    .min(3)
    .max(5)
    .describe("Three to five bullish arguments."),
  bearCase: z
    .array(z.string())
    .min(3)
    .max(5)
    .describe("Three to five bearish arguments."),
  risks: z
    .array(z.string())
    .min(3)
    .max(6)
    .describe("Three to six key investment risks."),
  whatWouldChangeDecision: z
    .array(z.string())
    .min(3)
    .max(6)
    .describe("Three to six factors that could change the decision."),
});

export type AnalystMemo = z.infer<typeof AnalystMemoSchema>;

type GenerateAnalystMemoInput = {
  company: CompanyProfile;
  financials: FinancialSnapshot;
  news: NewsItem[];
  score: ScoreBreakdown;
  decision: InvestmentDecision;
};

function buildFallbackMemo(input: GenerateAnalystMemoInput): AnalystMemo {
  const { company, financials, score, decision } = input;

  const thesis =
    decision === "INVEST"
      ? `${company.name} is rated INVEST with a score of ${score.total}. The company shows enough quality, growth, and financial strength to justify a positive investment view, while still requiring monitoring of valuation and execution risks.`
      : decision === "WATCHLIST"
        ? `${company.name} is rated WATCHLIST with a score of ${score.total}. The business has some attractive qualities, but the current risk/reward is not strong enough for a clear investment call.`
        : `${company.name} is rated PASS with a score of ${score.total}. The current setup does not provide enough margin of safety after considering growth, profitability, balance sheet, valuation, and sentiment.`;

  const risks: string[] = [];

  if ((financials.peRatio ?? 0) > 45) {
    risks.push(
      "Valuation risk is elevated because the company trades at a high earnings multiple."
    );
  }

  if ((financials.priceToSales ?? 0) > 10) {
    risks.push(
      "The price-to-sales ratio suggests investors are already pricing in strong future growth."
    );
  }

  if ((financials.profitMargin ?? 0) < 10) {
    risks.push(
      "Profit margins are relatively low, which can reduce resilience during weaker demand periods."
    );
  }

  if ((financials.revenueGrowthYoY ?? 0) < 5) {
    risks.push(
      "Revenue growth appears limited, which may cap upside if valuation is already demanding."
    );
  }

  if ((financials.debtToEquity ?? 0) > 1.5) {
    risks.push(
      "Leverage is elevated, which may reduce flexibility if business conditions worsen."
    );
  }

  return {
    thesis,
    bullCase: [
      "Revenue growth continues or improves from current levels.",
      "Margins remain resilient despite competition and macro pressure.",
      "The company continues converting business strength into shareholder value.",
    ],
    bearCase: [
      "Growth slows faster than investors expect.",
      "Valuation multiple compresses if earnings momentum weakens.",
      "Competitive, regulatory, or execution risks reduce profitability.",
    ],
    risks:
      risks.length >= 3
        ? risks
        : [
            ...risks,
            "The investment case depends on future execution matching market expectations.",
            "Market sentiment could weaken if upcoming earnings or guidance disappoint.",
            "The model uses limited public data and should not be treated as financial advice.",
          ].slice(0, 3),
    whatWouldChangeDecision: [
      "A meaningful improvement or deterioration in revenue growth.",
      "A major valuation correction or multiple expansion.",
      "Clear evidence of margin improvement or margin pressure.",
      "A material change in balance sheet strength or free cash flow.",
    ],
  };
}

function compactFinancials(financials: FinancialSnapshot) {
  return {
    revenueGrowthYoY: financials.revenueGrowthYoY,
    profitMargin: financials.profitMargin,
    operatingMargin: financials.operatingMargin,
    returnOnEquity: financials.returnOnEquity,
    debtToEquity: financials.debtToEquity,
    currentRatio: financials.currentRatio,
    freeCashFlowPositive: financials.freeCashFlowPositive,
    peRatio: financials.peRatio,
    forwardPe: financials.forwardPe,
    pegRatio: financials.pegRatio,
    priceToSales: financials.priceToSales,
    eps: financials.eps,
    beta: financials.beta,
  };
}

function compactNews(news: NewsItem[]) {
  return news.slice(0, 5).map((item) => ({
    headline: item.headline,
    summary: item.summary,
    source: item.source,
    sentiment: item.sentiment,
    publishedAt: item.publishedAt,
  }));
}

export async function generateAnalystMemo(
  input: GenerateAnalystMemoInput
): Promise<AnalystMemo> {
  if (!process.env.GOOGLE_API_KEY) {
    return buildFallbackMemo(input);
  }

  try {
    const model = new ChatGoogleGenerativeAI({
      model: process.env.GOOGLE_MODEL ?? "gemini-1.5-flash",
      temperature: 0.2,
      maxRetries: 2,
      apiKey: process.env.GOOGLE_API_KEY,
    });

    const structuredModel = model.withStructuredOutput(AnalystMemoSchema, {
      name: "investment_research_memo",
    });

    const memo = await structuredModel.invoke([
      {
        role: "system",
        content:
          "You are a cautious senior equity research analyst. Write clear investment reasoning based only on the supplied company data. Do not invent financial metrics. Do not provide personalized financial advice. Keep the language professional, specific, and useful for an investment research demo.",
      },
      {
        role: "user",
        content: JSON.stringify(
          {
            task: "Generate an investment research memo.",
            company: input.company,
            financials: compactFinancials(input.financials),
            news: compactNews(input.news),
            score: input.score,
            decision: input.decision,
            rules: [
              "Use only the provided data.",
              "Mention valuation risk if valuation appears expensive.",
              "Mention data limitations where useful.",
              "Do not say this is guaranteed investment advice.",
              "Keep each bullet concise and specific.",
            ],
          },
          null,
          2
        ),
      },
    ]);

    return AnalystMemoSchema.parse(memo);
  } catch (error) {
    console.error("Gemini memo generation failed:", error);
    return buildFallbackMemo(input);
  }
}