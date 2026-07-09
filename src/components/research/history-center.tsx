"use client";

import { useEffect, useState } from "react";
import {
    BarChart3,
    Clock3,
    FileText,
    History,
    RotateCcw,
    Search,
    Trash2,
} from "lucide-react";
import { ComparisonApiResponse } from "@/lib/api-client";
import { decisionStyles } from "@/lib/frontend/format";
import { InvestmentResearchReport } from "@/lib/types/research";

type ComparisonData = NonNullable<ComparisonApiResponse["data"]>;

type HistoryItem =
    | {
        id: string;
        type: "research";
        title: string;
        subtitle: string;
        decision: string;
        score: number;
        createdAt: string;
        payload: InvestmentResearchReport;
    }
    | {
        id: string;
        type: "compare";
        title: string;
        subtitle: string;
        decision: string;
        score: number;
        createdAt: string;
        payload: ComparisonData;
    };

type HistoryCenterProps = {
    onOpenReport: (report: InvestmentResearchReport) => void;
    onOpenComparison: (comparison: ComparisonData) => void;
};

const STORAGE_KEY = "equitylens-research-history";

function readHistory(): HistoryItem[] {
    if (typeof window === "undefined") return [];

    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);

        if (!raw) return [];

        const parsed = JSON.parse(raw);

        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function formatDate(value: string) {
    try {
        return new Intl.DateTimeFormat("en", {
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        }).format(new Date(value));
    } catch {
        return "Recent";
    }
}

export function HistoryCenter({
    onOpenReport,
    onOpenComparison,
}: HistoryCenterProps) {
    const [items, setItems] = useState<HistoryItem[]>([]);

    useEffect(() => {
        setItems(readHistory());
    }, []);

    const researchItems = items.filter((item) => item.type === "research");
    const compareItems = items.filter((item) => item.type === "compare");

    function clearHistory() {
        window.localStorage.removeItem(STORAGE_KEY);
        setItems([]);
    }

    function refreshHistory() {
        setItems(readHistory());
    }

    return (
        <section className="pt-32">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
                <div>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-600 dark:text-cyan-300">
                        <History className="h-4 w-4" />
                        Research archive
                    </div>

                    <h1 className="text-4xl font-black tracking-tight text-slate-950 dark:text-white md:text-5xl">
                        Saved History
                    </h1>

                    <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
                        Reopen recent company reports and comparisons saved locally in your
                        browser. No database is required for this demo version.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={refreshHistory}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-lg shadow-slate-900/5 transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/10 dark:text-slate-300"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Refresh
                    </button>

                    {items.length > 0 && (
                        <button
                            onClick={clearHistory}
                            className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-400/10 px-5 py-3 text-sm font-bold text-red-600 transition hover:-translate-y-0.5 dark:text-red-300"
                        >
                            <Trash2 className="h-4 w-4" />
                            Clear History
                        </button>
                    )}
                </div>
            </div>

            <div className="mb-8 grid gap-5 md:grid-cols-3">
                <HistoryStat
                    icon={<History className="h-5 w-5" />}
                    label="Total Items"
                    value={`${items.length}`}
                />

                <HistoryStat
                    icon={<Search className="h-5 w-5" />}
                    label="Research Reports"
                    value={`${researchItems.length}`}
                />

                <HistoryStat
                    icon={<BarChart3 className="h-5 w-5" />}
                    label="Comparisons"
                    value={`${compareItems.length}`}
                />
            </div>

            {items.length === 0 ? (
                <EmptyHistory />
            ) : (
                <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
                    <HistoryColumn
                        title="Company Reports"
                        description="Single-company research memos generated by the agent."
                        icon={<Search className="h-5 w-5" />}
                        items={researchItems}
                        emptyText="No single-company reports saved yet."
                        onOpenReport={onOpenReport}
                        onOpenComparison={onOpenComparison}
                    />

                    <HistoryColumn
                        title="Comparisons"
                        description="Multi-company comparison runs with ranked winners."
                        icon={<BarChart3 className="h-5 w-5" />}
                        items={compareItems}
                        emptyText="No comparison reports saved yet."
                        onOpenReport={onOpenReport}
                        onOpenComparison={onOpenComparison}
                    />
                </div>
            )}
        </section>
    );
}

