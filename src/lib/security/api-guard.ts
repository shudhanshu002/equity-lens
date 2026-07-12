type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function checkApiRateLimit(request: Request, scope: string, limit = 20, windowMs = 60_000) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const client = forwarded || request.headers.get("x-real-ip") || "anonymous";
  const key = `${scope}:${client}`;
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }
  if (current.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)) };
  }
  current.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

export function safeResearchError(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  if (/alpha vantage|finnhub|serper|sec |api key|rate limit|quota|token/i.test(message)) {
    return "A research data provider is temporarily unavailable or rate-limited. Try again later or review provider configuration.";
  }
  return message && message.length <= 240 ? message : "Investment research failed unexpectedly.";
}
