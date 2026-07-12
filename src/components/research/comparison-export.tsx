"use client";

import { Copy, Download } from "lucide-react";
import { ComparisonApiResponse } from "@/lib/api-client";
import { formatNumber, formatMarketCap } from "@/lib/frontend/format";

type ComparisonExportProps = {
  comparison: NonNullable<ComparisonApiResponse["data"]>;
};

function list(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

function buildComparisonMarkdown(
  comparisonData: NonNullable<ComparisonApiResponse["data"]>
) {
  const { companies, comparison, metadata } = comparisonData;

  return `# Investment Comparison Memo

## Winner

**Winner:** ${comparison.winnerName} (${comparison.winnerSymbol})  
**Winner Score:** ${comparison.winnerScore}/100  
**Winner Decision:** ${comparison.winnerDecision}  
**Comparison Provider:** ${metadata.comparisonProvider}  
**Generated At:** ${metadata.generatedAt}  

---

## Executive Summary

${comparison.summary}

---

## Ranking

${comparison.ranking
  .map(
    (item) => `### Rank ${item.rank}: ${item.name} (${item.symbol})

${item.reason}
`
  )
  .join("\n")}

---

## Key Tradeoffs

${list(comparison.keyTradeoffs)}

---

## Company Score Table

| Company | Symbol | Decision | Score | Confidence | Market Cap |
|---|---:|---:|---:|---:|---:|
${companies
  .map(
    (report) =>
      `| ${report.company.name} | ${report.company.symbol} | ${report.decision} | ${report.score.total} | ${report.confidence} | ${formatMarketCap(report.company.marketCap, report.company.currency)} |`
  )
  .join("\n")}

---

## Company Details

${companies
  .map(
    (report) => `## ${report.company.name} (${report.company.symbol})

**Decision:** ${report.decision}  
**Score:** ${report.score.total}/100  
**Confidence:** ${report.confidence}/100  
**Sector:** ${report.company.sector ?? "N/A"}  
**Industry:** ${report.company.industry ?? "N/A"}  

### Thesis

${report.thesis}

### Score Breakdown

| Category | Score |
|---|---:|
| Growth | ${report.score.growth} |
| Profitability | ${report.score.profitability} |
| Balance Sheet | ${report.score.balanceSheet} |
| Valuation | ${report.score.valuation} |
| Sentiment | ${report.score.sentiment} |
| Total | ${report.score.total} |

### Key Risks

${list(report.risks)}
`
  )
  .join("\n---\n")}

---

## Data Quality

**Financial Sources:** ${metadata.dataQuality.financialSources.join(", ")}  
**News Sources:** ${metadata.dataQuality.newsSources.join(", ")}  
**Memo Providers:** ${metadata.dataQuality.memoProviders.join(", ")}  
**Mock News Used:** ${metadata.dataQuality.hasMockNews ? "Yes" : "No"}  
**Mock Financials Used:** ${metadata.dataQuality.hasMockFinancials ? "Yes" : "No"}  
**Fallback Memo Used:** ${metadata.dataQuality.hasFallbackMemo ? "Yes" : "No"}  

---

## Warnings

${metadata.warnings.length > 0 ? list(metadata.warnings) : "- No warnings."}

---

_Disclaimer: This comparison is generated for research and demo purposes only. It is not financial advice._
`;
}

function safeFileName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function ComparisonExport({ comparison }: ComparisonExportProps) {
  const markdown = buildComparisonMarkdown(comparison);

  function downloadMarkdown() {
    const blob = new Blob([markdown], {
      type: "text/markdown;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `${safeFileName(
      comparison.comparison.winnerSymbol
    )}-comparison-memo.md`;

    anchor.click();

    URL.revokeObjectURL(url);
  }

  async function copyMarkdown() {
    await navigator.clipboard.writeText(markdown);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={downloadMarkdown}
        className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-400/20"
      >
        <Download className="h-4 w-4" />
        Export Comparison
      </button>

      <button
        onClick={copyMarkdown}
        className="inline-flex items-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-800"
      >
        <Copy className="h-4 w-4" />
        Copy Markdown
      </button>
    </div>
  );
}