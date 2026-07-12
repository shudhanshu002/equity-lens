export type UniversalIntent =
  | "SINGLE_COMPANY_RESEARCH"
  | "COMPANY_COMPARISON"
  | "FOLLOW_UP_QUESTION"
  | "LATEST_NEWS"
  | "RECENT_GROWTH"
  | "COMPETITORS"
  | "RISKS"
  | "VALUATION"
  | "DECISION_UPDATE"
  | "SECTOR_RESEARCH"
  | "FOLLOW_COMPANY"
  | "UNSUPPORTED_ASSET"
  | "INVALID_QUERY";

export type UniversalRoute = {
  intent: UniversalIntent;
  companies: string[];
  question: string;
  rawInput: string;
  reason: string;
};

const UNSUPPORTED_ASSETS = [
  "bitcoin",
  "btc",
  "ethereum",
  "crypto",
  "forex",
  "gold",
  "silver",
  "mutual fund",
  "bond",
  "real estate",
];

const SECTOR_WORDS = [
  "sector",
  "industry",
  "theme",
  "market",
  "best companies",
  "top companies",
  "stocks in",
];

export function routeUniversalQuery(input: string): UniversalRoute {
  const rawInput = input.trim();

  if (!rawInput) {
    return {
      intent: "INVALID_QUERY",
      companies: [],
      question: rawInput,
      rawInput,
      reason: "Empty input.",
    };
  }

  const normalized = normalize(rawInput);

  if (rawInput.length < 2) {
    return {
      intent: "INVALID_QUERY",
      companies: [],
      question: rawInput,
      rawInput,
      reason: "Input is too short.",
    };
  }

  if (containsAny(normalized, UNSUPPORTED_ASSETS)) {
    return {
      intent: "UNSUPPORTED_ASSET",
      companies: [],
      question: rawInput,
      rawInput,
      reason: "Unsupported asset class.",
    };
  }

  if (isFollowCompanyIntent(normalized)) {
    return {
      intent: "FOLLOW_COMPANY",
      companies: [extractSingleCompany(rawInput)],
      question: rawInput,
      rawInput,
      reason: "User wants to follow or monitor a company.",
    };
  }

  if (isCompareIntent(normalized)) {
    return {
      intent: "COMPANY_COMPARISON",
      companies: extractCompareCompanies(rawInput),
      question: rawInput,
      rawInput,
      reason: "Comparison intent detected.",
    };
  }

  if (containsAny(normalized, SECTOR_WORDS)) {
    return {
      intent: "SECTOR_RESEARCH",
      companies: [],
      question: rawInput,
      rawInput,
      reason: "Sector or theme research intent detected.",
    };
  }

  if (isLatestNewsIntent(normalized)) {
    return {
      intent: "LATEST_NEWS",
      companies: [extractSingleCompany(rawInput)],
      question: rawInput,
      rawInput,
      reason: "Latest news intent detected.",
    };
  }

  if (isGrowthIntent(normalized)) {
    return {
      intent: "RECENT_GROWTH",
      companies: [extractSingleCompany(rawInput)],
      question: rawInput,
      rawInput,
      reason: "Recent growth intent detected.",
    };
  }

  if (isCompetitorIntent(normalized)) {
    return {
      intent: "COMPETITORS",
      companies: [extractSingleCompany(rawInput)],
      question: rawInput,
      rawInput,
      reason: "Competitor intent detected.",
    };
  }

  if (isRiskIntent(normalized)) {
    return {
      intent: "RISKS",
      companies: [extractSingleCompany(rawInput)],
      question: rawInput,
      rawInput,
      reason: "Risk intent detected.",
    };
  }

  if (isValuationIntent(normalized)) {
    return {
      intent: "VALUATION",
      companies: [extractSingleCompany(rawInput)],
      question: rawInput,
      rawInput,
      reason: "Valuation intent detected.",
    };
  }

  if (isDecisionUpdateIntent(normalized)) {
    return {
      intent: "DECISION_UPDATE",
      companies: [extractSingleCompany(rawInput)],
      question: rawInput,
      rawInput,
      reason: "Investment decision update intent detected.",
    };
  }

  const company = extractSingleCompany(rawInput);

  if (!company) {
    return {
      intent: "INVALID_QUERY",
      companies: [],
      question: rawInput,
      rawInput,
      reason: "No company or research target detected.",
    };
  }

  return {
    intent: "SINGLE_COMPANY_RESEARCH",
    companies: [company],
    question: rawInput,
    rawInput,
    reason: "Defaulted to single company research.",
  };
}

