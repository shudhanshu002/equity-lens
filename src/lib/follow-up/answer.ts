import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import type { CompanyProfile } from "@/lib/types/research";
import type { FollowUpIntent } from "@/lib/follow-up/intent";
import type { FollowUpSource } from "@/lib/follow-up/research";

export type FollowUpAnswer = {
  answer: string;
  keyPoints: string[];
  sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE" | "MIXED";
  decisionImpact:
    | "IMPROVES_CASE"
    | "WEAKENS_CASE"
    | "NO_MAJOR_CHANGE"
    | "INSUFFICIENT_DATA";
  followUpQuestions: string[];
};

export async function generateFollowUpAnswer(params: {
  company: CompanyProfile;
  question: string;
  intent: FollowUpIntent;
  sources: FollowUpSource[];
  previousDecision?: string;
  previousScore?: number;
  previousNews?: unknown;
  previousFinancials?: unknown;
}): Promise<FollowUpAnswer> {
  if (!process.env.GOOGLE_API_KEY) {
    return buildFallbackAnswer(params);
  }

  try {
    const model = new ChatGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY,
      model: process.env.GOOGLE_MODEL ?? "gemini-2.5-flash",
      temperature: 0.2,
    });

    const prompt = buildPrompt(params);
    const response = await model.invoke(prompt);
    const text = String(response.content);

    return parseJsonAnswer(text);
  } catch {
    return buildFallbackAnswer(params);
  }
}

function buildPrompt(params: {
  company: CompanyProfile;
  question: string;
  intent: FollowUpIntent;
  sources: FollowUpSource[];
  previousDecision?: string;
  previousScore?: number;
  previousNews?: unknown;
  previousFinancials?: unknown;
}) {
  return `
You are EquityLens AI, an investment research assistant.

Answer the user's follow-up question using only the provided company profile, previous report context, and research sources.

Rules:
- Do not invent facts.
- If the sources do not support something, say the evidence is limited.
- Give an investment-oriented answer.
- Keep the answer practical and structured.
- Mention whether the new information is positive, negative, mixed, or insufficient.
- If asked about competitors, list competitors only when supported by the sources.
- If asked whether the decision changed, compare against the previous decision and explain why.

Company:
${JSON.stringify(params.company, null, 2)}

Previous decision:
${params.previousDecision ?? "Not provided"}

Previous score:
${params.previousScore ?? "Not provided"}

Previous financials:
${JSON.stringify(params.previousFinancials ?? null, null, 2)}

Previous news:
${JSON.stringify(params.previousNews ?? null, null, 2)}

Intent:
${params.intent}

User question:
${params.question}

New research sources:
${JSON.stringify(params.sources, null, 2)}

Return only valid JSON:
{
  "answer": string,
  "keyPoints": string[],
  "sentiment": "POSITIVE" | "NEUTRAL" | "NEGATIVE" | "MIXED",
  "decisionImpact": "IMPROVES_CASE" | "WEAKENS_CASE" | "NO_MAJOR_CHANGE" | "INSUFFICIENT_DATA",
  "followUpQuestions": string[]
}
`;
}

function parseJsonAnswer(text: string): FollowUpAnswer {
  const cleaned = text.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");

    if (firstBrace >= 0 && lastBrace > firstBrace) {
      return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
    }

    return {
      answer: cleaned,
      keyPoints: [],
      sentiment: "NEUTRAL",
      decisionImpact: "INSUFFICIENT_DATA",
      followUpQuestions: [],
    };
  }
}

function buildFallbackAnswer(params: {
  company: CompanyProfile;
  question: string;
  intent: FollowUpIntent;
  sources: FollowUpSource[];
}): FollowUpAnswer {
  const sourceText = params.sources
    .slice(0, 4)
    .map((source) => `• ${source.title}: ${source.summary}`)
    .join("\n");

  return {
    answer: `I found limited research signals for ${params.company.name}. Based on the available sources, the answer to "${params.question}" requires caution because the evidence may be incomplete.\n\n${sourceText}`,
    keyPoints: params.sources.slice(0, 4).map((source) => source.title),
    sentiment: "NEUTRAL",
    decisionImpact: "INSUFFICIENT_DATA",
    followUpQuestions: [
      `What are the key risks for ${params.company.name}?`,
      `What is the recent growth trend for ${params.company.name}?`,
      `Who are ${params.company.name}'s main competitors?`,
    ],
  };
}