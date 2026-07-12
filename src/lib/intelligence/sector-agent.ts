import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { fetchGeneralCompanyResearch } from "@/lib/services/company-research";

export async function runSectorResearch(query: string) {
  const sources = await fetchGeneralCompanyResearch(
    `${query} sector outlook major listed companies growth risks market share investment`,
    {
      rawQuery: true,
      num: 10,
    }
  );

  if (!process.env.GOOGLE_API_KEY) {
    return {
      thesis: `Sector research for "${query}" was generated with limited AI coverage.`,
      keyCompanies: [],
      opportunities: [],
      risks: [],
      watchlistIdeas: [],
      dataLimitations: ["Missing GOOGLE_API_KEY."],
      sources,
    };
  }

  const model = new ChatGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY,
    model: process.env.GOOGLE_MODEL ?? "gemini-2.5-flash",
    temperature: 0.2,
  });

  const prompt = `
You are EquityLens AI, a sector investment research agent.

The user asked:
${query}

Use only the sources below. Do not invent facts.

Return only valid JSON:
{
  "thesis": string,
  "keyCompanies": [
    {
      "name": string,
      "reason": string
    }
  ],
  "opportunities": string[],
  "risks": string[],
  "watchlistIdeas": string[],
  "dataLimitations": string[]
}

Sources:
${JSON.stringify(sources, null, 2)}
`;

  try {
    const response = await model.invoke(prompt);
    const text = String(response.content);

    return {
      ...parseJson(text),
      sources,
    };
  } catch {
    return {
      thesis: `Unable to generate full sector memo for "${query}", but sources were fetched.`,
      keyCompanies: [],
      opportunities: [],
      risks: [],
      watchlistIdeas: [],
      dataLimitations: ["AI memo generation failed."],
      sources,
    };
  }
}

function parseJson(text: string) {
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
      thesis: cleaned,
      keyCompanies: [],
      opportunities: [],
      risks: [],
      watchlistIdeas: [],
      dataLimitations: [],
    };
  }
}
