"use client";

import { useEffect, useState } from "react";
import {
    BarChart3,
    Clock3,
    FileText,
    History,
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

type RecentHistoryProps = {
    currentReport: InvestmentResearchReport | null;
    currentComparison: ComparisonData | undefined;
    onOpenReport: (report: InvestmentResearchReport) => void;
    onOpenComparison: (comparison: ComparisonData) => void;
    compact?: boolean;
    conversationId?: string;
    onConversationSelect?: (id: string) => void;
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

function writeHistory(items: HistoryItem[]) {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 8)));
}

function createResearchHistoryItem(
    report: InvestmentResearchReport,
    conversationId: string
): HistoryItem {
    return {
        id: conversationId,
        type: "research",
        title: report.company.name,
        subtitle: `${report.company.symbol} · ${report.company.sector ?? "Unknown sector"
            }`,
        decision: report.decision,
        score: report.score.total,
        createdAt: report.generatedAt,
        payload: report,
    };
}

function createComparisonHistoryItem(comparison: ComparisonData, conversationId?: string): HistoryItem {
    const symbols = comparison.companies
        .map((item) => item.company.symbol)
        .join(" vs ");

    const generatedAt = comparison.metadata?.generatedAt ?? new Date().toISOString();
    const winnerName = comparison.comparison?.winnerName ?? comparison.comparison?.winner?.name ?? "No winner";
    const winnerSymbol = comparison.comparison?.winnerSymbol ?? comparison.comparison?.winner?.symbol ?? "N/A";
    const winnerDecision = comparison.comparison?.winnerDecision ?? "WATCHLIST";
    const winnerScore = comparison.comparison?.winnerScore ?? 0;

    return {
        id: conversationId ?? `compare-${symbols}-${generatedAt}`,
        type: "compare",
        title: symbols,
        subtitle: `Winner: ${winnerName} (${winnerSymbol})`,
        decision: winnerDecision,
        score: winnerScore,
        createdAt: generatedAt,
        payload: comparison,
    };
}

