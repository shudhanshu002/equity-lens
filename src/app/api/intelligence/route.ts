import { NextResponse } from "next/server";
import { z } from "zod";
import { runInvestmentResearch } from "@/lib/langgraph/graph";
import { dedupeResearchMetadata } from "@/lib/utils/metadata-cleanup";
import { runRobustComparison } from "@/lib/compare/runner";
import { routeUniversalQuery } from "@/lib/intelligence/router";
import { runSectorResearch } from "@/lib/intelligence/sector-agent";
import { resolveCompany } from "@/lib/services/company-resolver";
import { classifyFollowUpIntent } from "@/lib/follow-up/intent";
import { fetchFollowUpResearch } from "@/lib/follow-up/research";
import { generateFollowUpAnswer } from "@/lib/follow-up/answer";
import { generateCompareFollowUpAnswer } from "@/lib/follow-up/compare-answer";
import type { CompanyProfile } from "@/lib/types/research";
import { checkApiRateLimit, safeResearchError } from "@/lib/security/api-guard";

const companyProfileSchema = z.object({}).passthrough();

const schema = z.object({
  query: z.string().trim().min(1).max(500, "Query is too long."),
  currentReport: z
    .object({
      company: companyProfileSchema,
      financials: z.unknown().optional(),
      news: z.unknown().optional(),
      decision: z.string().optional(),
      score: z
        .object({
          total: z.number().optional(),
        })
        .passthrough()
        .optional(),
    })
    .passthrough()
    .optional(),
  currentCompare: z
    .object({
      companies: z.array(z.unknown()).optional(),
      comparison: z.unknown().optional(),
    })
    .passthrough()
    .optional(),
});

export async function POST(req: Request) {
  const rateLimit = checkApiRateLimit(req, "intelligence");
  if (!rateLimit.allowed) {
    return NextResponse.json({ success: false, error: "Too many research requests. Please wait before trying again." }, { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } });
  }
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid intelligence request.",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { query, currentReport, currentCompare } = parsed.data;
    const route = routeUniversalQuery(query);

    if (route.intent === "INVALID_QUERY") {
      return NextResponse.json(
        {
          success: false,
          intent: route.intent,
          error: "Please enter a company, comparison, or investment research question.",
          route,
        },
        { status: 400 }
      );
    }

    if (route.intent === "UNSUPPORTED_ASSET") {
      return NextResponse.json(
        {
          success: false,
          intent: route.intent,
          error:
            "EquityLens currently supports company, sector, and equity-style investment research. Crypto, commodities, forex, bonds, and real estate are not supported in this workflow.",
          route,
        },
        { status: 400 }
      );
    }

    if (
      route.intent === "SINGLE_COMPANY_RESEARCH" &&
      (!currentReport || explicitlyRequestsNewResearch(query))
    ) {
      const result = await runInvestmentResearch(route.companies[0]);

      return NextResponse.json({
        success: true,
        intent: route.intent,
        route,
        data: dedupeResearchMetadata(result),
      });
    }

    if (route.intent === "COMPANY_COMPARISON") {
      const data = await runRobustComparison(route.companies);

      return NextResponse.json({
        success: true,
        intent: route.intent,
        route,
        data,
      });
    }

    if (
      route.intent === "SECTOR_RESEARCH" &&
      (!currentReport || explicitlyRequestsSectorResearch(query))
    ) {
      const data = await runSectorResearch(query);

      return NextResponse.json({
        success: true,
        intent: route.intent,
        route,
        data,
      });
    }

    if (route.intent === "FOLLOW_COMPANY") {
      const resolved = await resolveCompany(route.companies[0]);

      return NextResponse.json({
        success: true,
        intent: route.intent,
        route,
        data: {
          company: resolved.company,
          resolverProvider: resolved.provider,
          warnings: resolved.warnings,
          action: "ADD_TO_WATCHLIST_OR_FOLLOWED_COMPANIES",
          message:
            "Company resolved. Frontend should now call your watchlist/follow API to save this company for monitoring.",
        },
      });
    }

    if (currentCompare?.companies?.length) {
      const reports = currentCompare.companies as any[];

      const companyProfiles = reports
        .map((report) => report?.company)
        .filter(Boolean);

      const intent = classifyFollowUpIntent(query);

      const researchByCompany = await Promise.all(
        companyProfiles.map(async (company) => {
          const sources = await fetchFollowUpResearch({
            company,
            intent,
            question: query,
          });

          return {
            company,
            sources,
          };
        })
      );

      const answer = await generateCompareFollowUpAnswer({
        question: query,
        intent,
        researchByCompany,
        previousComparison: currentCompare.comparison,
        previousReports: reports,
      });

      return NextResponse.json({
        success: true,
        intent: "FOLLOW_UP_QUESTION",
        route,
        data: {
          intent,
          answer,
          researchByCompany,
          metadata: {
            generatedAt: new Date().toISOString(),
          },
        },
      });
    }

    const company =
      currentReport?.company ??
      (await resolveCompany(route.companies[0] || query)).company;

    if (!company) {
      return NextResponse.json(
        {
          success: false,
          error: "Could not resolve target company for follow-up question.",
        },
        { status: 400 }
      );
    }

    const intent = classifyFollowUpIntent(query);

    const sources = await fetchFollowUpResearch({
      company: company as CompanyProfile,
      intent,
      question: query,
    });

    const answer = await generateFollowUpAnswer({
      company: company as CompanyProfile,
      question: query,
      intent,
      sources,
      previousDecision: currentReport?.decision,
      previousScore: currentReport?.score?.total,
      previousNews: currentReport?.news as any[],
      previousFinancials: currentReport?.financials,
    });

    return NextResponse.json({
      success: true,
      intent: "FOLLOW_UP_QUESTION",
      route,
      data: {
        company,
        intent,
        answer,
        sources,
        metadata: {
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

function explicitlyRequestsNewResearch(query: string) {
  const normalized = query.trim().toLowerCase();

  if (/^(analyze|analyse|research|evaluate)\s+/.test(normalized)) return true;
  if (/^(give me )?investment (tips|advice) (for|about)\s+/.test(normalized)) return true;
  if (/^should i (invest in|buy)\s+/.test(normalized)) return true;
  if (/^is\s+.+\s+(a good (investment|stock)|worth buying)/.test(normalized)) return true;

  return false;
}

function explicitlyRequestsSectorResearch(query: string) {
  const normalized = query.trim().toLowerCase();
  return (
    /^(analyze|analyse|research|evaluate)\s+/.test(normalized) &&
    /\b(sector|industry|theme|market)\b/.test(normalized)
  ) || /\b(stocks in|best companies|top companies)\b/.test(normalized);
}