function HistoryStat({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-cyan-600 dark:bg-white/10 dark:text-cyan-300">
                {icon}
            </div>

            <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                {label}
            </p>

            <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">
                {value}
            </p>
        </div>
    );
}

function EmptyHistory() {
    return (
        <div className="overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/30">
            <div className="grid lg:grid-cols-[1fr_0.75fr]">
                <div className="p-8 md:p-10">
                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300">
                        <History className="h-8 w-8" />
                    </div>

                    <h2 className="text-4xl font-black tracking-tight text-slate-950 dark:text-white">
                        No saved research yet
                    </h2>

                    <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
                        Run a company research report or comparison first. The result will
                        be saved locally and appear here automatically.
                    </p>

                    <div className="mt-8 grid gap-3">
                        <EmptyStep text="Run Apple, Microsoft, or Nvidia research" />
                        <EmptyStep text="Compare Nvidia, Tesla, Netflix" />
                        <EmptyStep text="Return here to reopen saved outputs" />
                    </div>
                </div>

                <div className="relative bg-slate-950 p-8 text-white md:p-10">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.26),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(139,92,246,0.24),_transparent_35%)]" />

                    <div className="relative">
                        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/10">
                            <FileText className="h-8 w-8 text-cyan-300" />
                        </div>

                        <p className="mb-3 text-sm font-black uppercase tracking-[0.3em] text-cyan-300">
                            Local Storage
                        </p>

                        <h3 className="text-3xl font-black">Browser-based archive</h3>

                        <p className="mt-4 text-sm leading-7 text-slate-300">
                            This project stores recent reports locally with localStorage. It
                            keeps the assignment lightweight while still providing a real
                            product-like history feature.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function EmptyStep({ text }: { text: string }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-300">
            {text}
        </div>
    );
}

function HistoryColumn({
    title,
    description,
    icon,
    items,
    emptyText,
    onOpenReport,
    onOpenComparison,
}: {
    title: string;
    description: string;
    icon: React.ReactNode;
    items: HistoryItem[];
    emptyText: string;
    onOpenReport: (report: InvestmentResearchReport) => void;
    onOpenComparison: (comparison: ComparisonData) => void;
}) {
    return (
        <div className="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/30 md:p-8">
            <div className="mb-6 flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                    {icon}
                </div>

                <div>
                    <h2 className="text-2xl font-black text-slate-950 dark:text-white">
                        {title}
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                        {description}
                    </p>
                </div>
            </div>

            {items.length === 0 ? (
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6 text-sm font-semibold text-slate-500 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-400">
                    {emptyText}
                </div>
            ) : (
                <div className="space-y-4">
                    {items.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                if (item.type === "research") {
                                    onOpenReport(item.payload);
                                } else {
                                    onOpenComparison(item.payload);
                                }
                            }}
                            className="group w-full rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 text-left transition hover:-translate-y-0.5 hover:border-cyan-400/40 hover:bg-white dark:border-white/10 dark:bg-slate-950/60 dark:hover:bg-white/[0.06]"
                        >
                            <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">
                                        {item.type === "research" ? "Research" : "Comparison"}
                                    </p>

                                    <h3 className="mt-2 line-clamp-1 text-xl font-black text-slate-950 dark:text-white">
                                        {item.title}
                                    </h3>

                                    <p className="mt-1 line-clamp-1 text-sm text-slate-500 dark:text-slate-400">
                                        {item.subtitle}
                                    </p>
                                </div>

                                <span
                                    className={`rounded-full border px-3 py-1 text-xs font-black ${decisionStyles(
                                        item.decision
                                    )}`}
                                >
                                    {item.decision}
                                </span>
                            </div>

                            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/5">
                                <span className="text-sm font-bold text-slate-500">
                                    Score
                                </span>

                                <span className="text-2xl font-black text-slate-950 dark:text-white">
                                    {item.score}
                                </span>
                            </div>

                            <div className="mt-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                <Clock3 className="h-4 w-4" />
                                {formatDate(item.createdAt)}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}