"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
    Archive,
    CalendarDays,
    Download,
    FileJson,
    FileText,
    Loader2,
    RefreshCcw,
    Trash2,
} from "lucide-react";
import type { ComparisonApiResponse } from "@/lib/api-client";
import type { InvestmentResearchReport } from "@/lib/types/research";
import {
    clearUserExports,
    createExportTitle,
    deleteUserExport,
    formatExportDate,
    getExportFormatLabel,
    getExportTypeLabel,
    getUserExports,
    saveUserExport,
    type UserExportFormat,
    type UserExportItem,
    type UserExportType,
} from "@/lib/user-data/exports-client";
import { getUserWatchlist, type UserWatchlistItem } from "@/lib/user-data/watchlist-client";

type DatabaseExportsCenterProps = {
    report: InvestmentResearchReport | null;
    comparison: ComparisonApiResponse["data"] | null;
};

type ExportTarget = "latest-research" | "latest-comparison" | "watchlist";

export function DatabaseExportsCenter({
    report,
    comparison,
}: DatabaseExportsCenterProps) {
    const { status } = useSession();

    const [exports, setExports] = useState<UserExportItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [working, setWorking] = useState<string | null>(null);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const loggedIn = status === "authenticated";

    const availableTargets = useMemo(() => {
        const targets: {
            id: ExportTarget;
            title: string;
            description: string;
            type: UserExportType;
            disabled: boolean;
        }[] = [
                {
                    id: "latest-research",
                    title: "Latest Research Report",
                    description: report
                        ? `${report.company.name} · ${report.decision} · ${report.score.total}%`
                        : "Run a company research report first.",
                    type: "RESEARCH_REPORT",
                    disabled: !report,
                },
                {
                    id: "latest-comparison",
                    title: "Latest Comparison Report",
                    description: comparison
                        ? `Winner: ${comparison.comparison.winnerName} · ${comparison.comparison.winnerScore}%`
                        : "Run a company comparison first.",
                    type: "COMPARISON_REPORT",
                    disabled: !comparison,
                },
                {
                    id: "watchlist",
                    title: "Watchlist Export",
                    description: "Export saved portfolio ideas from the watchlist page.",
                    type: "WATCHLIST",
                    disabled: false,
                },
            ];

        return targets;
    }, [comparison, report]);

    useEffect(() => {
        async function loadExports() {
            setLoading(true);
            setError("");

            try {
                if (!loggedIn) {
                    setExports([]);
                    return;
                }

                const items = await getUserExports();
                setExports(items);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load exports.");
            } finally {
                setLoading(false);
            }
        }

        if (status !== "loading") {
            void loadExports();
        }
    }, [loggedIn, status]);

    async function refreshExports() {
        if (!loggedIn) return;

        setLoading(true);
        setMessage("");
        setError("");

        try {
            const items = await getUserExports();
            setExports(items);
            setMessage("Exports refreshed.");
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to refresh exports."
            );
        } finally {
            setLoading(false);
        }
    }

    async function exportItem(target: ExportTarget, format: UserExportFormat) {
        setWorking(`${target}-${format}`);
        setMessage("");
        setError("");

        try {
            const watchlist = target === "watchlist" && loggedIn ? await getUserWatchlist() : [];
            const payload = getPayloadForTarget(target, report, comparison ?? null, watchlist);

            if (!payload) {
                setError("No data available for this export yet.");
                return;
            }

            const exportType = getExportTypeForTarget(target);
            const title = createTitleForTarget(target, format, report, comparison ?? null);
            const description = createDescriptionForTarget(target, report, comparison ?? null);

            const content = createDownloadContent({
                target,
                format,
                report,
                comparison: comparison ?? null,
                payload,
                watchlist,
            });

            downloadFile({
                filename: createFileName(title, format),
                content: content.body,
                mimeType: content.mimeType,
            });

            if (loggedIn) {
                const saved = await saveUserExport({
                    title,
                    type: exportType,
                    format,
                    description,
                    payload,
                    metadata: {
                        downloadedAt: new Date().toISOString(),
                        source: "EquityLens AI",
                        target,
                    },
                });

                setExports((current) => [saved, ...current]);
                setMessage(`${getExportFormatLabel(format)} export downloaded and saved to database.`);
            } else {
                setMessage(`${getExportFormatLabel(format)} export downloaded locally. Login to save export history.`);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to export file.");
        } finally {
            setWorking(null);
        }
    }

    async function removeExport(id: string) {
        setWorking(id);
        setMessage("");
        setError("");

        try {
            await deleteUserExport(id);

            setExports((current) => current.filter((item) => item.id !== id));
            setMessage("Export removed.");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to remove export.");
        } finally {
            setWorking(null);
        }
    }

    async function clearAllExports() {
        if (exports.length === 0) return;

        setWorking("clear-all");
        setMessage("");
        setError("");

        try {
            await clearUserExports();

            setExports([]);
            setMessage("All exports cleared.");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to clear exports.");
        } finally {
            setWorking(null);
        }
    }

    return (
        <div className="space-y-5 pt-3">
            <section className="grid gap-5 border-b border-slate-200 pb-5 dark:border-white/10 xl:grid-cols-[1fr_auto]">
                <div>

                    <div>
                        <div className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-orange-600 dark:text-orange-300">
                            <Archive className="h-4 w-4" />
                            Exports
                        </div>

                        <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">
                            Export research data
                        </h2>

                        <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                            Download reports, comparisons, or watchlist data and track saved exports.
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                            <button
                                onClick={() => void refreshExports()}
                                disabled={!loggedIn}
                                className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 disabled:opacity-50 dark:border-white/10 dark:text-slate-200"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />} Refresh
                            </button>

                            <button
                                onClick={() => void clearAllExports()}
                                disabled={!loggedIn || exports.length === 0}
                                className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium text-red-600 disabled:opacity-40 dark:text-red-300"
                            >
                                {working === "clear-all" ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Trash2 className="h-4 w-4" />
                                )}
                                Clear All
                            </button>
                        </div>

                        {message && (
                            <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                                {message}
                            </div>
                        )}

                        {error && (
                            <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-bold text-red-600 dark:text-red-300">
                                {error}
                            </div>
                        )}
                    </div>
                </div>

            </section>

            <section>
                <div className="mb-3 flex items-end justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-950 dark:text-white">
                            Create export
                        </h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Choose a dataset and download format.
                        </p>
                    </div>
                </div>

                <div className="divide-y divide-slate-200 border-y border-slate-200 dark:divide-white/10 dark:border-white/10">
                    {availableTargets.map((target) => (
                        <ExportTargetCard
                            key={target.id}
                            title={target.title}
                            description={target.description}
                            disabled={target.disabled}
                            type={target.type}
                            working={working}
                            target={target.id}
                            onExport={exportItem}
                        />
                    ))}
                </div>
            </section>

            <section>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-950 dark:text-white">
                            Saved exports
                        </h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Recent downloads saved to your account.</p>
                    </div>

                    <div
                        className={`inline-flex items-center gap-1.5 text-xs font-medium ${loggedIn
                                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-600 dark:text-emerald-300"
                                : "border-amber-400/20 bg-amber-400/10 text-amber-700 dark:text-amber-300"
                            }`}
                    >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {loggedIn ? "Database synced" : "Local downloads only"}
                    </div>
                </div>

                {exports.length > 0 ? (
                    <div className="divide-y divide-slate-200 border-y border-slate-200 dark:divide-white/10 dark:border-white/10">
                        {exports.map((item) => (
                            <SavedExportCard
                                key={item.id}
                                item={item}
                                working={working === item.id}
                                onDelete={() => void removeExport(item.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center gap-3 border-y border-slate-200 py-5 text-slate-500 dark:border-white/10 dark:text-slate-400">
                        <Download className="h-4 w-4" />
                        <p className="text-sm">No saved exports yet. New downloads will appear here.</p>
                    </div>
                )}
            </section>
        </div>
    );
}

function ExportTargetCard({
    title,
    description,
    disabled,
    type,
    target,
    working,
    onExport,
}: {
    title: string;
    description: string;
    disabled: boolean;
    type: UserExportType;
    target: ExportTarget;
    working: string | null;
    onExport: (target: ExportTarget, format: UserExportFormat) => Promise<void>;
}) {
    const formats: {
        format: UserExportFormat;
        icon: React.ReactNode;
    }[] = [
            { format: "MARKDOWN", icon: <FileText className="h-4 w-4" /> },
            { format: "JSON", icon: <FileJson className="h-4 w-4" /> },
            { format: "CSV", icon: <Archive className="h-4 w-4" /> },
            { format: "PDF", icon: <Download className="h-4 w-4" /> },
        ];

    return (
        <article className={`grid gap-3 py-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center ${disabled ? "opacity-55" : ""}`}>
            <div className="min-w-0">
                <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-slate-950 dark:text-white">{title}</h4>
                    <span className="text-xs text-slate-400">{getExportTypeLabel(type)}</span>
                </div>
                <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">{description}</p>
            </div>

            <div className="flex flex-wrap gap-1.5">
                {formats.map(({ format, icon }) => {
                    const id = `${target}-${format}`;
                    const isWorking = working === id;

                    return (
                        <button
                            key={format}
                            onClick={() => void onExport(target, format)}
                            disabled={disabled || isWorking}
                            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                        >
                            {isWorking ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                icon
                            )}
                            {getExportFormatLabel(format)}
                        </button>
                    );
                })}
            </div>
        </article>
    );
}

function SavedExportCard({
    item,
    working,
    onDelete,
}: {
    item: UserExportItem;
    working: boolean;
    onDelete: () => void;
}) {
    return (
        <article className="flex items-center justify-between gap-4 py-4">
                <div className="min-w-0">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                            <span className="text-xs font-medium text-cyan-600 dark:text-cyan-300">
                                {getExportTypeLabel(item.type)}
                            </span>
                            <span className="text-xs text-slate-400">
                                {getExportFormatLabel(item.format)}
                            </span>
                        </div>
                        <h4 className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                            {item.title}
                        </h4>
                        <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-slate-400">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {formatExportDate(item.createdAt)}
                        </p>
                </div>

                <button
                    onClick={onDelete}
                    disabled={working}
                    aria-label="Remove export"
                    title="Remove export"
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-60 dark:hover:bg-red-400/10 dark:hover:text-red-300"
                >
                    {working ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Trash2 className="h-4 w-4" />
                    )}
                </button>
        </article>
    );
}

function getExportTypeForTarget(target: ExportTarget): UserExportType {
    if (target === "latest-research") return "RESEARCH_REPORT";
    if (target === "latest-comparison") return "COMPARISON_REPORT";
    return "WATCHLIST";
}

function getPayloadForTarget(
    target: ExportTarget,
    report: InvestmentResearchReport | null,
    comparison: NonNullable<ComparisonApiResponse["data"]> | null,
    watchlist: UserWatchlistItem[]
) {
    if (target === "latest-research") return report;
    if (target === "latest-comparison") return comparison;

    return { type: "WATCHLIST", items: watchlist, exportedAt: new Date().toISOString() };
}

function createTitleForTarget(
    target: ExportTarget,
    format: UserExportFormat,
    report: InvestmentResearchReport | null,
    comparison: NonNullable<ComparisonApiResponse["data"]> | null
) {
    if (target === "latest-research" && report) {
        return createExportTitle({
            type: "RESEARCH_REPORT",
            format,
            company: report.company.name,
            symbol: report.company.symbol,
        });
    }

    if (target === "latest-comparison" && comparison) {
        return createExportTitle({
            type: "COMPARISON_REPORT",
            format,
            winnerName: comparison.comparison.winnerName,
        });
    }

    return createExportTitle({
        type: "WATCHLIST",
        format,
    });
}

function createDescriptionForTarget(
    target: ExportTarget,
    report: InvestmentResearchReport | null,
    comparison: NonNullable<ComparisonApiResponse["data"]> | null
) {
    if (target === "latest-research" && report) {
        return `${report.company.symbol} · ${report.decision} · Score ${report.score.total}`;
    }

    if (target === "latest-comparison" && comparison) {
        return `Winner ${comparison.comparison.winnerSymbol} · ${comparison.comparison.winnerDecision}`;
    }

    return "Portfolio watchlist export.";
}

function createDownloadContent({
    target,
    format,
    report,
    comparison,
    payload,
    watchlist,
}: {
    target: ExportTarget;
    format: UserExportFormat;
    report: InvestmentResearchReport | null;
    comparison: NonNullable<ComparisonApiResponse["data"]> | null;
    payload: unknown;
    watchlist: UserWatchlistItem[];
}) {
    if (format === "JSON") {
        return {
            body: JSON.stringify(payload, null, 2),
            mimeType: "application/json",
        };
    }

    if (format === "CSV") {
        return {
            body: createCsvContent(target, report, comparison, watchlist),
            mimeType: "text/csv",
        };
    }

    if (format === "PDF") {
        return {
            body: createPdfContent(createMarkdownContent(target, report, comparison, watchlist, true)),
            mimeType: "application/pdf",
        };
    }

    return {
        body: createMarkdownContent(target, report, comparison, watchlist, false),
        mimeType: "text/markdown",
    };
}

function createMarkdownContent(
    target: ExportTarget,
    report: InvestmentResearchReport | null,
    comparison: NonNullable<ComparisonApiResponse["data"]> | null,
    watchlist: UserWatchlistItem[],
    pdfReady: boolean
) {
    const heading = pdfReady
        ? "# EquityLens AI PDF-Ready Report"
        : "# EquityLens AI Export";

    if (target === "latest-research" && report) {
        return `${heading}

## ${report.company.name} (${report.company.symbol})

Decision: ${report.decision}
Score: ${report.score.total}
Confidence: ${report.confidence}

## Thesis

${report.thesis}

## Bull Case

${report.bullCase.map((item) => `- ${item}`).join("\n")}

## Bear Case

${report.bearCase.map((item) => `- ${item}`).join("\n")}

## Final Recommendation

**${report.decision}** (Score: ${report.score.total}/100)

Generated by EquityLens AI.
`;
    }

    if (target === "latest-comparison" && comparison) {
        return `${heading}

## Company Comparison

Winner: ${comparison.comparison.winnerName} (${comparison.comparison.winnerSymbol})
Decision: ${comparison.comparison.winnerDecision}
Score: ${comparison.comparison.winnerScore}

## Summary

${comparison.comparison.summary}

## Companies

${comparison.companies
                .map(
                    (item) =>
                        `- ${item.company.name} (${item.company.symbol}) · ${item.decision} · ${item.score.total}`
                )
                .join("\n")}

Generated by EquityLens AI.
`;
    }

    return `${heading}

## Portfolio Watchlist

${watchlist.length > 0
        ? watchlist.map((item) => `- ${item.company} (${item.symbol ?? "N/A"}) | Score ${item.score}/100 | ${item.risk} risk | ${item.status}`).join("\n")
        : "No companies are currently saved."}

Generated by EquityLens AI.
`;
}

function createCsvContent(
    target: ExportTarget,
    report: InvestmentResearchReport | null,
    comparison: NonNullable<ComparisonApiResponse["data"]> | null,
    watchlist: UserWatchlistItem[]
) {
    if (target === "latest-research" && report) {
        return [
            "company,symbol,decision,score,confidence",
            `${csv(report.company.name)},${csv(report.company.symbol)},${csv(report.decision)},${report.score.total},${report.confidence}`,
        ].join("\n");
    }

    if (target === "latest-comparison" && comparison) {
        return [
            "company,symbol,decision,score",
            ...comparison.companies.map(
                (item) =>
                    `${csv(item.company.name)},${csv(item.company.symbol)},${csv(item.decision)},${item.score.total}`
            ),
        ].join("\n");
    }

    return [
        "company,symbol,score,risk,status,thesis",
        ...watchlist.map((item) => `${csv(item.company)},${csv(item.symbol ?? "")},${item.score},${csv(item.risk)},${csv(item.status)},${csv(item.thesis ?? "")}`),
    ].join("\n");
}

function csv(value: string) {
    return `"${value.replaceAll('"', '""')}"`;
}

function createFileName(title: string, format: UserExportFormat) {
    const extensionMap: Record<UserExportFormat, string> = {
        PDF: "pdf",
        MARKDOWN: "md",
        JSON: "json",
        CSV: "csv",
    };

    const safeTitle = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    return `${safeTitle}.${extensionMap[format]}`;
}

function downloadFile({
    filename,
    content,
    mimeType,
}: {
    filename: string;
    content: string | Uint8Array;
    mimeType: string;
}) {
    const blob = new Blob([content as BlobPart], {
        type: `${mimeType};charset=utf-8`,
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = filename;
    anchor.click();

    URL.revokeObjectURL(url);
}

function createPdfContent(markdown: string) {
    const lines = markdown
        .replace(/^#+\s*/gm, "")
        .replace(/\*\*/g, "")
        .split("\n")
        .flatMap((line) => wrapPdfLine(line, 88));
    const pages: string[][] = [];
    for (let index = 0; index < lines.length; index += 48) pages.push(lines.slice(index, index + 48));
    if (pages.length === 0) pages.push(["EquityLens AI Export"]);

    const objects: string[] = ["<< /Type /Catalog /Pages 2 0 R >>", ""];
    const pageIds: number[] = [];
    pages.forEach((page) => {
        const pageId = objects.length + 1;
        const contentId = pageId + 1;
        pageIds.push(pageId);
        const stream = `BT /F1 10 Tf 48 790 Td 14 TL ${page.map((line, index) => `${index ? "T* " : ""}(${escapePdfText(line)}) Tj`).join(" ")} ET`;
        objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 ${pages.length * 2 + 3} 0 R >> >> /Contents ${contentId} 0 R >>`);
        objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    });
    objects[1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;
    objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

    let pdf = "%PDF-1.4\n";
    const offsets = [0];
    objects.forEach((object, index) => {
        offsets.push(pdf.length);
        pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
    });
    const xref = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n `).join("\n")}\ntrailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
    return new TextEncoder().encode(pdf);
}

function wrapPdfLine(line: string, width: number) {
    const clean = line.replace(/[^\x20-\x7E]/g, " ").trim();
    if (!clean) return [""];
    const words = clean.split(/\s+/);
    const lines: string[] = [];
    let current = "";
    for (const word of words) {
        if (`${current} ${word}`.trim().length > width && current) {
            lines.push(current);
            current = word;
        } else current = `${current} ${word}`.trim();
    }
    if (current) lines.push(current);
    return lines;
}

function escapePdfText(value: string) {
    return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}
