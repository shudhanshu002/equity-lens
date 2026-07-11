"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
    BarChart3,
    Brain,
    CalendarDays,
    Database,
    FileText,
    History,
    Loader2,
    Lock,
    RefreshCcw,
    Search,
    ShieldCheck,
    Sparkles,
    Trash2,
} from "lucide-react";
import type { AppTab } from "@/lib/frontend/app-tabs";
import {
    clearUserHistory,
    deleteUserHistoryItem,
    getUserHistory,
    isComparisonPayload,
    isResearchPayload,
    type UserHistoryItem,
    type UserHistoryItemType,
} from "@/lib/user-data/history-client";
import { HistorySyncBanner } from "@/components/research/history-sync-banner";

type DatabaseHistoryCenterProps = {
    onTabChange: (tab: AppTab) => void;
    onPickResearch: (company: string) => void;
    onPickCompare: (companies: string) => void;
};

export function DatabaseHistoryCenter({
    onTabChange,
    onPickResearch,
    onPickCompare,
}: DatabaseHistoryCenterProps) {
    const { status } = useSession();

    const [historyItems, setHistoryItems] = useState<UserHistoryItem[]>([]);
    const [activeFilter, setActiveFilter] = useState<"ALL" | UserHistoryItemType>(
        "ALL"
    );

    const [loading, setLoading] = useState(true);
    const [workingId, setWorkingId] = useState<string | null>(null);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const loggedIn = status === "authenticated";

    useEffect(() => {
        async function loadHistory() {
            setLoading(true);
            setError("");

            try {
                if (!loggedIn) {
                    setHistoryItems([]);
                    return;
                }

                const items = await getUserHistory(
                    activeFilter === "ALL" ? undefined : activeFilter
                );

                setHistoryItems(items);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load history.");
            } finally {
                setLoading(false);
            }
        }

        if (status !== "loading") {
            void loadHistory();
        }
    }, [activeFilter, loggedIn, status]);

    const stats = useMemo(() => {
        const researchCount = historyItems.filter(
            (item) => item.type === "RESEARCH"
        ).length;

        const comparisonCount = historyItems.filter(
            (item) => item.type === "COMPARISON"
        ).length;

        const averageScore =
            historyItems.length === 0
                ? 0
                : Math.round(
                    historyItems.reduce((sum, item) => sum + (item.score ?? 0), 0) /
                    historyItems.length
                );

        return {
            researchCount,
            comparisonCount,
            averageScore,
        };
    }, [historyItems]);

    async function refreshHistory() {
        if (!loggedIn) return;

        setLoading(true);
        setMessage("");
        setError("");

        try {
            const items = await getUserHistory(
                activeFilter === "ALL" ? undefined : activeFilter
            );

            setHistoryItems(items);
            setMessage("History refreshed.");
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to refresh history."
            );
        } finally {
            setLoading(false);
        }
    }

    async function removeItem(id: string) {
        setWorkingId(id);
        setMessage("");
        setError("");

        try {
            await deleteUserHistoryItem(id);

            setHistoryItems((current) => current.filter((item) => item.id !== id));
            setMessage("History item removed.");
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to remove history item."
            );
        } finally {
            setWorkingId(null);
        }
    }

    async function clearAll() {
        if (historyItems.length === 0) return;

        setWorkingId("clear-all");
        setMessage("");
        setError("");

        try {
            await clearUserHistory();

            setHistoryItems([]);
            setMessage("All history cleared.");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to clear history.");
        } finally {
            setWorkingId(null);
        }
    }

    function openAgain(item: UserHistoryItem) {
        if (item.type === "RESEARCH") {
            const company = getResearchCompany(item);

            onPickResearch(company);
            onTabChange("research");
            return;
        }

        const companies = getComparisonCompanies(item);

        onPickCompare(companies);
        onTabChange("compare");
    }

    if (loading) {
        return (
            <section className="rounded-[2.5rem] border border-slate-200 bg-white p-10 text-center shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                    <Loader2 className="h-7 w-7 animate-spin" />
                </div>

                <h2 className="text-3xl font-black text-slate-950 dark:text-white">
                    Loading history
                </h2>

                <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                    EquityLens is fetching your saved research activity.
                </p>
            </section>
        );
    }

    return (
        <div className="space-y-8">
            <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/30 md:p-8">
                    <div className="absolute right-[-12%] top-[-30%] h-80 w-80 rounded-full bg-blue-400/20 blur-3xl dark:bg-blue-400/10" />
                    <div className="absolute bottom-[-34%] left-[18%] h-80 w-80 rounded-full bg-violet-400/20 blur-3xl dark:bg-violet-400/10" />

                    <div className="relative">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-sm font-bold text-blue-600 dark:text-blue-300">
                            <History className="h-4 w-4" />
                            Research History
                        </div>

                        <h2 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 dark:text-white md:text-5xl">
                            Review every AI research run saved to your account.
                        </h2>

                        <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300">
                            Logged-in users can store research reports and comparison runs in
                            PostgreSQL instead of losing them after refresh.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <button
                                onClick={() => void refreshHistory()}
                                disabled={!loggedIn || loading}
                                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white shadow-xl shadow-slate-900/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
                            >
                                Refresh
                                <RefreshCcw className="h-4 w-4" />
                            </button>

                            <button
                                onClick={() => void clearAll()}
                                disabled={!loggedIn || historyItems.length === 0}
                                className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-400/10 px-6 py-3 text-sm font-black text-red-600 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 dark:text-red-300"
                            >
                                {workingId === "clear-all" ? (
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
                    <HistoryMetric
                        icon={<FileText className="h-5 w-5" />}
                        label="Research"
                        value={String(stats.researchCount)}
                        helper="Single-company reports"
                    />

                    <HistoryMetric
                        icon={<BarChart3 className="h-5 w-5" />}
                        label="Comparisons"
                        value={String(stats.comparisonCount)}
                        helper="Multi-company runs"
                    />

                    <HistoryMetric
                        icon={<Brain className="h-5 w-5" />}
                        label="Avg Score"
                        value={`${stats.averageScore}%`}
                        helper="Saved result average"
                    />
                </div>
            </section>

            <HistorySyncBanner onSynced={() => void refreshHistory()} />

            {!loggedIn && (
                <section className="rounded-[2.5rem] border border-amber-400/20 bg-amber-400/10 p-6 md:p-8">
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <div>
                            <div className="mb-3 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                <Lock className="h-5 w-5" />
                                <p className="font-black">Login required for database history</p>
                            </div>

                            <p className="max-w-3xl text-sm leading-7 text-slate-700 dark:text-slate-300">
                                History is account-based. After login, completed research and
                                comparison reports can be saved to PostgreSQL.
                            </p>
                        </div>

                        <div className="inline-flex shrink-0 items-center gap-2 rounded-full border border-amber-400/20 bg-white/50 px-5 py-3 text-sm font-black text-amber-700 dark:bg-white/10 dark:text-amber-300">
                            <Database className="h-4 w-4" />
                            PostgreSQL ready
                        </div>
                    </div>
                </section>
            )}

            <section className="rounded-[2.5rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20 md:p-8">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="mb-2 text-sm font-black uppercase tracking-[0.3em] text-cyan-600 dark:text-cyan-300">
                            Saved activity
                        </p>

                        <h3 className="text-3xl font-black text-slate-950 dark:text-white">
                            History timeline
                        </h3>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {(["ALL", "RESEARCH", "COMPARISON"] as const).map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`rounded-full px-4 py-2 text-xs font-black transition ${activeFilter === filter
                                        ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                                        : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                {historyItems.length > 0 ? (
                    <div className="space-y-4">
                        {historyItems.map((item) => (
                            <HistoryCard
                                key={item.id}
                                item={item}
                                working={workingId === item.id}
                                onOpen={() => openAgain(item)}
                                onRemove={() => void removeItem(item.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 p-10 text-center dark:border-white/10 dark:bg-slate-950/60">
                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-slate-400 shadow-sm dark:bg-white/10">
                            <Search className="h-8 w-8" />
                        </div>

                        <h3 className="text-2xl font-black text-slate-950 dark:text-white">
                            No saved history yet
                        </h3>

                        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600 dark:text-slate-400">
                            Run a research report or company comparison. The next integration
                            file will automatically save completed results here.
                        </p>
                    </div>
                )}
            </section>
        </div>
    );
}

function HistoryCard({
    item,
    working,
    onOpen,
    onRemove,
}: {
    item: UserHistoryItem;
    working: boolean;
    onOpen: () => void;
    onRemove: () => void;
}) {
    const isResearch = item.type === "RESEARCH";

    return (
        <article className="rounded-[2rem] border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-xl hover:shadow-slate-900/5 dark:border-white/10 dark:bg-slate-950/60 dark:hover:bg-white/[0.06] md:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex gap-4">
                    <div
                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${isResearch
                                ? "bg-cyan-400/10 text-cyan-600 dark:text-cyan-300"
                                : "bg-violet-400/10 text-violet-600 dark:text-violet-300"
                            }`}
                    >
                        {isResearch ? (
                            <FileText className="h-6 w-6" />
                        ) : (
                            <BarChart3 className="h-6 w-6" />
                        )}
                    </div>

                    <div>
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span
                                className={`rounded-full px-3 py-1 text-xs font-black ${isResearch
                                        ? "bg-cyan-400/10 text-cyan-600 dark:text-cyan-300"
                                        : "bg-violet-400/10 text-violet-600 dark:text-violet-300"
                                    }`}
                            >
                                {item.type}
                            </span>

                            {item.decision && (
                                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-black text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                                    {item.decision}
                                </span>
                            )}

                            {typeof item.score === "number" && (
                                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-600 dark:text-emerald-300">
                                    {item.score}%
                                </span>
                            )}
                        </div>

                        <h4 className="text-xl font-black text-slate-950 dark:text-white">
                            {item.title}
                        </h4>

                        {item.subtitle && (
                            <p className="mt-1 text-sm font-bold text-slate-500 dark:text-slate-400">
                                {item.subtitle}
                            </p>
                        )}

                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-bold text-slate-400">
                            <span className="inline-flex items-center gap-1.5">
                                <CalendarDays className="h-3.5 w-3.5" />
                                {formatDate(item.createdAt)}
                            </span>

                            {item.symbol && (
                                <span className="font-mono uppercase">{item.symbol}</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={onOpen}
                        className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-xl shadow-slate-900/10 transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950"
                    >
                        Open Again
                        <Sparkles className="h-4 w-4" />
                    </button>

                    <button
                        onClick={onRemove}
                        disabled={working}
                        className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-400/10 px-5 py-3 text-sm font-black text-red-600 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 dark:text-red-300"
                    >
                        {working ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Trash2 className="h-4 w-4" />
                        )}
                        Remove
                    </button>
                </div>
            </div>
        </article>
    );
}

function HistoryMetric({
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
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-blue-600 dark:bg-white/10 dark:text-blue-300">
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

function getResearchCompany(item: UserHistoryItem) {
    if (isResearchPayload(item.payload)) {
        return item.payload.company.name;
    }

    return item.title;
}

function getComparisonCompanies(item: UserHistoryItem) {
    if (isComparisonPayload(item.payload)) {
        const companies = item.payload.companies;

        if (Array.isArray(companies) && companies.length > 0) {
            return companies
                .map((report) => report.company.name)
                .filter(Boolean)
                .join(", ");
        }
    }

    return item.symbol ?? item.title;
}

function formatDate(value: string) {
    return new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}