function isCompareIntent(text: string) {
  const looksLikeCompanyList =
    text.split(",").map((item) => item.trim()).filter(Boolean).length >= 2;
  const shortAndList =
    text.includes(" and ") && text.split(/\s+/).length <= 8 && !text.includes("?");

  return (
    looksLikeCompanyList ||
    shortAndList ||
    text.includes("compare") ||
    text.includes(" vs ") ||
    text.includes(" versus ") ||
    text.includes("better than") ||
    text.includes("which is better") ||
    text.includes(" between ")
  );
}

function isFollowCompanyIntent(text: string) {
  return (
    text.startsWith("follow ") ||
    text.includes("follow news") ||
    text.includes("track ") ||
    text.includes("monitor ")
  );
}

function isLatestNewsIntent(text: string) {
  return (
    text.includes("latest news") ||
    text.includes("recent news") ||
    text.includes("news about") ||
    text.includes("what happened")
  );
}

function isGrowthIntent(text: string) {
  return (
    text.includes("growth") ||
    text.includes("revenue") ||
    text.includes("profit") ||
    text.includes("earnings") ||
    text.includes("expansion") ||
    text.includes("sales")
  );
}

function isCompetitorIntent(text: string) {
  return (
    text.includes("competitor") ||
    text.includes("competition") ||
    text.includes("rival") ||
    text.includes("peer")
  );
}

function isRiskIntent(text: string) {
  return (
    text.includes("risk") ||
    text.includes("threat") ||
    text.includes("concern") ||
    text.includes("problem") ||
    text.includes("weakness")
  );
}

function isValuationIntent(text: string) {
  return (
    text.includes("valuation") ||
    text.includes("expensive") ||
    text.includes("cheap") ||
    text.includes("market cap") ||
    text.includes("pe ratio") ||
    text.includes("p/e")
  );
}

function isDecisionUpdateIntent(text: string) {
  return (
    text.includes("should i invest") ||
    text.includes("should i buy") ||
    text.includes("still invest") ||
    text.includes("decision changed") ||
    text.includes("change decision") ||
    text.includes("case changed") ||
    text.includes("investment case")
  );
}

function extractCompareCompanies(input: string) {
  let value = cleanInputPrefix(input);

  value = value
    .replace(/^compare\s+/i, "")
    .replace(/^which is better\s+/i, "")
    .replace(/^between\s+/i, "")
    .trim();

  return value
    .split(/,| vs | versus | and /i)
    .map((company) => cleanCompanyName(company))
    .filter(Boolean)
    .slice(0, 4);
}

function extractSingleCompany(input: string) {
  let value = cleanInputPrefix(input);

  const patterns: RegExp[] = [
    /^latest news about\s+/i,
    /^recent news about\s+/i,
    /^news about\s+/i,
    /^what happened with\s+/i,
    /^what happened to\s+/i,
    /^growth of\s+/i,
    /^recent growth of\s+/i,
    /^competitors of\s+/i,
    /^who are competitors of\s+/i,
    /^risks of\s+/i,
    /^valuation of\s+/i,
    /^follow news about\s+/i,
    /^follow\s+/i,
    /^track\s+/i,
    /^monitor\s+/i,
    /^analyze\s+/i,
    /^analyse\s+/i,
    /^research\s+/i,
    /^evaluate\s+/i,
    /^investment (?:tips|advice) (?:for|about)\s+/i,
    /^give (?:me )?investment (?:tips|advice) (?:for|about)\s+/i,
    /^should i invest in\s+/i,
    /^should i buy\s+/i,
    /^is\s+/i,
  ];

  for (const pattern of patterns) {
    value = value.replace(pattern, "").trim();
  }

  value = value
    .replace(/\s+a good investment\??$/i, "")
    .replace(/\s+a good stock\??$/i, "")
    .replace(/\s+a good long[\s-]?term stock\??$/i, "")
    .replace(/\s+fundamentals\??$/i, "")
    .replace(/\s+financials\??$/i, "")
    .replace(/\?+$/g, "")
    .trim();

  return cleanCompanyName(value);
}

function cleanInputPrefix(input: string) {
  return input
    .trim()
    .replace(/^please\s+/i, "")
    .replace(/^can you\s+/i, "")
    .replace(/^could you\s+/i, "")
    .replace(/^tell me\s+/i, "")
    .replace(/^show me\s+/i, "")
    .replace(/^give me\s+/i, "")
    .replace(/\s+/g, " ");
}

function cleanCompanyName(value: string) {
  return value
    .trim()
    .replace(/^about\s+/i, "")
    .replace(/^for\s+/i, "")
    .replace(/^of\s+/i, "")
    .replace(/\?+$/g, "")
    .trim();
}

function containsAny(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}
