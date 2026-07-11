"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
    ArrowRight,
    BarChart3,
    BookmarkPlus,
    Building2,
    CheckCircle2,
    Database,
    LineChart,
    Loader2,
    Lock,
    Plus,
    Search,
    ShieldCheck,
    Sparkles,
    Star,
    Trash2,
    TrendingUp,
} from "lucide-react";
import type { AppTab } from "@/lib/frontend/app-tabs";
import {
    addUserWatchlistItem,
    createDefaultWatchlistItem,
    deleteUserWatchlistItem,
    getUserWatchlist,
    mapCompanyToSymbol,
    type UserWatchlistItem,
    type WatchlistRisk,
    type WatchlistStatus,
} from "@/lib/user-data/watchlist-client";
import { WatchlistSyncBanner } from "@/components/research/watchlist-sync-banner";

type DatabasePortfolioWatchlistProps = {
    onTabChange: (tab: AppTab) => void;
    onPickResearch: (company: string) => void;
    onPickCompare: (companies: string) => void;
};

type DisplayWatchlistItem = {
    id: string;
    company: string;
    symbol: string;
    thesis: string;
    status: WatchlistStatus;
    score: number;
    risk: WatchlistRisk;
    source: "database" | "demo";
};

const DEFAULT_WATCHLIST: DisplayWatchlistItem[] = [
    {
        id: "demo-nvda",
        company: "Nvidia",
        symbol: "NVDA",
        thesis: "AI infrastructure leader with strong growth and profitability.",
        status: "High Conviction",
        score: 91,
        risk: "Medium",
        source: "demo",
    },
    {
        id: "demo-msft",
        company: "Microsoft",
        symbol: "MSFT",
        thesis: "Cloud, AI, enterprise software, and durable cash flow engine.",
        status: "Watchlist",
        score: 86,
        risk: "Low",
        source: "demo",
    },
    {
        id: "demo-aapl",
        company: "Apple",
        symbol: "AAPL",
        thesis: "Premium ecosystem with strong profitability but valuation sensitivity.",
        status: "Watchlist",
        score: 78,
        risk: "Medium",
        source: "demo",
    },
    {
        id: "demo-tsla",
        company: "Tesla",
        symbol: "TSLA",
        thesis: "High innovation potential, but valuation and execution risk remain elevated.",
        status: "Research",
        score: 67,
        risk: "High",
        source: "demo",
    },
];

