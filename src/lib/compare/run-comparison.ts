import { runInvestmentResearch } from "@/lib/langgraph/graph";
import { generateComparisonMemo } from "@/lib/services/comparison-memo";
import { dedupeResearchMetadata } from "@/lib/utils/dedupe-research-metadata";

export async function runRobustComparison(companies: string[]) {
  const uniqueCompanies = Array.from(
    new Set(companies.map((company) => company.trim()).filter(Boolean))
  ).slice(0, 4);

  if (uniqueCompanies.length < 2) {
    throw new Error("Compare at least two companies.");
  }

  const reports = await Promise.all(
    uniqueCompanies.map(async (company) => {
      const result = await runInvestmentResearch(company);

      const report = {
        company: result.company!,
        financials: result.financials ?? {},
        news: result.news ?? [],
        score: result.score!,
        decision: result.decision!,
        confidence: result.confidence ?? 0,
        thesis: result.thesis ?? "",
        bullCase: result.bullCase ?? "",
        bearCase: result.bearCase ?? "",
        risks: result.risks ?? [],
        whatWouldChangeDecision: result.whatWouldChangeDecision ?? "",
        metadata: result.metadata ?? {},
        generatedAt: new Date().toISOString(),
      };

      return dedupeResearchMetadata(report);
    })
  );

  const comparison = await generateComparisonMemo(reports);
  const winner = pickComparisonWinner(reports);
  const generatedAt = new Date().toISOString();
  const dataQuality = buildCompareDataQuality(reports);
  const winnerSymbol = winner?.company?.symbol ?? null;
  const winnerName = winner?.company?.name ?? null;
  const winnerScore = winner?.score?.total ?? null;
  const winnerDecision = winner?.decision ?? null;

  return {
    companies: reports,
    comparison: {
      ...comparison,
      winnerSymbol,
      winnerName,
      winnerScore,
      winnerDecision,
    },
    metadata: {
      comparisonProvider: comparison.provider,
      warnings: dataQuality.warnings,
      dataQuality,
      generatedAt,
    },
    // Retain these aliases for older clients while the canonical UI shape is
    // comparison + metadata.
    winnerSymbol,
    winnerName,
    winnerScore,
    winnerDecision,
    dataQuality,
    generatedAt,
  };
}

function pickComparisonWinner(reports: any[]) {
  if (reports.every((report) => report.decision === "INSUFFICIENT_DATA")) return null;
  const investable = reports.filter((report) => !["PASS", "INSUFFICIENT_DATA"].includes(report.decision));
  const pool = investable.length ? investable : reports;

  return [...pool].sort(
    (a, b) => (b.score?.total ?? 0) - (a.score?.total ?? 0)
  )[0];
}

function buildCompareDataQuality(reports: any[]) {
  const companiesUsingMockNews = reports.filter((report) => report.metadata?.newsDataSource === "MOCK").map((report) => report.company?.name);
  const companiesUsingMockFinancials = reports.filter((report) => report.metadata?.financialDataSource === "MOCK").map((report) => report.company?.name);
  const companiesUsingFallbackMemo = reports.filter((report) => report.metadata?.memoProvider === "FALLBACK").map((report) => report.company?.name);

  return {
    financialSources: Array.from(
      new Set(
        reports.map(
          (report) => report.metadata?.financialDataSource ?? "UNKNOWN"
        )
      )
    ),
    newsSources: Array.from(
      new Set(reports.map((report) => report.metadata?.newsDataSource ?? "UNKNOWN"))
    ),
    memoProviders: Array.from(
      new Set(reports.map((report) => report.metadata?.memoProvider ?? "UNKNOWN"))
    ),
    coverageModes: Array.from(
      new Set(reports.map((report) => report.company?.coverageMode ?? "UNKNOWN"))
    ),
    limitedPublicEquityCompanies: reports
      .filter(
        (report) =>
          report.company?.coverageMode === "PUBLIC_EQUITY" &&
          ["NSE", "BSE"].includes(report.company?.exchange) &&
          Object.keys(report.financials ?? {}).length === 0
      )
      .map((report) => report.company?.name),
    generalCompanies: reports
      .filter((report) => report.company?.coverageMode === "GENERAL_COMPANY")
      .map((report) => report.company?.name),
    warnings: Array.from(
      new Set(reports.flatMap((report) => report.metadata?.warnings ?? []))
    ),
    companiesUsingMockNews,
    companiesUsingMockFinancials,
    companiesUsingFallbackMemo,
    hasMockNews: companiesUsingMockNews.length > 0,
    hasMockFinancials: companiesUsingMockFinancials.length > 0,
    hasFallbackMemo: companiesUsingFallbackMemo.length > 0,
  };
}
