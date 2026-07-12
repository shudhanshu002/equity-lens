import { NextRequest, NextResponse } from "next/server";
import { runInvestmentResearch } from "@/lib/langgraph/graph";
import { validateResearchInput } from "@/lib/services/input-validation";
import { resolveCompany } from "@/lib/services/company-resolver";
import { dedupeResearchMetadata } from "@/lib/utils/metadata-cleanup";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validation = validateResearchInput(body.company);

    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
          reason: validation.reason,
        },
        { status: 400 }
      );
    }

    const resolvedCompanyResult = await resolveCompany(validation.companyQuery);

    if (resolvedCompanyResult.ambiguous) {
      return NextResponse.json(
        {
          success: false,
          reason: "AMBIGUOUS_COMPANY",
          message: `"${validation.companyQuery}" matches multiple listed companies. Please choose one.`,
          suggestions: resolvedCompanyResult.suggestions,
        },
        { status: 400 }
      );
    }

    if (!resolvedCompanyResult || !resolvedCompanyResult.company) {
      return NextResponse.json(
        {
          success: false,
          error: `Could not find a supported public company for "${validation.companyQuery}". Try using the official company name or ticker symbol.`,
          reason: "COMPANY_NOT_FOUND",
        },
        { status: 400 }
      );
    }

    const report = await runInvestmentResearch(validation.companyQuery);

    const result = {
      company: report.company,
      financials: report.financials,
      news: report.news,
      score: report.score,
      decision: report.decision,
      confidence: report.confidence,
      thesis: report.thesis,
      bullCase: report.bullCase,
      bearCase: report.bearCase,
      risks: report.risks,
      whatWouldChangeDecision: report.whatWouldChangeDecision,
      metadata: report.metadata,
      generatedAt: new Date().toISOString(),
    };

    const cleanResult = dedupeResearchMetadata(result);

    return NextResponse.json({
      success: true,
      data: cleanResult,
    });
  } catch (error) {
    console.error("Research API error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while running investment research.",
      },
      { status: 500 }
    );
  }
}