export function DatabasePortfolioWatchlist({
    onTabChange,
    onPickResearch,
    onPickCompare,
}: DatabasePortfolioWatchlistProps) {
    const { status } = useSession();

    const [watchlist, setWatchlist] =
        useState<DisplayWatchlistItem[]>(DEFAULT_WATCHLIST);

    const [newCompany, setNewCompany] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const loggedIn = status === "authenticated";

    async function reloadWatchlist() {
        if (!loggedIn) return;

        setLoading(true);
        setError("");

        try {
            const items = await getUserWatchlist();
            setWatchlist(items.map(mapDatabaseItemToDisplay));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to reload watchlist.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        async function loadWatchlist() {
            setLoading(true);
            setError("");

            try {
                if (!loggedIn) {
                    setWatchlist(DEFAULT_WATCHLIST);
                    return;
                }

                const items = await getUserWatchlist();

                if (items.length === 0) {
                    setWatchlist([]);
                    return;
                }

                setWatchlist(items.map(mapDatabaseItemToDisplay));
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Failed to load watchlist."
                );
            } finally {
                setLoading(false);
            }
        }

        if (status !== "loading") {
            void loadWatchlist();
        }
    }, [loggedIn, status]);

    const averageScore = useMemo(() => {
        if (watchlist.length === 0) return 0;

        const total = watchlist.reduce((sum, item) => sum + item.score, 0);
        return Math.round(total / watchlist.length);
    }, [watchlist]);

    const highConvictionCount = watchlist.filter(
        (item) => item.status === "High Conviction"
    ).length;

    const lowerRiskCount = watchlist.filter(
        (item) => item.risk === "Low" || item.risk === "Medium"
    ).length;

    async function addCompany() {
        const cleaned = newCompany.trim();

        if (!cleaned || saving) return;

        const exists = watchlist.some(
            (item) => item.company.toLowerCase() === cleaned.toLowerCase()
        );

        if (exists) {
            setError("This company is already in your watchlist.");
            setNewCompany("");
            return;
        }

        setSaving(true);
        setMessage("");
        setError("");

        try {
            if (!loggedIn) {
                const localItem: DisplayWatchlistItem = {
                    id: `demo-${cleaned.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
                    company: cleaned,
                    symbol: mapCompanyToSymbol(cleaned),
                    thesis:
                        "Added locally. Login to sync your watchlist to PostgreSQL.",
                    status: "Research",
                    score: 50,
                    risk: "Medium",
                    source: "demo",
                };

                setWatchlist((current) => [localItem, ...current]);
                setMessage("Added locally. Login to save it to your account.");
                setNewCompany("");
                return;
            }

            const createdItem = await addUserWatchlistItem(
                createDefaultWatchlistItem(cleaned)
            );

            setWatchlist((current) => [
                mapDatabaseItemToDisplay(createdItem),
                ...current,
            ]);

            setMessage("Company added to your database watchlist.");
            setNewCompany("");
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to add company."
            );
        } finally {
            setSaving(false);
        }
    }

    async function removeCompany(item: DisplayWatchlistItem) {
        setMessage("");
        setError("");

        try {
            if (loggedIn && item.source === "database") {
                await deleteUserWatchlistItem(item.id);
            }

            setWatchlist((current) =>
                current.filter((currentItem) => currentItem.id !== item.id)
            );

            setMessage(
                loggedIn
                    ? "Company removed from your database watchlist."
                    : "Company removed locally."
            );
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to remove company."
            );
        }
    }

    function analyzeCompany(company: string) {
        onPickResearch(company);
        onTabChange("research");
    }

    function compareTopIdeas() {
        const companies = watchlist
            .slice()
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .map((item) => item.company)
            .join(", ");

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
                    Loading watchlist
                </h2>

                <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                    EquityLens is preparing your portfolio ideas.
                </p>
            </section>
        );
    }

    return (
        <div className="space-y-8">
            <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/30 md:p-8">
                    <div className="absolute right-[-12%] top-[-30%] h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl dark:bg-emerald-400/10" />
                    <div className="absolute bottom-[-34%] left-[18%] h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-400/10" />

                    <div className="relative">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-600 dark:text-emerald-300">
                            <LineChart className="h-4 w-4" />
                            Portfolio Watchlist
                        </div>

                        <h2 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 dark:text-white md:text-5xl">
                            Track ideas before turning them into full research reports.
                        </h2>

                        <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300">
                            Save companies to your watchlist, analyze them with the research
                            agent, or compare your top ideas side-by-side.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <button
                                onClick={compareTopIdeas}
                                disabled={watchlist.length < 2}
                                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white shadow-xl shadow-slate-900/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
                            >
                                Compare Top Ideas
                                <BarChart3 className="h-4 w-4" />
                            </button>

                            <button
                                onClick={() => analyzeCompany("Nvidia")}
                                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-black text-slate-700 shadow-lg shadow-slate-900/5 transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
                            >
                                Analyze Nvidia
                                <ArrowRight className="h-4 w-4" />
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
                    <PortfolioMetric
                        icon={<BookmarkPlus className="h-5 w-5" />}
                        label="Companies"
                        value={String(watchlist.length)}
                        helper="Saved ideas"
                    />

                    <PortfolioMetric
                        icon={<TrendingUp className="h-5 w-5" />}
                        label="Avg Score"
                        value={`${averageScore}%`}
                        helper="Watchlist quality"
                    />

                    <PortfolioMetric
                        icon={<ShieldCheck className="h-5 w-5" />}
                        label="Lower Risk"
                        value={String(lowerRiskCount)}
                        helper="Low / medium risk"
                    />
                </div>
            </section>

            <WatchlistSyncBanner onSynced={() => void reloadWatchlist()} />

            <section className="rounded-[2.5rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20 md:p-8">
                <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="mb-2 text-sm font-black uppercase tracking-[0.3em] text-cyan-600 dark:text-cyan-300">
                            Add company
                        </p>

                        <h3 className="text-3xl font-black text-slate-950 dark:text-white">
                            Build your research queue.
                        </h3>
                    </div>

                    <div
                        className={`rounded-full border px-4 py-2 text-xs font-black ${loggedIn
                                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-600 dark:text-emerald-300"
                                : "border-amber-400/20 bg-amber-400/10 text-amber-700 dark:text-amber-300"
                            }`}
                    >
                        {loggedIn ? "Database synced" : "Local demo mode"}
                    </div>
                </div>

                <div className="flex flex-col gap-3 rounded-[2rem] border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-slate-950/60 md:flex-row">
                    <div className="flex min-h-14 flex-1 items-center gap-3 px-3">
                        <Search className="h-5 w-5 text-slate-400" />

                        <input
                            value={newCompany}
                            onChange={(event) => setNewCompany(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    void addCompany();
                                }
                            }}
                            placeholder="Add Apple, Microsoft, Amazon..."
                            className="w-full bg-transparent text-base font-bold text-slate-950 outline-none placeholder:text-slate-400 dark:text-white"
                        />
                    </div>

                    <button
                        onClick={() => void addCompany()}
                        disabled={!newCompany.trim() || saving}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-xl shadow-slate-900/15 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Adding
                            </>
                        ) : (
                            <>
                                <Plus className="h-4 w-4" />
                                Add to Watchlist
                            </>
                        )}
                    </button>
                </div>
            </section>

            {!loggedIn && (
                <section className="rounded-[2.5rem] border border-amber-400/20 bg-amber-400/10 p-6 md:p-8">
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <div>
                            <div className="mb-3 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                <Lock className="h-5 w-5" />
                                <p className="font-black">Login to sync watchlist</p>
                            </div>

                            <p className="max-w-3xl text-sm leading-7 text-slate-700 dark:text-slate-300">
                                You are seeing demo/local watchlist behavior. After login, new
                                companies are saved to PostgreSQL and linked to your account.
                            </p>
                        </div>

                        <div className="inline-flex shrink-0 items-center gap-2 rounded-full border border-amber-400/20 bg-white/50 px-5 py-3 text-sm font-black text-amber-700 dark:bg-white/10 dark:text-amber-300">
                            <Database className="h-4 w-4" />
                            Database ready
                        </div>
                    </div>
                </section>
            )}

            <section className="grid gap-5 lg:grid-cols-2">
                {watchlist.map((item, index) => (
                    <WatchlistCard
                        key={item.id}
                        item={item}
                        rank={index + 1}
                        onAnalyze={() => analyzeCompany(item.company)}
                        onRemove={() => void removeCompany(item)}
                    />
                ))}
            </section>

            {watchlist.length === 0 && (
                <section className="rounded-[2.5rem] border border-dashed border-slate-300 bg-white p-10 text-center dark:border-white/10 dark:bg-white/[0.04]">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400 dark:bg-white/10">
                        <Star className="h-8 w-8" />
                    </div>

                    <h3 className="text-2xl font-black text-slate-950 dark:text-white">
                        No companies in your watchlist
                    </h3>

                    <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600 dark:text-slate-400">
                        Add companies you want to research later. Logged-in users save this
                        watchlist to PostgreSQL.
                    </p>
                </section>
            )}
        </div>
    );
}

function mapDatabaseItemToDisplay(item: UserWatchlistItem): DisplayWatchlistItem {
    return {
        id: item.id,
        company: item.company,
        symbol: item.symbol ?? mapCompanyToSymbol(item.company),
        thesis:
            item.thesis ??
            "Added manually. Run research to generate a full AI investment memo.",
        status: item.status,
        score: item.score,
        risk: item.risk,
        source: "database",
    };
}

function PortfolioMetric({
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
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-cyan-600 dark:bg-white/10 dark:text-cyan-300">
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

function WatchlistCard({
    item,
    rank,
    onAnalyze,
    onRemove,
}: {
    item: DisplayWatchlistItem;
    rank: number;
    onAnalyze: () => void;
    onRemove: () => void;
}) {
    return (
        <article className="group rounded-[2.25rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5 transition hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-slate-900/10 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20 md:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-xl shadow-slate-900/20 dark:bg-white dark:text-slate-950">
                        <Building2 className="h-6 w-6" />
                    </div>

                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-xl font-black text-slate-950 dark:text-white">
                                {item.company}
                            </h3>

                            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-xs font-black text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                                {item.symbol}
                            </span>
                        </div>

                        <p className="mt-1 text-sm font-bold text-slate-400">
                            Rank #{rank} · {item.source === "database" ? "Database" : "Demo"}
                        </p>
                    </div>
                </div>

                <button
                    onClick={onRemove}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-400 transition hover:border-red-400/30 hover:bg-red-400/10 hover:text-red-500 dark:border-white/10 dark:bg-white/5"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>

            <p className="min-h-[52px] text-sm leading-7 text-slate-600 dark:text-slate-300">
                {item.thesis}
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <SmallInfo label="Score" value={`${item.score}%`} />
                <SmallInfo label="Risk" value={item.risk} />
                <SmallInfo label="Status" value={item.status} />
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                <div
                    className="h-full rounded-full bg-slate-950 dark:bg-cyan-300"
                    style={{ width: `${item.score}%` }}
                />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
                <button
                    onClick={onAnalyze}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-xl shadow-slate-900/15 transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950"
                >
                    Analyze
                    <Sparkles className="h-4 w-4" />
                </button>

                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-5 py-3 text-sm font-black text-emerald-600 dark:text-emerald-300">
                    <CheckCircle2 className="h-4 w-4" />
                    Saved
                </div>
            </div>
        </article>
    );
}

function SmallInfo({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-950/60">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                {label}
            </p>

            <p className="mt-1 text-sm font-black text-slate-950 dark:text-white">
                {value}
            </p>
        </div>
    );
}