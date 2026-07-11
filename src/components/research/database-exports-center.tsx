"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
    Archive,
    BarChart3,
    CalendarDays,
    Database,
    Download,
    FileJson,
    FileText,
    Loader2,
    Lock,
    RefreshCcw,
    Save,
    Sparkles,
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
            const payload = getPayloadForTarget(target, report, comparison ?? null);

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
            });

            downloadTextFile({
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

    if (loading) {
        return (
            <section className="rounded-[2.5rem] border border-slate-200 bg-white p-10 text-center shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                    <Loader2 className="h-7 w-7 animate-spin" />
                </div>

                <h2 className="text-3xl font-black text-slate-950 dark:text-white">
                    Loading exports
                </h2>

                <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                    EquityLens is preparing your export history.
                </p>
            </section>
        );
    }

    return (
        <div className="space-y-8">
            <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/30 md:p-8">
                    <div className="absolute right-[-12%] top-[-30%] h-80 w-80 rounded-full bg-orange-400/20 blur-3xl dark:bg-orange-400/10" />
                    <div className="absolute bottom-[-34%] left-[18%] h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-400/10" />

                    <div className="relative">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-400/10 px-4 py-2 text-sm font-bold text-orange-600 dark:text-orange-300">
                            <Archive className="h-4 w-4" />
                            Export Center
                        </div>

                        <h2 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 dark:text-white md:text-5xl">
                            Download research output and track export history.
                        </h2>

                        <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300">
                            Export latest research reports, comparison runs, or portfolio
                            data as Markdown, JSON, CSV, or PDF-ready text. Logged-in users
                            save export metadata to PostgreSQL.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <button
                                onClick={() => void refreshExports()}
                                disabled={!loggedIn}
                                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white shadow-xl shadow-slate-900/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
                            >
                                Refresh Exports
                                <RefreshCcw className="h-4 w-4" />
                            </button>

                            <button
                                onClick={() => void clearAllExports()}
                                disabled={!loggedIn || exports.length === 0}
                                className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-400/10 px-6 py-3 text-sm font-black text-red-600 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 dark:text-red-300"
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

                <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
                    <ExportMetric
                        icon={<Database className="h-5 w-5" />}
                        label="Saved Exports"
                        value={String(exports.length)}
                        helper={loggedIn ? "Database records" : "Login required"}
                    />

                    <ExportMetric
                        icon={<FileText className="h-5 w-5" />}
                        label="Research Ready"
                        value={report ? "Yes" : "No"}
                        helper="Latest report"
                    />

                    <ExportMetric
                        icon={<BarChart3 className="h-5 w-5" />}
                        label="Compare Ready"
                        value={comparison ? "Yes" : "No"}
                        helper="Latest comparison"
                    />
                </div>
            </section>

            {!loggedIn && (
                <section className="rounded-[2.5rem] border border-amber-400/20 bg-amber-400/10 p-6 md:p-8">
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <div>
                            <div className="mb-3 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                <Lock className="h-5 w-5" />
                                <p className="font-black">Login to save export history</p>
                            </div>

                            <p className="max-w-3xl text-sm leading-7 text-slate-700 dark:text-slate-300">
                                Downloads work locally without login, but export history is
                                only saved to PostgreSQL for authenticated users.
                            </p>
                        </div>

                        <div className="inline-flex shrink-0 items-center gap-2 rounded-full border border-amber-400/20 bg-white/50 px-5 py-3 text-sm font-black text-amber-700 dark:bg-white/10 dark:text-amber-300">
                            <Save className="h-4 w-4" />
                            Account sync available
                        </div>
                    </div>
                </section>
            )}

            <section className="rounded-[2.5rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20 md:p-8">
                <div className="mb-6">
                    <p className="mb-2 text-sm font-black uppercase tracking-[0.3em] text-cyan-600 dark:text-cyan-300">
                        Create export
                    </p>

                    <h3 className="text-3xl font-black text-slate-950 dark:text-white">
                        Export available research data.
                    </h3>
                </div>

                <div className="grid gap-5 lg:grid-cols-3">
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

            <section className="rounded-[2.5rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20 md:p-8">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="mb-2 text-sm font-black uppercase tracking-[0.3em] text-orange-600 dark:text-orange-300">
                            Saved exports
                        </p>

                        <h3 className="text-3xl font-black text-slate-950 dark:text-white">
                            Export history
                        </h3>
                    </div>

                    <div
                        className={`rounded-full border px-4 py-2 text-xs font-black ${loggedIn
                                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-600 dark:text-emerald-300"
                                : "border-amber-400/20 bg-amber-400/10 text-amber-700 dark:text-amber-300"
                            }`}
                    >
                        {loggedIn ? "Database synced" : "Local downloads only"}
                    </div>
                </div>

                {exports.length > 0 ? (
                    <div className="space-y-4">
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
                    <div className="rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 p-10 text-center dark:border-white/10 dark:bg-slate-950/60">
                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-slate-400 shadow-sm dark:bg-white/10">
                            <Download className="h-8 w-8" />
                        </div>

                        <h3 className="text-2xl font-black text-slate-950 dark:text-white">
                            No saved exports yet
                        </h3>

                        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600 dark:text-slate-400">
                            Generate an export after running research or comparison. Logged-in
                            users will see saved export records here.
                        </p>
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
        <article
            className={`rounded-[2rem] border p-5 ${disabled
                    ? "border-slate-200 bg-slate-50 opacity-70 dark:border-white/10 dark:bg-slate-950/60"
                    : "border-slate-200 bg-slate-50 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-xl hover:shadow-slate-900/5 dark:border-white/10 dark:bg-slate-950/60 dark:hover:bg-white/[0.06]"
                }`}
        >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-orange-600 shadow-sm dark:bg-white/10 dark:text-orange-300">
                <Sparkles className="h-5 w-5" />
            </div>

            <p className="mb-2 rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-black text-cyan-600 dark:text-cyan-300">
                {getExportTypeLabel(type)}
            </p>

            <h4 className="text-xl font-black text-slate-950 dark:text-white">
                {title}
            </h4>

            <p className="mt-2 min-h-[52px] text-sm leading-7 text-slate-600 dark:text-slate-400">
                {description}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2">
                {formats.map(({ format, icon }) => {
                    const id = `${target}-${format}`;
                    const isWorking = working === id;

                    return (
                        <button
                            key={format}
                            onClick={() => void onExport(target, format)}
                            disabled={disabled || isWorking}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-xs font-black text-slate-700 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
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
        <article className="rounded-[2rem] border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-xl hover:shadow-slate-900/5 dark:border-white/10 dark:bg-slate-950/60 dark:hover:bg-white/[0.06] md:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-400/10 text-orange-600 dark:text-orange-300">
                        <Download className="h-6 w-6" />
                    </div>

                    <div>
                        <div className="mb-2 flex flex-wrap gap-2">
                            <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-black text-cyan-600 dark:text-cyan-300">
                                {getExportTypeLabel(item.type)}
                            </span>

                            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-black text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                                {getExportFormatLabel(item.format)}
                            </span>
                        </div>

                        <h4 className="text-xl font-black text-slate-950 dark:text-white">
                            {item.title}
                        </h4>

                        {item.description && (
                            <p className="mt-1 text-sm font-bold text-slate-500 dark:text-slate-400">
                                {item.description}
                            </p>
                        )}

                        <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-slate-400">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {formatExportDate(item.createdAt)}
                        </p>
                    </div>
                </div>

                <button
                    onClick={onDelete}
                    disabled={working}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-red-400/20 bg-red-400/10 px-5 py-3 text-sm font-black text-red-600 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 dark:text-red-300"
                >
                    {working ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Trash2 className="h-4 w-4" />
                    )}
                    Remove
                </button>
            </div>
        </article>
    );
}

function ExportMetric({
    icon,
    label,
    value,
    helper,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    helper: string;
}) {
    return (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-orange-600 dark:bg-white/10 dark:text-orange-300">
                {icon}
            </div>

            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                {label}
            </p>

            <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">
                {value}
            </p>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {helper}
            </p>
        </div>
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
    comparison: NonNullable<ComparisonApiResponse["data"]> | null
) {
    if (target === "latest-research") return report;
    if (target === "latest-comparison") return comparison;

    return {
        type: "WATCHLIST",
        message:
            "Watchlist export metadata. Full watchlist database route can be connected next.",
        exportedAt: new Date().toISOString(),
    };
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
}: {
    target: ExportTarget;
    format: UserExportFormat;
    report: InvestmentResearchReport | null;
    comparison: NonNullable<ComparisonApiResponse["data"]> | null;
    payload: unknown;
}) {
    if (format === "JSON") {
        return {
            body: JSON.stringify(payload, null, 2),
            mimeType: "application/json",
        };
    }

    if (format === "CSV") {
        return {
            body: createCsvContent(target, report, comparison),
            mimeType: "text/csv",
        };
    }

    if (format === "PDF") {
        return {
            body: createMarkdownContent(target, report, comparison, true),
            mimeType: "text/plain",
        };
    }

    return {
        body: createMarkdownContent(target, report, comparison, false),
        mimeType: "text/markdown",
    };
}

function createMarkdownContent(
    target: ExportTarget,
    report: InvestmentResearchReport | null,
    comparison: NonNullable<ComparisonApiResponse["data"]> | null,
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

## Watchlist Export

This is a watchlist export placeholder.

Generated by EquityLens AI.
`;
}

function createCsvContent(
    target: ExportTarget,
    report: InvestmentResearchReport | null,
    comparison: NonNullable<ComparisonApiResponse["data"]> | null
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

    return ["type,message", "WATCHLIST,Watchlist export placeholder"].join("\n");
}

function csv(value: string) {
    return `"${value.replaceAll('"', '""')}"`;
}

function createFileName(title: string, format: UserExportFormat) {
    const extensionMap: Record<UserExportFormat, string> = {
        PDF: "txt",
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

function downloadTextFile({
    filename,
    content,
    mimeType,
}: {
    filename: string;
    content: string;
    mimeType: string;
}) {
    const blob = new Blob([content], {
        type: `${mimeType};charset=utf-8`,
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = filename;
    anchor.click();

    URL.revokeObjectURL(url);
}