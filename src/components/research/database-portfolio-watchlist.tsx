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

    return (
        <div className="space-y-5 pt-3">
            <section className="border-b border-slate-200 pb-5 dark:border-white/10">
                    <div className="flex flex-wrap items-start justify-between gap-5">
                        <div>
                            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-300"><LineChart className="h-4 w-4" />Portfolio Watchlist</div>
                            <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">Investment ideas</h2>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Track, research, and compare companies from one workspace.</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={compareTopIdeas}
                                disabled={watchlist.length < 2}
                                className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
                            >
                                Compare Top Ideas
                                <BarChart3 className="h-4 w-4" />
                            </button>

                        </div>
                    </div>
                    <div className="mt-5 grid grid-cols-3 divide-x divide-slate-200 border-y border-slate-200 py-3 dark:divide-white/10 dark:border-white/10">
                        <InlineMetric label="Companies" value={String(watchlist.length)} />
                        <InlineMetric label="Average score" value={`${averageScore}%`} />
                        <InlineMetric label="Lower risk" value={String(lowerRiskCount)} />
                    </div>
                        {message && (
                            <div className="mt-3 text-sm text-emerald-600 dark:text-emerald-300">
                                {message}
                            </div>
                        )}

                        {error && (
                            <div className="mt-3 text-sm text-red-600 dark:text-red-300">
                                {error}
                            </div>
                        )}
            </section>

            <WatchlistSyncBanner onSynced={() => void reloadWatchlist()} />

            <section className="border-b border-slate-200 pb-5 dark:border-white/10">
                <div className="mb-3 flex items-center justify-between gap-4">
                    <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Add company</h3>

                    <div
                        className={`rounded-md px-2 py-1 text-xs font-medium ${loggedIn
                                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-600 dark:text-emerald-300"
                                : "border-amber-400/20 bg-amber-400/10 text-amber-700 dark:text-amber-300"
                            }`}
                    >
                        {loggedIn ? "Database synced" : "Local demo mode"}
                    </div>
                </div>

                <div className="flex flex-col gap-2 md:flex-row">
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
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
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

            <section className="divide-y divide-slate-200 border-y border-slate-200 dark:divide-white/10 dark:border-white/10">
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

function InlineMetric({ label, value }: { label: string; value: string }) {
    return <div className="px-4 first:pl-0"><p className="text-xs text-slate-400">{label}</p><p className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">{value}</p></div>;
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
        <article className="group grid gap-4 py-5 lg:grid-cols-[minmax(0,1fr)_90px_110px_130px_auto] lg:items-center">
            <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="text-xs font-medium text-slate-400">#{rank}</span><h3 className="truncate text-base font-semibold text-slate-950 dark:text-white">{item.company}</h3><span className="font-mono text-xs text-slate-400">{item.symbol}</span></div><p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.thesis}</p></div>
            <RowValue label="Score" value={`${item.score}%`} />
            <RowValue label="Risk" value={item.risk} />
            <RowValue label="Status" value={item.status} />
            <div className="flex items-center gap-1 lg:justify-end"><button onClick={onAnalyze} className="inline-flex h-9 items-center gap-2 rounded-lg bg-slate-950 px-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">Analyze <Sparkles className="h-3.5 w-3.5" /></button><button onClick={onRemove} aria-label={`Remove ${item.company}`} title="Remove" className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-400/10"><Trash2 className="h-4 w-4" /></button></div>
        </article>
    );

    /* Legacy card kept unreachable while the compact row is active. */
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

function RowValue({ label, value }: { label: string; value: string }) {
    return <div><p className="text-xs text-slate-400">{label}</p><p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">{value}</p></div>;
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
