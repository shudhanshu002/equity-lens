"use client";

import { Copy, Download } from "lucide-react";
import { InvestmentResearchReport } from "@/lib/types/research";
import { formatNumber } from "@/lib/frontend/format";

type ReportExportProps = {
  report: InvestmentResearchReport;
};

function list(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

function buildMarkdownReport(report: InvestmentResearchReport) {
  return `# ${report.company.name} Investment Research Memo

## Decision

**Decision:** ${report.decision}  
**Score:** ${report.score.total}/100  
**Confidence:** ${report.confidence}/100  
**Ticker:** ${report.company.symbol}  
**Exchange:** ${report.company.exchange ?? "N/A"}  
**Sector:** ${report.company.sector ?? "N/A"}  
**Industry:** ${report.company.industry ?? "N/A"}  
**Market Cap:** ${formatNumber(report.company.marketCap)}  

---

## Investment Thesis

${report.thesis}

---

## Score Breakdown

| Category | Score |
|---|---:|
| Growth | ${report.score.growth} |
| Profitability | ${report.score.profitability} |
| Balance Sheet | ${report.score.balanceSheet} |
| Valuation | ${report.score.valuation} |
| Sentiment | ${report.score.sentiment} |
| Total | ${report.score.total} |

---

## Financial Snapshot

| Metric | Value |
|---|---:|
| Revenue Growth YoY | ${report.financials.revenueGrowthYoY ?? "N/A"} |
| Profit Margin | ${report.financials.profitMargin ?? "N/A"} |
| Operating Margin | ${report.financials.operatingMargin ?? "N/A"} |
| Return on Equity | ${report.financials.returnOnEquity ?? "N/A"} |
| Debt to Equity | ${report.financials.debtToEquity ?? "N/A"} |
| Current Ratio | ${report.financials.currentRatio ?? "N/A"} |
| P/E Ratio | ${report.financials.peRatio ?? "N/A"} |
| Forward P/E | ${report.financials.forwardPe ?? "N/A"} |
| PEG Ratio | ${report.financials.pegRatio ?? "N/A"} |
| Price to Sales | ${report.financials.priceToSales ?? "N/A"} |
| EPS | ${report.financials.eps ?? "N/A"} |
| Beta | ${report.financials.beta ?? "N/A"} |

---

## Bull Case

${list(report.bullCase)}

---

## Bear Case

${list(report.bearCase)}

---

## Key Risks

${list(report.risks)}

---

## What Would Change The Decision?

${list(report.whatWouldChangeDecision)}

---

## News Used

${report.news
  .map(
    (item) =>
      `- **${item.headline}** — ${item.summary} _(${item.source}, ${
        item.sentiment ?? "NEUTRAL"
      })_`
  )
  .join("\n")}

---

## Agent Metadata

**Financial Data Source:** ${report.metadata.financialDataSource ?? "UNKNOWN"}  
**News Data Source:** ${report.metadata.newsDataSource ?? "UNKNOWN"}  
**Memo Provider:** ${report.metadata.memoProvider ?? "UNKNOWN"}  
**Generated At:** ${report.generatedAt}  

### Warnings

${
  report.metadata.warnings.length > 0
    ? list(report.metadata.warnings)
    : "- No warnings."
}

---

## Agent Trace

${report.metadata.trace
  .map(
    (step) =>
      `- **${step.step}** [${step.status}] via ${step.provider}: ${step.message}`
  )
  .join("\n")}

---

_Disclaimer: This report is generated for research and demo purposes only. It is not financial advice._
`;
}

function safeFileName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function ReportExport({ report }: ReportExportProps) {
  const markdown = buildMarkdownReport(report);

  function downloadMarkdown() {
    const blob = new Blob([markdown], {
      type: "text/markdown;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `${safeFileName(report.company.symbol)}-investment-memo.md`;
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
        className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/20"
      >
        <Download className="h-4 w-4" />
        Export Memo
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