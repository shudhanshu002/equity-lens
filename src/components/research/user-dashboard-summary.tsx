"use client";

import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
    ArrowRight,
    BarChart3,
    Bookmark,
    CheckCircle2,
    Database,
    Download,
    FileText,
    History,
    Loader2,
    Lock,
    RefreshCcw,
    ShieldCheck,
    Sparkles,
    TrendingUp,
    UserCircle2,
} from "lucide-react";
import type { AppTab } from "@/lib/frontend/app-tabs";
import {
    formatDashboardDate,
    getDashboardCompletionScore,
    getDashboardGreeting,
    getDashboardHealthLabel,
    getUserDashboard,
    type UserDashboardData,
} from "@/lib/user-data/dashboard-client";

type UserDashboardSummaryProps = {
    onTabChange: (tab: AppTab) => void;
    onPickResearch?: (company: string) => void;
};

export function UserDashboardSummary({
    onTabChange,
    onPickResearch,
}: UserDashboardSummaryProps) {
    const { status } = useSession();

    const [dashboard, setDashboard] = useState<UserDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const loggedIn = status === "authenticated";

    const loadDashboard = useCallback(async () => {
        if (!loggedIn) {
            setDashboard(null);
            setLoading(false);
            return;
        }

        setError("");

        try {
            const data = await getUserDashboard();
            setDashboard(data);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load your dashboard."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [loggedIn]);

    useEffect(() => {
        if (status !== "loading") {
            void loadDashboard();
        }
    }, [loadDashboard, status]);

    async function refreshDashboard() {
        setRefreshing(true);
        await loadDashboard();
    }

    function openLatestResearch() {
        const latestResearch = dashboard?.latest.historyItems.find(
            (item) => item.type === "RESEARCH"
        );

        const company =
            latestResearch?.title ||
            latestResearch?.symbol ||
            dashboard?.latest.watchlistItems[0]?.company ||
            "Nvidia";

        onPickResearch?.(company);
        onTabChange("research");
    }

    if (status === "loading" || loading) {
        return <DashboardLoadingState />;
    }

    if (!loggedIn) {
        return <LoggedOutDashboard onTabChange={onTabChange} />;
    }

    if (!dashboard) {
        return (
            <section className="rounded-[2.5rem] border border-red-400/20 bg-red-400/10 p-8">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-sm font-black uppercase tracking-[0.25em] text-red-600 dark:text-red-300">
                            Dashboard unavailable
                        </p>

                        <h2 className="mt-2 text-3xl font-black text-slate-950 dark:text-white">
                            We could not load your workspace.
                        </h2>

                        <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-300">
                            {error || "Please refresh and try again."}
                        </p>
                    </div>

                    <button
                        onClick={() => void refreshDashboard()}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white dark:bg-white dark:text-slate-950"
                    >
                        <RefreshCcw className="h-4 w-4" />
                        Try Again
                    </button>
                </div>
            </section>
        );
    }

    const completionScore = getDashboardCompletionScore(dashboard);
    const healthLabel = getDashboardHealthLabel(dashboard);

    return (
        <div className="space-y-8">
            <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="relative overflow-hidden rounded-[2.75rem] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/30 md:p-9">
                    <div className="absolute right-[-15%] top-[-35%] h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-400/10" />
                    <div className="absolute bottom-[-42%] left-[20%] h-96 w-96 rounded-full bg-violet-400/20 blur-3xl dark:bg-violet-400/10" />

                    <div className="relative">
                        <div className="mb-5 flex flex-wrap items-center gap-3">
                            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-black text-cyan-700 dark:text-cyan-300">
                                <Sparkles className="h-4 w-4" />
                                Investor Workspace
                            </span>

                            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-black text-emerald-700 dark:text-emerald-300">
                                <Database className="h-4 w-4" />
                                PostgreSQL Synced
                            </span>
                        </div>

                        <h1 className="max-w-4xl text-4xl font-black tracking-tight text-slate-950 dark:text-white md:text-6xl">
                            {getDashboardGreeting(dashboard.profile)}
                        </h1>

                        <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300">
                            Your research reports, comparisons, watchlist ideas, exports, and
                            account settings are available in one AI investment workspace.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <button
                                onClick={() => onTabChange("research")}
                                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white shadow-xl shadow-slate-900/20 transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950"
                            >
                                Start Research
                                <Sparkles className="h-4 w-4" />
                            </button>

                            <button
                                onClick={() => onTabChange("compare")}
                                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-black text-slate-700 shadow-lg shadow-slate-900/5 transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
                            >
                                Compare Companies
                                <BarChart3 className="h-4 w-4" />
                            </button>

                            <button
                                onClick={() => void refreshDashboard()}
                                disabled={refreshing}
                                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-lg shadow-slate-900/5 transition hover:-translate-y-0.5 disabled:opacity-60 dark:border-white/10 dark:bg-white/10 dark:text-slate-300"
                                aria-label="Refresh dashboard"
                            >
                                <RefreshCcw
                                    className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                                />
                            </button>
                        </div>

                        {error && (
                            <p className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-bold text-red-600 dark:text-red-300">
                                {error}
                            </p>
                        )}
                    </div>
                </div>

                <WorkspaceStatusCard
                    completionScore={completionScore}
                    healthLabel={healthLabel}
                    emailVerified={Boolean(dashboard.profile.emailVerified)}
                    joinedAt={dashboard.profile.createdAt}
                    onSettings={() => onTabChange("settings")}
                />
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <DashboardMetric
                    icon={<Bookmark className="h-5 w-5" />}
                    label="Watchlist"
                    value={String(dashboard.metrics.watchlistCount)}
                    helper="Saved companies"
                    onClick={() => onTabChange("portfolio")}
                />

                <DashboardMetric
                    icon={<FileText className="h-5 w-5" />}
                    label="Research"
                    value={String(dashboard.metrics.researchCount)}
                    helper="Saved reports"
                    onClick={() => onTabChange("history")}
                />

                <DashboardMetric
                    icon={<BarChart3 className="h-5 w-5" />}
                    label="Comparisons"
                    value={String(dashboard.metrics.comparisonCount)}
                    helper="Company rankings"
                    onClick={() => onTabChange("history")}
                />

                <DashboardMetric
                    icon={<Download className="h-5 w-5" />}
                    label="Exports"
                    value={String(dashboard.metrics.exportCount)}
                    helper="Generated files"
                    onClick={() => onTabChange("exports")}
                />

                <DashboardMetric
                    icon={<TrendingUp className="h-5 w-5" />}
                    label="Average Score"
                    value={`${dashboard.metrics.averageResearchScore}%`}
                    helper="Saved analysis"
                    onClick={() => onTabChange("history")}
                />
            </section>

            <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
                <RecentResearchCard
                    dashboard={dashboard}
                    onHistory={() => onTabChange("history")}
                    onResearch={openLatestResearch}
                />

                <WatchlistPreviewCard
                    dashboard={dashboard}
                    onPortfolio={() => onTabChange("portfolio")}
                    onResearch={(company) => {
                        onPickResearch?.(company);
                        onTabChange("research");
                    }}
                />
            </section>

            <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <ExportPreviewCard
                    dashboard={dashboard}
                    onExports={() => onTabChange("exports")}
                />

                <NextActionCard
                    dashboard={dashboard}
                    onTabChange={onTabChange}
                />
            </section>
        </div>
    );
}

function DashboardLoadingState() {
    return (
        <section className="rounded-[2.5rem] border border-slate-200 bg-white p-12 text-center shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                <Loader2 className="h-7 w-7 animate-spin" />
            </div>

            <h2 className="text-3xl font-black text-slate-950 dark:text-white">
                Loading your workspace
            </h2>

            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                Fetching your latest research, watchlist, and export activity.
            </p>
        </section>
    );
}

function LoggedOutDashboard({
    onTabChange,
}: {
    onTabChange: (tab: AppTab) => void;
}) {
    return (
        <section className="relative overflow-hidden rounded-[2.75rem] border border-slate-200 bg-white p-7 shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-white/[0.04] md:p-10">
            <div className="absolute right-[-10%] top-[-35%] h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-400/10" />

            <div className="relative grid gap-8 xl:grid-cols-[1.1fr_0.9fr] xl:items-center">
                <div>
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm font-black text-amber-700 dark:text-amber-300">
                        <Lock className="h-4 w-4" />
                        Guest Workspace
                    </div>

                    <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 dark:text-white md:text-6xl">
                        Research publicly. Save privately.
                    </h1>

                    <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300">
                        You can run company research without signing in. Login enables
                        database-backed history, watchlists, exports, settings, and profile
                        management.
                    </p>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <button
                            onClick={() => onTabChange("research")}
                            className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white dark:bg-white dark:text-slate-950"
                        >
                            Try Research
                            <Sparkles className="h-4 w-4" />
                        </button>

                        <button
                            onClick={() => onTabChange("compare")}
                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-black text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
                        >
                            Compare Companies
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div className="rounded-[2.25rem] border border-slate-200 bg-slate-950 p-7 text-white shadow-2xl shadow-slate-900/20 dark:border-white/10">
                    <UserCircle2 className="h-12 w-12 text-cyan-300" />

                    <h2 className="mt-5 text-3xl font-black">
                        Account features
                    </h2>

                    <div className="mt-6 space-y-4">
                        <AccountFeature text="Persistent research history" />
                        <AccountFeature text="Database-backed watchlist" />
                        <AccountFeature text="Saved export records" />
                        <AccountFeature text="Synced provider preferences" />
                    </div>
                </div>
            </div>
        </section>
    );
}

function AccountFeature({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-3 text-sm font-bold text-slate-300">
            <CheckCircle2 className="h-5 w-5 text-emerald-300" />
            {text}
        </div>
    );
}

function WorkspaceStatusCard({
    completionScore,
    healthLabel,
    emailVerified,
    joinedAt,
    onSettings,
}: {
    completionScore: number;
    healthLabel: string;
    emailVerified: boolean;
    joinedAt: string;
    onSettings: () => void;
}) {
    return (
        <section className="rounded-[2.75rem] border border-slate-200 bg-slate-950 p-7 text-white shadow-2xl shadow-slate-900/20 dark:border-white/10 md:p-8">
            <div className="flex items-start justify-between gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                    <ShieldCheck className="h-7 w-7 text-emerald-300" />
                </div>

                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-black text-emerald-300">
                    {healthLabel}
                </span>
            </div>

            <h2 className="mt-6 text-3xl font-black">
                Workspace completion
            </h2>

            <div className="mt-5 flex items-end justify-between gap-4">
                <p className="text-5xl font-black">{completionScore}%</p>

                <p className="text-right text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                    Account readiness
                </p>
            </div>

            <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
                <div
                    className="h-full rounded-full bg-cyan-300 transition-all"
                    style={{ width: `${completionScore}%` }}
                />
            </div>

            <div className="mt-7 space-y-3">
                <StatusRow
                    label="Email verification"
                    value={emailVerified ? "Verified" : "Pending"}
                />

                <StatusRow
                    label="Member since"
                    value={formatDashboardDate(joinedAt)}
                />

                <StatusRow label="Storage" value="PostgreSQL" />
            </div>

            <button
                onClick={onSettings}
                className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-950 transition hover:-translate-y-0.5"
            >
                Manage Account
                <ArrowRight className="h-4 w-4" />
            </button>
        </section>
    );
}

function StatusRow({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3 last:border-b-0 last:pb-0">
            <span className="text-sm font-bold text-slate-400">{label}</span>
            <span className="text-sm font-black text-white">{value}</span>
        </div>
    );
}

function DashboardMetric({
    icon,
    label,
    value,
    helper,
    onClick,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    helper: string;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className="rounded-[2rem] border border-slate-200 bg-white p-5 text-left shadow-xl shadow-slate-900/5 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-900/10 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20"
        >
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
        </button>
    );
}

function RecentResearchCard({
    dashboard,
    onHistory,
    onResearch,
}: {
    dashboard: UserDashboardData;
    onHistory: () => void;
    onResearch: () => void;
}) {
    const items = dashboard.latest.historyItems.slice(0, 4);

    return (
        <DashboardSection
            icon={<History className="h-5 w-5" />}
            eyebrow="Recent activity"
            title="Research history"
            actionLabel="View History"
            onAction={onHistory}
        >
            {items.length > 0 ? (
                <div className="space-y-3">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-950/60"
                        >
                            <div className="min-w-0">
                                <p className="truncate font-black text-slate-950 dark:text-white">
                                    {item.title}
                                </p>

                                <p className="mt-1 text-xs font-bold text-slate-400">
                                    {item.type} · {formatDashboardDate(item.createdAt)}
                                </p>
                            </div>

                            {typeof item.score === "number" && (
                                <span className="shrink-0 rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-600 dark:text-emerald-300">
                                    {item.score}%
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <EmptyPreview
                    icon={<FileText className="h-6 w-6" />}
                    title="No research saved"
                    description="Run your first company analysis to populate your history."
                    buttonLabel="Start Research"
                    onClick={onResearch}
                />
            )}
        </DashboardSection>
    );
}

function WatchlistPreviewCard({
    dashboard,
    onPortfolio,
    onResearch,
}: {
    dashboard: UserDashboardData;
    onPortfolio: () => void;
    onResearch: (company: string) => void;
}) {
    const items = dashboard.latest.watchlistItems.slice(0, 4);

    return (
        <DashboardSection
            icon={<Bookmark className="h-5 w-5" />}
            eyebrow="Tracked ideas"
            title="Portfolio watchlist"
            actionLabel="Open Portfolio"
            onAction={onPortfolio}
        >
            {items.length > 0 ? (
                <div className="space-y-3">
                    {items.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onResearch(item.company)}
                            className="flex w-full items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:bg-white dark:border-white/10 dark:bg-slate-950/60 dark:hover:bg-white/10"
                        >
                            <div>
                                <p className="font-black text-slate-950 dark:text-white">
                                    {item.company}
                                </p>

                                <p className="mt-1 text-xs font-bold text-slate-400">
                                    {item.symbol ?? "N/A"} · {item.status}
                                </p>
                            </div>

                            <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-black text-cyan-600 dark:text-cyan-300">
                                {item.score}%
                            </span>
                        </button>
                    ))}
                </div>
            ) : (
                <EmptyPreview
                    icon={<Bookmark className="h-6 w-6" />}
                    title="No companies tracked"
                    description="Add companies to create your personal research queue."
                    buttonLabel="Open Portfolio"
                    onClick={onPortfolio}
                />
            )}
        </DashboardSection>
    );
}

function ExportPreviewCard({
    dashboard,
    onExports,
}: {
    dashboard: UserDashboardData;
    onExports: () => void;
}) {
    const items = dashboard.latest.exportItems.slice(0, 3);

    return (
        <DashboardSection
            icon={<Download className="h-5 w-5" />}
            eyebrow="Generated files"
            title="Recent exports"
            actionLabel="Open Exports"
            onAction={onExports}
        >
            {items.length > 0 ? (
                <div className="space-y-3">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-950/60"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="truncate font-black text-slate-950 dark:text-white">
                                        {item.title}
                                    </p>

                                    <p className="mt-1 text-xs font-bold text-slate-400">
                                        {item.type} · {formatDashboardDate(item.createdAt)}
                                    </p>
                                </div>

                                <span className="rounded-full bg-orange-400/10 px-3 py-1 text-xs font-black text-orange-600 dark:text-orange-300">
                                    {item.format}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <EmptyPreview
                    icon={<Download className="h-6 w-6" />}
                    title="No exports generated"
                    description="Export your latest research report as JSON, Markdown, CSV, or PDF-ready text."
                    buttonLabel="Open Exports"
                    onClick={onExports}
                />
            )}
        </DashboardSection>
    );
}

function NextActionCard({
    dashboard,
    onTabChange,
}: {
    dashboard: UserDashboardData;
    onTabChange: (tab: AppTab) => void;
}) {
    let title = "Run your first investment research report";
    let description =
        "Analyze a public company using fundamentals, sentiment, scoring, and an AI-generated investment memo.";
    let buttonLabel = "Start Research";
    let targetTab: AppTab = "research";

    if (
        dashboard.metrics.researchCount > 0 &&
        dashboard.metrics.watchlistCount === 0
    ) {
        title = "Build your portfolio watchlist";
        description =
            "Save interesting companies and create a focused research queue.";
        buttonLabel = "Open Portfolio";
        targetTab = "portfolio";
    } else if (
        dashboard.metrics.watchlistCount > 1 &&
        dashboard.metrics.comparisonCount === 0
    ) {
        title = "Compare your strongest ideas";
        description =
            "Rank multiple companies and identify the strongest investment candidate.";
        buttonLabel = "Compare Companies";
        targetTab = "compare";
    } else if (
        dashboard.metrics.historyCount > 0 &&
        dashboard.metrics.exportCount === 0
    ) {
        title = "Export your research output";
        description =
            "Generate a reusable report for your assignment, review, or documentation.";
        buttonLabel = "Open Exports";
        targetTab = "exports";
    }

    return (
        <section className="relative overflow-hidden rounded-[2.5rem] border border-emerald-400/20 bg-emerald-400/10 p-7 md:p-8">
            <div className="absolute right-[-12%] top-[-40%] h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />

            <div className="relative">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-xl shadow-emerald-500/20">
                    <TrendingUp className="h-7 w-7" />
                </div>

                <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-700 dark:text-emerald-300">
                    Recommended next action
                </p>

                <h3 className="mt-3 max-w-2xl text-3xl font-black text-slate-950 dark:text-white">
                    {title}
                </h3>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-700 dark:text-slate-300">
                    {description}
                </p>

                <button
                    onClick={() => onTabChange(targetTab)}
                    className="mt-7 inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white shadow-xl shadow-slate-900/15 transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950"
                >
                    {buttonLabel}
                    <ArrowRight className="h-4 w-4" />
                </button>
            </div>
        </section>
    );
}

function DashboardSection({
    icon,
    eyebrow,
    title,
    actionLabel,
    onAction,
    children,
}: {
    icon: React.ReactNode;
    eyebrow: string;
    title: string;
    actionLabel: string;
    onAction: () => void;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20 md:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
                <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-cyan-600 dark:bg-white/10 dark:text-cyan-300">
                        {icon}
                    </div>

                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-600 dark:text-cyan-300">
                            {eyebrow}
                        </p>

                        <h3 className="mt-1 text-2xl font-black text-slate-950 dark:text-white">
                            {title}
                        </h3>
                    </div>
                </div>

                <button
                    onClick={onAction}
                    className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-black text-slate-600 transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-300 sm:inline-flex"
                >
                    {actionLabel}
                    <ArrowRight className="h-3.5 w-3.5" />
                </button>
            </div>

            {children}
        </section>
    );
}

function EmptyPreview({
    icon,
    title,
    description,
    buttonLabel,
    onClick,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    buttonLabel: string;
    onClick: () => void;
}) {
    return (
        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-white/10 dark:bg-slate-950/60">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm dark:bg-white/10">
                {icon}
            </div>

            <h4 className="text-xl font-black text-slate-950 dark:text-white">
                {title}
            </h4>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-400">
                {description}
            </p>

            <button
                onClick={onClick}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white dark:bg-white dark:text-slate-950"
            >
                {buttonLabel}
                <ArrowRight className="h-4 w-4" />
            </button>
        </div>
    );
}