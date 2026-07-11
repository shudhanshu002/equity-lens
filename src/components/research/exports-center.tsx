"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import {
    Archive,
    ArrowRight,
    CheckCircle2,
    Code2,
    Database,
    Download,
    FileJson,
    FileSpreadsheet,
    FileText,
    History,
    Printer,
    RefreshCcw,
    ShieldCheck,
    Sparkles,
} from "lucide-react";
import { AppTab } from "@/lib/frontend/app-tabs";
import { ComparisonApiResponse } from "@/lib/api-client";
import { InvestmentResearchReport } from "@/lib/types/research";

type ExportsCenterProps = {
    currentReport: InvestmentResearchReport | null;
    currentComparison: ComparisonApiResponse["data"] | undefined;
    onTabChange: (tab: AppTab) => void;
};

type LocalExportItem = {
    key: string;
    size: string;
    preview: string;
};

const EXPORT_FORMATS = [
    {
        label: "Markdown",
        extension: ".md",
        description: "Best for README, submission files, and readable reports.",
        icon: <FileText className="h-5 w-5" />,
    },
    {
        label: "JSON",
        extension: ".json",
        description: "Best for structured output, API testing, and debugging.",
        icon: <FileJson className="h-5 w-5" />,
    },
    {
        label: "CSV",
        extension: ".csv",
        description: "Best for score breakdown and spreadsheet review.",
        icon: <FileSpreadsheet className="h-5 w-5" />,
    },
    {
        label: "PDF",
        extension: "Print",
        description: "Use browser print to save the current dashboard as PDF.",
        icon: <Printer className="h-5 w-5" />,
    },
];

