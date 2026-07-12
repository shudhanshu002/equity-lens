export type ResearchInputValidationResult =
  | {
      valid: true;
      originalInput: string;
      companyQuery: string;
      normalizedPrompt: string;
      detectedIntent: "RESEARCH";
    }
  | {
      valid: false;
      originalInput: string;
      error: string;
      reason:
        | "EMPTY_INPUT"
        | "TOO_SHORT"
        | "TOO_LONG"
        | "NON_RESEARCH_INTENT"
        | "COMPARE_INTENT"
        | "UNSUPPORTED_ASSET"
        | "NO_COMPANY_FOUND";
    };

const RESEARCH_WORDS = [
  "analyze",
  "analyse",
  "research",
  "fundamental",
  "fundamentals",
  "stock",
  "stocks",
  "company",
  "invest",
  "investment",
  "long term",
  "long-term",
  "buy",
  "good",
  "health",
  "valuation",
  "financial",
  "financials",
  "shares",
  "equity",
];

const COMPARE_WORDS = [
  "compare",
  "versus",
  "vs",
  "better than",
  "which is better",
  "between",
];

const UNSUPPORTED_ASSET_WORDS = [
  "bitcoin",
  "btc",
  "crypto",
  "ethereum",
  "eth",
  "forex",
  "gold",
  "silver",
  "mutual fund",
  "etf",
  "real estate",
  "house",
  "property",
  "bond",
  "bonds",
];

const NON_RESEARCH_WORDS = [
  "weather",
  "poem",
  "story",
  "joke",
  "recipe",
  "song",
  "movie",
  "travel",
  "hotel",
];

export function validateResearchInput(
  rawInput: unknown
): ResearchInputValidationResult {
  const originalInput = typeof rawInput === "string" ? rawInput.trim() : "";

  if (!originalInput) {
    return {
      valid: false,
      originalInput,
      reason: "EMPTY_INPUT",
      error: "Please enter a company name or research question.",
    };
  }

  if (originalInput.length < 2) {
    return {
      valid: false,
      originalInput,
      reason: "TOO_SHORT",
      error: "Input is too short. Try a company name like Nvidia or Apple.",
    };
  }

  if (originalInput.length > 180) {
    return {
      valid: false,
      originalInput,
      reason: "TOO_LONG",
      error:
        "Input is too long. Please enter one company name or a short research question.",
    };
  }

  const normalizedPrompt = normalizeText(originalInput);

  if (containsAny(normalizedPrompt, UNSUPPORTED_ASSET_WORDS)) {
    return {
      valid: false,
      originalInput,
      reason: "UNSUPPORTED_ASSET",
      error:
        "EquityLens currently supports public company equity research, not crypto, commodities, forex, ETFs, bonds, or real estate.",
    };
  }

  if (containsAny(normalizedPrompt, NON_RESEARCH_WORDS)) {
    return {
      valid: false,
      originalInput,
      reason: "NON_RESEARCH_INTENT",
      error:
        "This does not look like an investment research question. Try: Analyze Nvidia.",
    };
  }

  if (isCompareIntent(normalizedPrompt)) {
    return {
      valid: false,
      originalInput,
      reason: "COMPARE_INTENT",
      error:
        "This looks like a comparison question. Please use the Compare page for multi-company analysis.",
    };
  }

  const companyQuery = extractCompanyQuery(originalInput);

  if (!companyQuery) {
    return {
      valid: false,
      originalInput,
      reason: "NO_COMPANY_FOUND",
      error:
        "I could not detect a company name. Try: Analyze Nvidia, Research Apple fundamentals, or Should I invest in Microsoft?",
    };
  }

  const hasResearchIntent =
    containsAny(normalizedPrompt, RESEARCH_WORDS) ||
    looksLikeCompanyName(companyQuery);

  if (!hasResearchIntent) {
    return {
      valid: false,
      originalInput,
      reason: "NON_RESEARCH_INTENT",
      error:
        "Please ask a company research question. Example: Research Apple fundamentals.",
    };
  }

  return {
    valid: true,
    originalInput,
    companyQuery,
    normalizedPrompt,
    detectedIntent: "RESEARCH",
  };
}

function extractCompanyQuery(input: string) {
  let value = input.trim();

  const cleanupPatterns: RegExp[] = [
    /^please\s+/i,
    /^can you\s+/i,
    /^could you\s+/i,
    /^analyze\s+/i,
    /^analyse\s+/i,
    /^research\s+/i,
    /^check\s+/i,
    /^evaluate\s+/i,
    /^tell me about\s+/i,
    /^give me\s+/i,
    /^give me an investment report for\s+/i,
    /^investment report for\s+/i,
    /^research report for\s+/i,
    /^should i invest in\s+/i,
    /^should we invest in\s+/i,
    /^is\s+/i,
    /\s+a good long[\s-]?term stock\??$/i,
    /\s+a good investment\??$/i,
    /\s+good for long[\s-]?term\??$/i,
    /\s+fundamentals\??$/i,
    /\s+financials\??$/i,
    /\s+stock\??$/i,
    /\s+shares\??$/i,
    /\s+company\??$/i,
    /\?+$/i,
  ];

  for (const pattern of cleanupPatterns) {
    value = value.replace(pattern, "").trim();
  }

  value = value.replace(/\s+/g, " ").trim();

  if (!value) return null;

  const lower = value.toLowerCase();

  if (
    lower.includes(" and ") ||
    lower.includes(",") ||
    lower.includes(" vs ") ||
    lower.includes(" versus ")
  ) {
    return null;
  }

  if (!looksLikeCompanyName(value)) return null;

  return value;
}

function isCompareIntent(normalizedPrompt: string) {
  if (containsAny(normalizedPrompt, COMPARE_WORDS)) return true;

  const separators = [" and ", ",", " vs ", " versus "];

  return separators.some((separator) => normalizedPrompt.includes(separator));
}

function looksLikeCompanyName(value: string) {
  const cleaned = value.trim();

  if (!cleaned) return false;
  if (cleaned.length < 2) return false;
  if (cleaned.length > 80) return false;
  if (!/[a-zA-Z]/.test(cleaned)) return false;

  const wordCount = cleaned.split(/\s+/).filter(Boolean).length;

  if (wordCount > 8) return false;

  return true;
}

function containsAny(text: string, words: string[]) {
  return words.some((word) => containsPhrase(text, word));
}

function containsPhrase(text: string, phrase: string) {
  const normalizedPhrase = normalizeText(phrase);

  if (!normalizedPhrase) return false;

  const escaped = normalizedPhrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(^|\\s)${escaped}(\\s|$|\\?|\\.|,|!)`, "i");

  return regex.test(text);
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/&amp;/g, "&")
    .replace(/[^a-z0-9\s.&-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
