import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import type { FollowUpIntent } from "@/lib/follow-up/intent";
import type { FollowUpSource } from "@/lib/follow-up/research";
import type { CompanyProfile } from "@/lib/types/research";

type ResearchByCompany = {
  company: CompanyProfile;
  sources: FollowUpSource[];
};

export type CompareFollowUpAnswer = {
  answer: string;
  winner?: {
    symbol: string;
    name: string;
    reason: string;
  } | null;
  keyPoints: string[];
  sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE" | "MIXED";
  decisionImpact:
    | "IMPROVES_CASE"
    | "WEAKENS_CASE"
    | "NO_MAJOR_CHANGE"
    | "INSUFFICIENT_DATA";
  followUpQuestions: string[];
};

export async function generateCompareFollowUpAnswer(params: {
  question: string;
  intent: FollowUpIntent;
  researchByCompany: ResearchByCompany[];
  previousComparison?: unknown;
  previousReports?: unknown;
}): Promise<CompareFollowUpAnswer> {
  if (!process.env.GOOGLE_API_KEY) {
    return buildFallbackAnswer(params);
  }

  try {
    const model = new ChatGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY,
      model: process.env.GOOGLE_MODEL ?? "gemini-2.5-flash",
      temperature: 0.2,
    });

    const prompt = `
You are EquityLens AI, an investment comparison assistant.

Answer the user's comparison follow-up question using only the provided previous comparison context and new research sources.

Rules:
- Do not invent facts.
- If data is missing for one company, say so.
- Compare fairly even if coverage differs.
- If asked which is better, pick a winner only when supported.
- If evidence is mixed, say it is mixed.
- Mention source-backed reasons.

User question:
${params.question}

Intent:
${params.intent}

Previous comparison:
${JSON.stringify(params.previousComparison ?? null, null, 2)}

Previous reports:
${JSON.stringify(params.previousReports ?? null, null, 2)}

New research by company:
${JSON.stringify(params.researchByCompany, null, 2)}

Return only valid JSON:
{
  "answer": string,
  "winner": {
    "symbol": string,
    "name": string,
    "reason": string
  } | null,
  "keyPoints": string[],
  "sentiment": "POSITIVE" | "NEUTRAL" | "NEGATIVE" | "MIXED",
  "decisionImpact": "IMPROVES_CASE" | "WEAKENS_CASE" | "NO_MAJOR_CHANGE" | "INSUFFICIENT_DATA",
  "followUpQuestions": string[]
}
`;

    const response = await model.invoke(prompt);
    const text = String(response.content);

    return parseJsonAnswer(text);
  } catch {
    return buildFallbackAnswer(params);
  }
}

function parseJsonAnswer(text: string): CompareFollowUpAnswer {
  const cleaned = text.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const first = cleaned.indexOf("{");
    const last = cleaned.lastIndexOf("}");

    if (first >= 0 && last > first) {
      return JSON.parse(cleaned.slice(first, last + 1));
    }

    return {
      answer: cleaned,
      winner: null,
      keyPoints: [],
      sentiment: "NEUTRAL",
      decisionImpact: "INSUFFICIENT_DATA",
      followUpQuestions: [],
    };
  }
}

function buildFallbackAnswer(params: {
  question: string;
  researchByCompany: ResearchByCompany[];
}): CompareFollowUpAnswer {
  const names = params.researchByCompany
    .map((item) => item.company.name)
    .join(", ");

  return {
    answer: `I found limited comparison evidence for ${names}. The question "${params.question}" needs stronger source coverage before making a confident comparison.`,
    winner: null,
    keyPoints: params.researchByCompany.flatMap((item) =>
      item.sources.slice(0, 2).map((source) => `${item.company.name}: ${source.title}`)
    ),
    sentiment: "MIXED",
    decisionImpact: "INSUFFICIENT_DATA",
    followUpQuestions: [
      "Which company has stronger growth?",
      "Which company has lower risk?",
      "Which company has better valuation?",
    ],
  };
}
