import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveCompany } from "@/lib/services/company-resolver";
import type { CompanyProfile } from "@/lib/types/research";
import { classifyFollowUpIntent } from "@/lib/follow-up/intent";
import { fetchFollowUpResearch } from "@/lib/follow-up/research";
import { generateFollowUpAnswer } from "@/lib/follow-up/answer";
import { checkApiRateLimit, safeResearchError } from "@/lib/security/api-guard";

const companyProfileSchema = z
  .object({
    symbol: z.string(),
    name: z.string(),
    exchange: z.string(),
    sector: z.string(),
    industry: z.string(),
    country: z.string(),
    currency: z.string(),
    marketCap: z.number().nullable().optional(),
    coverageMode: z.enum(["PUBLIC_EQUITY", "GENERAL_COMPANY"]).optional(),
    isPubliclyTraded: z.boolean().optional(),
    resolvedTicker: z.string().nullable().optional(),
    marketDataSymbol: z.string().nullable().optional(),
  })
  .passthrough();

const schema = z.object({
  company: z.string().min(2),
  question: z.string().trim().min(3).max(500, "Question is too long."),
  companyProfile: companyProfileSchema.optional(),
  previousDecision: z.string().optional(),
  previousScore: z.number().optional(),
  previousNews: z.unknown().optional(),
  previousFinancials: z.unknown().optional(),
});

export async function POST(req: Request) {
  const rateLimit = checkApiRateLimit(req, "research-follow-up", 30);
  if (!rateLimit.allowed) {
    return NextResponse.json({ success: false, error: "Too many follow-up requests. Please wait and try again." }, { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } });
  }
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid follow-up request.",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const {
      company,
      question,
      companyProfile,
      previousDecision,
      previousScore,
      previousNews,
      previousFinancials,
    } = parsed.data;

    const resolved = companyProfile
      ? {
          company: companyProfile as CompanyProfile,
          provider: "EXISTING_REPORT_CONTEXT",
          warnings: [],
        }
      : await resolveCompany(company);

    if (!resolved || !resolved.company) {
      return NextResponse.json(
        {
          success: false,
          error: `Could not resolve company for "${company}".`,
        },
        { status: 400 }
      );
    }

    const intent = classifyFollowUpIntent(question);

    const sources = await fetchFollowUpResearch({
      company: resolved.company,
      intent,
      question,
    });

    const answer = await generateFollowUpAnswer({
      company: resolved.company,
      question,
      intent,
      sources,
      previousDecision,
      previousScore,
      previousNews,
      previousFinancials,
    });

    return NextResponse.json({
      success: true,
      data: {
        company: resolved.company,
        intent,
        answer,
        sources,
        metadata: {
          resolverProvider: resolved.provider,
          warnings: resolved.warnings,
          generatedAt: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          safeResearchError(error),
      },
      { status: 500 }
    );
  }
}
