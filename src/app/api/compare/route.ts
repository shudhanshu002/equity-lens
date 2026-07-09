import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runInvestmentResearch } from "@/lib/langgraph/graph";
import { generateComparisonMemo } from "@/lib/services/comparison-memo";
import { InvestmentResearchReport } from "@/lib/types/research";

const CompareRequestSchema = z.object({
  companies: z
    .array(z.string().min(2, "Company name or ticker is required"))
    .min(2, "At least two companies are required for comparison")
    .max(3, "Compare up to three companies at a time"),
});

function toReport(
  result: Awaited<ReturnType<typeof runInvestmentResearch>>
): InvestmentResearchReport {
  if (
    !result.company ||
    !result.financials ||
    !result.score ||
    !result.decision
  ) {
    throw new Error("Research graph returned incomplete report.");
  }

  return {
    company: result.company,
    financials: result.financials,
    news: result.news,
    score: result.score,
    decision: result.decision,
    confidence: result.confidence,
    thesis: result.thesis,
    bullCase: result.bullCase,
    bearCase: result.bearCase,
    risks: result.risks,
    whatWouldChangeDecision: result.whatWouldChangeDecision,
    metadata: result.metadata,
    generatedAt: new Date().toISOString(),
  };
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function collectReportWarnings(reports: InvestmentResearchReport[]): string[] {
  return unique(reports.flatMap((report) => report.metadata.warnings ?? []));
}

function getWinnerFromReports(
  reports: InvestmentResearchReport[]
): InvestmentResearchReport {
  return [...reports].sort((a, b) => {
    if (b.score.total !== a.score.total) {
      return b.score.total - a.score.total;
    }

    return b.confidence - a.confidence;
  })[0];
}

function buildDataQualitySummary(reports: InvestmentResearchReport[]) {
  const financialSources = unique(
    reports.map((report) => report.metadata.financialDataSource ?? "UNKNOWN")
  );

  const newsSources = unique(
    reports.map((report) => report.metadata.newsDataSource ?? "UNKNOWN")
  );

  const memoProviders = unique(
    reports.map((report) => report.metadata.memoProvider ?? "UNKNOWN")
  );

  const companiesUsingMockNews = reports
    .filter((report) => report.metadata.newsDataSource === "MOCK")
    .map((report) => report.company.symbol);

  const companiesUsingMockFinancials = reports
    .filter((report) => report.metadata.financialDataSource === "MOCK")
    .map((report) => report.company.symbol);

  const companiesUsingFallbackMemo = reports
    .filter((report) => report.metadata.memoProvider === "FALLBACK")
    .map((report) => report.company.symbol);

  return {
    financialSources,
    newsSources,
    memoProviders,
    companiesUsingMockNews,
    companiesUsingMockFinancials,
    companiesUsingFallbackMemo,
    hasMockNews: companiesUsingMockNews.length > 0,
    hasMockFinancials: companiesUsingMockFinancials.length > 0,
    hasFallbackMemo: companiesUsingFallbackMemo.length > 0,
  };
}

function buildComparisonWarnings(
  reports: InvestmentResearchReport[],
  comparisonWarning?: string
): string[] {
  const reportWarnings = collectReportWarnings(reports);
  const dataQuality = buildDataQualitySummary(reports);

  const normalizedWarnings: string[] = [];

  if (comparisonWarning) {
    normalizedWarnings.push(comparisonWarning);
  }

  if (dataQuality.hasMockNews) {
    normalizedWarnings.push(
      `Some companies used mock news because real news was unavailable: ${dataQuality.companiesUsingMockNews.join(
        ", "
      )}.`
    );
  }

  if (dataQuality.hasMockFinancials) {
    normalizedWarnings.push(
      `Some companies used mock financial data because real financial data was unavailable: ${dataQuality.companiesUsingMockFinancials.join(
        ", "
      )}.`
    );
  }

  if (dataQuality.hasFallbackMemo) {
    normalizedWarnings.push(
      `Some companies used fallback memo generation instead of Gemini: ${dataQuality.companiesUsingFallbackMemo.join(
        ", "
      )}.`
    );
  }

  return unique([...normalizedWarnings, ...reportWarnings]);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companies } = CompareRequestSchema.parse(body);

    const reports: InvestmentResearchReport[] = [];

    // Sequential on purpose:
    // free APIs often rate-limit, so this avoids blasting Alpha Vantage/Gemini in parallel.
    for (const company of companies) {
      const result = await runInvestmentResearch(company);
      reports.push(toReport(result));
    }

    const comparison = await generateComparisonMemo(reports);
    const winner = getWinnerFromReports(reports);
    const dataQuality = buildDataQualitySummary(reports);
    const warnings = buildComparisonWarnings(reports, comparison.warning);

    return NextResponse.json({
      success: true,
      data: {
        companies: reports,
        comparison: {
          ...comparison.memo,

          // Deterministic winner from scoring model.
          // Gemini summary can phrase winner differently, but these fields stay clean for UI.
          winnerSymbol: winner.company.symbol,
          winnerName: winner.company.name,
          winnerScore: winner.score.total,
          winnerDecision: winner.decision,
        },
        metadata: {
          comparisonProvider: comparison.provider,
          warnings,
          dataQuality,
          generatedAt: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("Compare API error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while comparing companies.",
      },
      { status: 500 }
    );
  }
}