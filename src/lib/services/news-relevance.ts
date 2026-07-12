type CompanyLike = {
  symbol: string;
  name: string;
  sector?: string;
  industry?: string;
};

type NewsLike = {
  headline: string;
  summary?: string;
  source?: string;
  url?: string;
  publishedAt?: string;
  sentiment?: string;
};

const GENERIC_MARKET_WORDS = new Set([
  "stock",
  "stocks",
  "market",
  "markets",
  "investor",
  "investors",
  "earnings",
  "shares",
  "nasdaq",
  "nyse",
  "growth",
  "dividend",
  "buy",
  "sell",
  "portfolio",
  "wall",
  "street",
]);

const COMPANY_ALIASES: Record<string, string[]> = {
  NVDA: [
    "nvidia",
    "nvda",
    "gpu",
    "gpus",
    "ai chip",
    "ai chips",
    "accelerator",
    "accelerators",
    "data center",
    "semiconductor",
  ],
  AAPL: [
    "apple",
    "aapl",
    "iphone",
    "ipad",
    "mac",
    "ios",
    "app store",
    "tim cook",
  ],
  MSFT: [
    "microsoft",
    "msft",
    "azure",
    "windows",
    "office",
    "copilot",
    "xbox",
    "openai",
  ],
  TSLA: [
    "tesla",
    "tsla",
    "elon musk",
    "ev",
    "electric vehicle",
    "electric vehicles",
    "model y",
    "model 3",
    "cybertruck",
  ],
  AMZN: [
    "amazon",
    "amzn",
    "aws",
    "prime",
    "ecommerce",
    "e-commerce",
    "andy jassy",
  ],
  GOOGL: [
    "alphabet",
    "google",
    "googl",
    "youtube",
    "gemini",
    "android",
    "cloud",
  ],
  META: [
    "meta",
    "facebook",
    "instagram",
    "whatsapp",
    "threads",
    "metaverse",
  ],
  NFLX: ["netflix", "nflx", "streaming", "subscriber", "subscribers"],
};

export function filterRelevantCompanyNews<T extends NewsLike>(
  articles: T[],
  company: CompanyLike,
  options?: {
    minArticles?: number;
    maxArticles?: number;
  }
) {
  const minArticles = options?.minArticles ?? 3;
  const maxArticles = options?.maxArticles ?? 8;

  const scored = articles
    .map((article) => ({
      article,
      score: getNewsRelevanceScore(article, company),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  const filtered = scored.map((item) => item.article).slice(0, maxArticles);

  return {
    articles: filtered,
    removedCount: Math.max(0, articles.length - filtered.length),
    hasEnoughRelevantNews: filtered.length >= minArticles,
  };
}

function getNewsRelevanceScore(article: NewsLike, company: CompanyLike) {
  const text = normalizeText(
    `${article.headline ?? ""} ${article.summary ?? ""}`
  );

  if (!text) return 0;

  const symbol = normalizeText(company.symbol);
  const companyName = normalizeText(company.name);
  const shortCompanyName = getShortCompanyName(company.name);
  const aliases = getCompanyAliases(company);

  let score = 0;

  if (containsToken(text, symbol)) score += 10;
  if (companyName && text.includes(companyName)) score += 10;
  if (shortCompanyName && text.includes(shortCompanyName)) score += 10;

  for (const alias of aliases) {
    if (text.includes(alias)) {
      score += alias.length > 6 ? 4 : 2;
    }
  }

  const industryTerms = getIndustryTerms(company);

  for (const term of industryTerms) {
    if (text.includes(term)) {
      score += 1;
    }
  }

  const hasDirectCompanyMatch =
    containsToken(text, symbol) ||
    Boolean(companyName && text.includes(companyName)) ||
    Boolean(shortCompanyName && text.includes(shortCompanyName));

  const hasStrongAliasMatch = aliases.some(
    (alias) => alias.length >= 5 && text.includes(alias)
  );

  const hasOnlyGenericMarketWords = text
    .split(" ")
    .filter(Boolean)
    .every((word) => GENERIC_MARKET_WORDS.has(word));

  if (hasOnlyGenericMarketWords) return 0;

  if (hasDirectCompanyMatch) return score;

  if (hasStrongAliasMatch && score >= 4) return score;

  return 0;
}

function getCompanyAliases(company: CompanyLike) {
  const symbolAliases = COMPANY_ALIASES[company.symbol.toUpperCase()] ?? [];

  const nameTokens = getMeaningfulTokens(company.name);

  return Array.from(
    new Set([
      ...symbolAliases.map(normalizeText),
      ...nameTokens,
      normalizeText(company.symbol),
      getShortCompanyName(company.name),
    ])
  ).filter(Boolean);
}

function getIndustryTerms(company: CompanyLike) {
  const combined = normalizeText(`${company.sector ?? ""} ${company.industry ?? ""}`);

  const terms: string[] = [];

  if (combined.includes("semiconductor")) {
    terms.push("semiconductor", "chip", "chips", "gpu", "data center");
  }

  if (combined.includes("software")) {
    terms.push("software", "cloud", "enterprise", "ai");
  }

  if (combined.includes("consumer electronics")) {
    terms.push("iphone", "hardware", "smartphone", "device", "chip");
  }

  if (combined.includes("auto")) {
    terms.push("ev", "electric vehicle", "vehicle", "automaker");
  }

  if (combined.includes("streaming")) {
    terms.push("streaming", "subscriber", "content");
  }

  return terms;
}

function getShortCompanyName(name: string) {
  return normalizeText(name)
    .replace(/\bcorporation\b/g, "")
    .replace(/\bcorp\b/g, "")
    .replace(/\bincorporated\b/g, "")
    .replace(/\binc\b/g, "")
    .replace(/\bltd\b/g, "")
    .replace(/\bplc\b/g, "")
    .replace(/\bcompany\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getMeaningfulTokens(name: string) {
  return getShortCompanyName(name)
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token.length >= 4)
    .filter((token) => !GENERIC_MARKET_WORDS.has(token));
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/&amp;/g, "&")
    .replace(/[^a-z0-9$.\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function containsToken(text: string, token: string) {
  const normalizedToken = normalizeText(token);

  if (!normalizedToken) return false;

  const escaped = normalizedToken.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(^|\\s|\\(|\\[|:)${escaped}(\\s|\\)|\\]|,|\\.|$)`, "i");

  return regex.test(text);
}