export function ExportsCenter({
    currentReport,
    currentComparison,
    onTabChange,
}: ExportsCenterProps) {
    const [localItems, setLocalItems] = useState<LocalExportItem[]>([]);

    useEffect(() => {
        refreshLocalItems();
    }, []);

    const hasActiveOutput = Boolean(currentReport || currentComparison);

    const activeTitle = useMemo(() => {
        if (currentReport) {
            return `${currentReport.company.name} Investment Memo`;
        }

        if (currentComparison) {
            return `${currentComparison.comparison.winnerName} Comparison Memo`;
        }

        return "No active report";
    }, [currentComparison, currentReport]);

    function refreshLocalItems() {
        const items: LocalExportItem[] = [];

        for (let index = 0; index < window.localStorage.length; index += 1) {
            const key = window.localStorage.key(index);

            if (!key || !key.startsWith("equitylens")) continue;

            const value = window.localStorage.getItem(key) ?? "";

            items.push({
                key,
                size: formatBytes(value.length),
                preview: value.slice(0, 120),
            });
        }

        setLocalItems(items);
    }

    function exportMarkdown() {
        if (!hasActiveOutput) return;

        const content = currentReport
            ? createResearchMarkdown(currentReport)
            : createComparisonMarkdown(currentComparison);

        downloadFile(content, getFileName("memo", "md"), "text/markdown");
    }

    function exportJson() {
        if (!hasActiveOutput) return;

        const payload = currentReport ?? currentComparison;
        const content = JSON.stringify(payload, null, 2);

        downloadFile(content, getFileName("data", "json"), "application/json");
    }

    function exportCsv() {
        if (!hasActiveOutput) return;

        const content = currentReport
            ? createResearchCsv(currentReport)
            : createComparisonCsv(currentComparison);

        downloadFile(content, getFileName("scores", "csv"), "text/csv");
    }

    function exportLocalStorageArchive() {
        const archive: Record<string, unknown> = {};

        for (let index = 0; index < window.localStorage.length; index += 1) {
            const key = window.localStorage.key(index);

            if (!key || !key.startsWith("equitylens")) continue;

            const value = window.localStorage.getItem(key);

            try {
                archive[key] = value ? JSON.parse(value) : null;
            } catch {
                archive[key] = value;
            }
        }

        downloadFile(
            JSON.stringify(archive, null, 2),
            `equitylens-local-archive-${Date.now()}.json`,
            "application/json"
        );
    }

    function printAsPdf() {
        window.print();
    }

    return (
        <div className="space-y-8">
            <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/30 md:p-8">
                    <div className="absolute right-[-14%] top-[-30%] h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-400/10" />
                    <div className="absolute bottom-[-34%] left-[12%] h-80 w-80 rounded-full bg-violet-400/20 blur-3xl dark:bg-violet-400/10" />

                    <div className="relative">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-600 dark:text-cyan-300">
                            <Download className="h-4 w-4" />
                            Export Center
                        </div>

                        <h2 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 dark:text-white md:text-5xl">
                            Export investment research like a real SaaS platform.
                        </h2>

                        <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300">
                            Download reports as Markdown, JSON, CSV, or use browser print for
                            a PDF-ready submission format. Export local history for evidence
                            and review.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <button
                                onClick={() => onTabChange("research")}
                                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white shadow-xl shadow-slate-900/20 transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950"
                            >
                                Create Report
                                <Sparkles className="h-4 w-4" />
                            </button>

                            <button
                                onClick={() => onTabChange("history")}
                                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-black text-slate-700 shadow-lg shadow-slate-900/5 transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
                            >
                                Open History
                                <History className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="rounded-[2.5rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-2xl shadow-slate-900/20 dark:border-white/10 md:p-8">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                        <ShieldCheck className="h-7 w-7 text-emerald-300" />
                    </div>

                    <p className="mb-2 text-sm font-black uppercase tracking-[0.3em] text-emerald-300">
                        Active Output
                    </p>

                    <h3 className="text-3xl font-black">{activeTitle}</h3>

                    <p className="mt-4 text-sm leading-7 text-slate-300">
                        {hasActiveOutput
                            ? "A report is available in memory and can be exported immediately."
                            : "Run a research or comparison workflow first, then return here to export the active output."}
                    </p>

                    <div className="mt-6 rounded-3xl border border-white/10 bg-white/10 p-5">
                        <div className="mb-3 flex items-center gap-2 text-cyan-300">
                            <Database className="h-5 w-5" />
                            <p className="font-black">Data included</p>
                        </div>

                        <p className="text-sm leading-6 text-slate-300">
                            Decision, confidence, score breakdown, reasoning, metadata,
                            warnings, and source transparency.
                        </p>
                    </div>
                </div>
            </section>

            <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {EXPORT_FORMATS.map((format) => (
                    <div
                        key={format.label}
                        className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20"
                    >
                        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-cyan-600 dark:bg-white/10 dark:text-cyan-300">
                            {format.icon}
                        </div>

                        <div className="mb-3 flex items-center justify-between gap-3">
                            <h3 className="font-black text-slate-950 dark:text-white">
                                {format.label}
                            </h3>

                            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-xs font-black text-slate-500 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-400">
                                {format.extension}
                            </span>
                        </div>

                        <p className="min-h-[72px] text-sm leading-6 text-slate-600 dark:text-slate-400">
                            {format.description}
                        </p>

                        <button
                            onClick={() => {
                                if (format.label === "Markdown") exportMarkdown();
                                if (format.label === "JSON") exportJson();
                                if (format.label === "CSV") exportCsv();
                                if (format.label === "PDF") printAsPdf();
                            }}
                            disabled={!hasActiveOutput && format.label !== "PDF"}
                            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-4 py-3 text-sm font-black text-white shadow-xl shadow-slate-900/15 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950"
                        >
                            Export
                            <Download className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20 md:p-8">
                    <div className="mb-6">
                        <p className="mb-2 text-sm font-black uppercase tracking-[0.3em] text-violet-600 dark:text-violet-300">
                            Local archive
                        </p>

                        <h3 className="text-3xl font-black text-slate-950 dark:text-white">
                            Export saved app data.
                        </h3>

                        <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
                            This exports EquityLens localStorage data such as theme,
                            watchlist, history, and saved demo state when available.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={exportLocalStorageArchive}
                            className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-xl shadow-slate-900/15 transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950"
                        >
                            Export Archive
                            <Archive className="h-4 w-4" />
                        </button>

                        <button
                            onClick={refreshLocalItems}
                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-lg shadow-slate-900/5 transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
                        >
                            Refresh
                            <RefreshCcw className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="mt-6 rounded-[1.5rem] border border-amber-400/20 bg-amber-400/10 p-5">
                        <p className="font-black text-amber-700 dark:text-amber-300">
                            Submission tip
                        </p>

                        <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
                            Export Markdown for readable examples and JSON for proving the
                            structured API output.
                        </p>
                    </div>
                </div>

                <div className="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20 md:p-8">
                    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <p className="mb-2 text-sm font-black uppercase tracking-[0.3em] text-cyan-600 dark:text-cyan-300">
                                Stored data
                            </p>

                            <h3 className="text-3xl font-black text-slate-950 dark:text-white">
                                Local EquityLens records.
                            </h3>
                        </div>

                        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-black text-emerald-600 dark:text-emerald-300">
                            {localItems.length} item{localItems.length === 1 ? "" : "s"}
                        </span>
                    </div>

                    <div className="space-y-3">
                        {localItems.length === 0 ? (
                            <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-white/10 dark:bg-slate-950/60">
                                <Code2 className="mx-auto mb-3 h-8 w-8 text-slate-400" />

                                <p className="font-black text-slate-950 dark:text-white">
                                    No local records found
                                </p>

                                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                    Run research, save history, or add watchlist companies first.
                                </p>
                            </div>
                        ) : (
                            localItems.map((item) => (
                                <div
                                    key={item.key}
                                    className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-950/60"
                                >
                                    <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                                        <p className="font-mono text-sm font-black text-slate-950 dark:text-white">
                                            {item.key}
                                        </p>

                                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-black text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                                            {item.size}
                                        </span>
                                    </div>

                                    <p className="line-clamp-2 break-all text-xs leading-5 text-slate-500 dark:text-slate-400">
                                        {item.preview}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            <section className="rounded-[2.5rem] border border-emerald-400/20 bg-emerald-400/10 p-6 md:p-8">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="mb-3 flex items-center gap-2 text-emerald-600 dark:text-emerald-300">
                            <CheckCircle2 className="h-5 w-5" />
                            <p className="font-black">Professional export workflow</p>
                        </div>

                        <p className="max-w-3xl text-sm leading-7 text-slate-700 dark:text-slate-300">
                            A reviewer can run research, export a memo, export structured
                            JSON, and inspect stored history without touching the codebase.
                        </p>
                    </div>

                    <button
                        onClick={() => onTabChange("research")}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-xl shadow-slate-900/15 transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950"
                    >
                        Generate New Memo
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            </section>
        </div>
    );
}

function getFileName(type: string, extension: string) {
    return `equitylens-${type}-${Date.now()}.${extension}`;
}

function downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
}

function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function createResearchMarkdown(report: InvestmentResearchReport) {
    return `# EquityLens AI Investment Memo

## Company

${report.company.name} (${report.company.symbol})

## Recommendation

- Decision: ${report.decision}
- Confidence: ${report.confidence}%
- Total Score: ${report.score.total}/100

## Executive Summary

${report.thesis}

## Score Breakdown

| Category | Score |
|---|---:|
| Growth | ${report.score.growth} |
| Profitability | ${report.score.profitability} |
| Balance Sheet | ${report.score.balanceSheet} |
| Valuation | ${report.score.valuation} |
| Sentiment | ${report.score.sentiment} |
| Total | ${report.score.total} |

## Bull Case

${report.bullCase.map((item) => `- ${item}`).join("\n")}

## Bear Case

${report.bearCase.map((item) => `- ${item}`).join("\n")}

## Risks

${report.risks.map((item) => `- ${item}`).join("\n")}

## What Would Change the Decision

${report.whatWouldChangeDecision.map((item) => `- ${item}`).join("\n")}

## Metadata

- Financial Source: ${report.metadata.financialDataSource}
- News Source: ${report.metadata.newsDataSource}
- Memo Provider: ${report.metadata.memoProvider}

## Disclaimer

This report is generated for educational and demonstration purposes only. It is not financial advice.
`;
}

function createComparisonMarkdown(
    comparison: ComparisonApiResponse["data"] | undefined
) {
    if (!comparison) return "";

    return `# EquityLens AI Comparison Memo

## Winner

${comparison.comparison.winnerName} (${comparison.comparison.winnerSymbol})

- Decision: ${comparison.comparison.winnerDecision}
- Score: ${comparison.comparison.winnerScore}/100

## Summary

${comparison.comparison.summary}

## Ranking

${comparison.comparison.ranking
            .map(
                (item) =>
                    `${item.rank}. ${item.name} (${item.symbol}) — ${item.reason}`
            )
            .join("\n")}

## Key Tradeoffs

${comparison.comparison.keyTradeoffs.map((item) => `- ${item}`).join("\n")}

## Data Quality

- Financial Sources: ${comparison.metadata.dataQuality.financialSources.join(", ")}
- News Sources: ${comparison.metadata.dataQuality.newsSources.join(", ")}
- Memo Providers: ${comparison.metadata.dataQuality.memoProviders.join(", ")}

## Disclaimer

This comparison is generated for educational and demonstration purposes only. It is not financial advice.
`;
}

function createResearchCsv(report: InvestmentResearchReport) {
    return [
        "Category,Score",
        `Growth,${report.score.growth}`,
        `Profitability,${report.score.profitability}`,
        `Balance Sheet,${report.score.balanceSheet}`,
        `Valuation,${report.score.valuation}`,
        `Sentiment,${report.score.sentiment}`,
        `Total,${report.score.total}`,
    ].join("\n");
}

function createComparisonCsv(
    comparison: ComparisonApiResponse["data"] | undefined
) {
    if (!comparison) return "";

    return [
        "Rank,Symbol,Company,Reason",
        ...comparison.comparison.ranking.map(
            (item) =>
                `${item.rank},${item.symbol},"${item.name}","${item.reason.replaceAll(
                    '"',
                    "'"
                )}"`
        ),
    ].join("\n");
}