function saveItem(item: HistoryItem) {
    const existing = readHistory();

    const withoutDuplicate = existing.filter(
        (historyItem) => historyItem.id !== item.id
    );

    writeHistory([item, ...withoutDuplicate]);
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

export function RecentHistory({
    currentReport,
    currentComparison,
    onOpenReport,
    onOpenComparison,
    compact = false,
    conversationId,
    onConversationSelect,
}: RecentHistoryProps) {
    const [items, setItems] = useState<HistoryItem[]>([]);

    useEffect(() => {
        setItems(readHistory());
    }, []);

    useEffect(() => {
        if (!currentReport || !conversationId) return;

        const item = createResearchHistoryItem(currentReport, conversationId);

        saveItem(item);
        setItems(readHistory());
    }, [currentReport, conversationId]);

    useEffect(() => {
        if (!currentComparison) return;

        const item = createComparisonHistoryItem(currentComparison, conversationId);

        saveItem(item);
        setItems(readHistory());
    }, [currentComparison, conversationId]);

    function clearHistory() {
        window.localStorage.removeItem(STORAGE_KEY);
        setItems([]);
    }

    function deleteHistoryItem(id: string) {
        const nextItems = items.filter((item) => item.id !== id);
        writeHistory(nextItems);
        setItems(nextItems);
    }

    if (items.length === 0 && !compact) {
        return null;
    }

    if (compact) {
        return (
            <aside className="h-fit overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-white/10">
                    <div className="flex items-center gap-2">
                        <History className="h-4 w-4 text-slate-500" />
                        <h3 className="text-sm font-semibold text-slate-950 dark:text-white">History</h3>
                    </div>
                    {items.length > 0 && (
                        <button
                            onClick={clearHistory}
                            aria-label="Clear history"
                            title="Clear history"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-400/10 dark:hover:text-red-300"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    )}
                </div>

                <div className="scrollbar-none max-h-[calc(100vh-10rem)] space-y-1 overflow-y-auto p-2">
                    {items.length === 0 ? (
                        <p className="px-3 py-8 text-center text-xs leading-5 text-slate-400">
                            Your recent research will appear here.
                        </p>
                    ) : (
                        items.map((item) => (
                            <div
                                key={item.id}
                                className="group flex items-center rounded-lg transition hover:bg-slate-100 dark:hover:bg-white/[0.06]"
                            >
                                <button
                                    onClick={() => {
                                        onConversationSelect?.(item.id);
                                        if (item.type === "research") onOpenReport(item.payload);
                                        else onOpenComparison(item.payload);
                                    }}
                                    className="min-w-0 flex-1 px-3 py-3 text-left"
                                >
                                  <span className="flex items-start gap-3">
                                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300">
                                        {item.type === "research" ? <Search className="h-3.5 w-3.5" /> : <BarChart3 className="h-3.5 w-3.5" />}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate text-sm font-medium text-slate-800 dark:text-slate-100">{item.title}</span>
                                        <span className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                                            <Clock3 className="h-3 w-3" />
                                            {formatDate(item.createdAt)}
                                        </span>
                                    </span>
                                    <span className="text-xs font-semibold text-slate-400">{item.score}</span>
                                  </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => deleteHistoryItem(item.id)}
                                    aria-label={`Delete ${item.title} from history`}
                                    title="Delete chat"
                                    className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 opacity-100 transition hover:bg-red-50 hover:text-red-600 sm:opacity-0 sm:group-hover:opacity-100 dark:hover:bg-red-400/10 dark:hover:text-red-300"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </aside>
        );
    }

    return (
        <section className="mt-8 overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/30">
            <div className="grid lg:grid-cols-[0.75fr_1.25fr]">
                <div className="relative bg-slate-950 p-6 text-white md:p-7">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.24),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(139,92,246,0.22),_transparent_35%)]" />

                    <div className="relative">
                        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                            <History className="h-7 w-7 text-cyan-300" />
                        </div>

                        <p className="mb-2 text-sm font-black uppercase tracking-[0.3em] text-cyan-300">
                            Recent Work
                        </p>

                        <h3 className="text-2xl font-black">Saved Research History</h3>

                        <p className="mt-3 text-sm leading-7 text-slate-300">
                            Your latest reports and comparisons are saved locally in the
                            browser for quick reopening.
                        </p>

                        <button
                            onClick={clearHistory}
                            className="mt-6 inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm font-bold text-red-300 transition hover:bg-red-400/15"
                        >
                            <Trash2 className="h-4 w-4" />
                            Clear History
                        </button>
                    </div>
                </div>

                <div className="p-6 md:p-7">
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h3 className="text-xl font-black text-slate-950 dark:text-white">
                                Recently generated outputs
                            </h3>

                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                Click any item to reopen it without running the agent again.
                            </p>
                        </div>

                        <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-black text-cyan-600 dark:text-cyan-300">
                            {items.length} saved
                        </span>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
                                className="group rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 text-left transition hover:-translate-y-0.5 hover:border-cyan-400/40 hover:bg-white dark:border-white/10 dark:bg-slate-950/60 dark:hover:bg-white/[0.06]"
                            >
                                <div className="mb-4 flex items-start justify-between gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-cyan-600 shadow-sm dark:bg-white/10 dark:text-cyan-300">
                                        {item.type === "research" ? (
                                            <Search className="h-5 w-5" />
                                        ) : (
                                            <BarChart3 className="h-5 w-5" />
                                        )}
                                    </div>

                                    <span
                                        className={`rounded-full border px-3 py-1 text-xs font-black ${decisionStyles(
                                            item.decision
                                        )}`}
                                    >
                                        {item.decision}
                                    </span>
                                </div>

                                <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">
                                    {item.type === "research" ? "Research" : "Comparison"}
                                </p>

                                <h4 className="mt-2 line-clamp-1 text-lg font-black text-slate-950 dark:text-white">
                                    {item.title}
                                </h4>

                                <p className="mt-1 line-clamp-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                    {item.subtitle}
                                </p>

                                <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5">
                                    <span className="text-xs font-bold text-slate-500">
                                        Score
                                    </span>

                                    <span className="text-lg font-black text-slate-950 dark:text-white">
                                        {item.score}
                                    </span>
                                </div>

                                <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                    <Clock3 className="h-3.5 w-3.5" />
                                    {formatDate(item.createdAt)}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
