"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
    Activity,
    BarChart3,
    CheckCircle2,
    Clock,
    Database,
    Download,
    FileText,
    KeyRound,
    Loader2,
    RefreshCcw,
    ShieldAlert,
    ShieldCheck,
    Sparkles,
    TrendingUp,
    UserCheck,
    Users,
} from "lucide-react";
import {
    formatAdminStatsDate,
    getAdminStats,
    getAdminStatsActivityHealth,
    getAdminStatsGoogleRate,
    getAdminStatsPasswordRate,
    getAdminStatsUserName,
    getAdminStatsVerificationRate,
    getAdminStatsWorkspaceTotal,
    type AdminStatsData,
} from "@/lib/user-data/admin-stats-client";

export function AdminStatsPanel() {
    const { data: session, status } = useSession();

    const [stats, setStats] = useState<AdminStatsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const isAdmin = session?.user?.role === "ADMIN";

    async function loadStats() {
        if (!isAdmin) {
            setLoading(false);
            setRefreshing(false);
            return;
        }

        setError("");

        try {
            const data = await getAdminStats();
            setStats(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load admin stats.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        if (status !== "loading") {
            void loadStats();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, isAdmin]);

    async function refreshStats() {
        setRefreshing(true);
        await loadStats();
    }

    if (status === "loading" || loading) {
        return (
            <section className="rounded-[2.5rem] border border-slate-200 bg-white p-12 text-center shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04]">
                <Loader2 className="mx-auto h-10 w-10 animate-spin text-slate-400" />

                <h2 className="mt-5 text-3xl font-black text-slate-950 dark:text-white">
                    Loading admin stats
                </h2>

                <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                    Checking platform usage, users, sessions, and workspace activity.
                </p>
            </section>
        );
    }

    if (!isAdmin) {
        return (
            <section className="rounded-[2.75rem] border border-red-400/20 bg-red-400/10 p-8 text-center">
                <ShieldAlert className="mx-auto h-12 w-12 text-red-600 dark:text-red-300" />

                <h2 className="mt-5 text-3xl font-black text-slate-950 dark:text-white">
                    Admin stats require admin access
                </h2>

                <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-700 dark:text-slate-300">
                    Only users with the ADMIN role can view platform analytics.
                </p>
            </section>
        );
    }

    if (!stats) {
        return (
            <section className="rounded-[2.5rem] border border-red-400/20 bg-red-400/10 p-8">
                <h2 className="text-3xl font-black text-slate-950 dark:text-white">
                    Could not load stats
                </h2>

                <p className="mt-3 text-sm font-bold text-red-600 dark:text-red-300">
                    {error || "Unknown admin stats error."}
                </p>

                <button
                    onClick={() => void refreshStats()}
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white dark:bg-white dark:text-slate-950"
                >
                    Retry
                    <RefreshCcw className="h-4 w-4" />
                </button>
            </section>
        );
    }

    const verificationRate = getAdminStatsVerificationRate(stats);
    const googleRate = getAdminStatsGoogleRate(stats);
    const passwordRate = getAdminStatsPasswordRate(stats);
    const workspaceTotal = getAdminStatsWorkspaceTotal(stats);
    const activityHealth = getAdminStatsActivityHealth(stats);

    const overviewMetrics = [
        ["Users", stats.users.total],
        ["Workspace", workspaceTotal],
        ["Research", stats.workspace.researchItems],
        ["Comparisons", stats.workspace.comparisonItems],
        ["Exports", stats.workspace.exportItems],
        ["Active sessions", stats.workspace.activeSessions],
    ] as const;

    return (
        <div>
            <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-white/10">
                <div>
                    <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-red-500" />
                        <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Platform overview</h2>
                        <span className="text-xs text-emerald-600 dark:text-emerald-300">{activityHealth}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Current platform usage and recent research activity.</p>
                </div>
                <button onClick={() => void refreshStats()} disabled={refreshing} aria-label="Refresh overview" title="Refresh overview" className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 disabled:opacity-50 dark:border-white/10 dark:text-slate-400">
                    <RefreshCcw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                </button>
            </header>

            <section className="grid grid-cols-2 border-b border-slate-200 dark:border-white/10 sm:grid-cols-3 xl:grid-cols-6">
                {overviewMetrics.map(([label, value]) => (
                    <div key={label} className="border-r border-slate-200 px-4 py-4 first:pl-0 last:border-r-0 dark:border-white/10">
                        <p className="text-xs text-slate-400">{label}</p>
                        <p className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">{value}</p>
                    </div>
                ))}
            </section>

            <section className="py-5">
                <div className="mb-3 flex items-center justify-between gap-4">
                    <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Recent research</h3>
                    <span className="text-xs text-slate-400">Average score {stats.workspace.averageResearchScore}%</span>
                </div>
                {stats.latest.historyItems.length > 0 ? (
                    <div className="divide-y divide-slate-200 border-y border-slate-200 dark:divide-white/10 dark:border-white/10">
                        {stats.latest.historyItems.slice(0, 5).map((item) => (
                            <div key={item.id} className="grid gap-1 py-3 text-sm sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:gap-5">
                                <span className="truncate font-medium text-slate-900 dark:text-white">{item.title}</span>
                                <span className="text-xs text-slate-400">{getAdminStatsUserName(item.user)} · {formatAdminStatsDate(item.createdAt)}</span>
                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{item.score !== null ? `${item.score}%` : item.type}</span>
                            </div>
                        ))}
                    </div>
                ) : <p className="border-y border-slate-200 py-4 text-sm text-slate-400 dark:border-white/10">No research activity yet.</p>}
            </section>
        </div>
    );

    /* Legacy analytics layout retained below while the compact overview is active. */
    {
    const legacyStats = stats as AdminStatsData;
    return ((stats: AdminStatsData) => (
        <div className="space-y-8">
            <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="relative overflow-hidden rounded-[2.75rem] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/30 md:p-9">
                    <div className="absolute right-[-15%] top-[-35%] h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-400/10" />
                    <div className="absolute bottom-[-42%] left-[20%] h-96 w-96 rounded-full bg-red-400/20 blur-3xl dark:bg-red-400/10" />

                    <div className="relative">
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm font-black text-red-600 dark:text-red-300">
                            <BarChart3 className="h-4 w-4" />
                            Platform Analytics
                        </div>

                        <h2 className="max-w-4xl text-4xl font-black tracking-tight text-slate-950 dark:text-white md:text-6xl">
                            Admin overview for EquityLens usage.
                        </h2>

                        <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300">
                            Monitor users, authentication methods, workspace activity,
                            research reports, comparisons, exports, and active sessions.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <button
                                onClick={() => void refreshStats()}
                                disabled={refreshing}
                                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white shadow-xl shadow-slate-900/20 transition hover:-translate-y-0.5 disabled:opacity-60 dark:bg-white dark:text-slate-950"
                            >
                                {refreshing ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <RefreshCcw className="h-4 w-4" />
                                )}
                                Refresh Stats
                            </button>

                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-6 py-3 text-sm font-black text-emerald-700 dark:text-emerald-300">
                                <Activity className="h-4 w-4" />
                                {activityHealth}
                            </div>
                        </div>

                        {error && (
                            <p className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-bold text-red-600 dark:text-red-300">
                                {error}
                            </p>
                        )}
                    </div>
                </div>

                <div className="rounded-[2.75rem] border border-slate-200 bg-slate-950 p-7 text-white shadow-2xl shadow-slate-900/20 dark:border-white/10 md:p-8">
                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/10">
                        <Database className="h-8 w-8 text-cyan-300" />
                    </div>

                    <p className="mb-2 text-sm font-black uppercase tracking-[0.25em] text-cyan-300">
                        Workspace Total
                    </p>

                    <h3 className="text-6xl font-black">{workspaceTotal}</h3>

                    <p className="mt-4 text-sm leading-7 text-slate-300">
                        Combined watchlist, history, and export records created by all
                        users.
                    </p>

                    <div className="mt-7 space-y-3">
                        <DarkStatRow label="Active Sessions" value={String(legacyStats.workspace.activeSessions)} />
                        <DarkStatRow label="Average Score" value={`${legacyStats.workspace.averageResearchScore}%`} />
                        <DarkStatRow label="Research Items" value={String(legacyStats.workspace.researchItems)} />
                        <DarkStatRow label="Comparison Items" value={String(legacyStats.workspace.comparisonItems)} />
                    </div>
                </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <AdminStatsMetric
                    icon={<Users className="h-5 w-5" />}
                    label="Total Users"
                    value={String(stats.users.total)}
                    helper={`${stats.users.admins} admins`}
                />

                <AdminStatsMetric
                    icon={<UserCheck className="h-5 w-5" />}
                    label="Verified Users"
                    value={`${verificationRate}%`}
                    helper={`${stats.users.verified} verified`}
                />

                <AdminStatsMetric
                    icon={<KeyRound className="h-5 w-5" />}
                    label="Password Users"
                    value={`${passwordRate}%`}
                    helper={`${stats.users.passwordUsers} accounts`}
                />

                <AdminStatsMetric
                    icon={<ShieldCheck className="h-5 w-5" />}
                    label="Google Users"
                    value={`${googleRate}%`}
                    helper={`${stats.users.googleUsers} OAuth accounts`}
                />
            </section>

            <section className="grid gap-6 xl:grid-cols-3">
                <ProgressCard
                    title="Email Verification"
                    value={verificationRate}
                    current={stats.users.verified}
                    total={stats.users.total}
                    icon={<CheckCircle2 className="h-5 w-5" />}
                />

                <ProgressCard
                    title="Password Login Adoption"
                    value={passwordRate}
                    current={stats.users.passwordUsers}
                    total={stats.users.total}
                    icon={<KeyRound className="h-5 w-5" />}
                />

                <ProgressCard
                    title="Google Login Adoption"
                    value={googleRate}
                    current={stats.users.googleUsers}
                    total={stats.users.total}
                    icon={<ShieldCheck className="h-5 w-5" />}
                />
            </section>

            <section className="grid gap-6 xl:grid-cols-3">
                <WorkspaceCard
                    icon={<TrendingUp className="h-5 w-5" />}
                    title="Watchlist"
                    value={stats.workspace.watchlistItems}
                    description="Companies saved by users."
                />

                <WorkspaceCard
                    icon={<FileText className="h-5 w-5" />}
                    title="History"
                    value={stats.workspace.historyItems}
                    description="Research and comparison records."
                />

                <WorkspaceCard
                    icon={<Download className="h-5 w-5" />}
                    title="Exports"
                    value={stats.workspace.exportItems}
                    description="Downloaded export records."
                />
            </section>

            <section className="grid gap-6 xl:grid-cols-3">
                <LatestPanel
                    title="Latest Users"
                    icon={<Users className="h-5 w-5" />}
                >
                    {stats.latest.users.length > 0 ? (
                        stats.latest.users.map((user) => (
                            <LatestItem
                                key={user.id}
                                title={getAdminStatsUserName(user)}
                                subtitle={`${user.role} · ${formatAdminStatsDate(user.createdAt)}`}
                                badge={user.emailVerified ? "Verified" : "Pending"}
                            />
                        ))
                    ) : (
                        <EmptyLatest />
                    )}
                </LatestPanel>

                <LatestPanel
                    title="Latest Research Activity"
                    icon={<FileText className="h-5 w-5" />}
                >
                    {stats.latest.historyItems.length > 0 ? (
                        stats.latest.historyItems.map((item) => (
                            <LatestItem
                                key={item.id}
                                title={item.title}
                                subtitle={`${getAdminStatsUserName(item.user)} · ${formatAdminStatsDate(item.createdAt)}`}
                                badge={item.score !== null ? `${item.score}%` : item.type}
                            />
                        ))
                    ) : (
                        <EmptyLatest />
                    )}
                </LatestPanel>

                <LatestPanel
                    title="Latest Exports"
                    icon={<Download className="h-5 w-5" />}
                >
                    {stats.latest.exportItems.length > 0 ? (
                        stats.latest.exportItems.map((item) => (
                            <LatestItem
                                key={item.id}
                                title={item.title}
                                subtitle={`${getAdminStatsUserName(item.user)} · ${formatAdminStatsDate(item.createdAt)}`}
                                badge={item.format}
                            />
                        ))
                    ) : (
                        <EmptyLatest />
                    )}
                </LatestPanel>
            </section>
        </div>
    ))(legacyStats);
    }
}

function AdminStatsMetric({
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
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-red-600 dark:bg-white/10 dark:text-red-300">
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

function ProgressCard({
    title,
    value,
    current,
    total,
    icon,
}: {
    title: string;
    value: number;
    current: number;
    total: number;
    icon: React.ReactNode;
}) {
    return (
        <section className="rounded-[2.25rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20">
            <div className="mb-5 flex items-center justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-600 dark:text-cyan-300">
                    {icon}
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600 dark:bg-white/10 dark:text-slate-300">
                    {current}/{total}
                </span>
            </div>

            <h3 className="text-xl font-black text-slate-950 dark:text-white">
                {title}
            </h3>

            <p className="mt-3 text-4xl font-black text-slate-950 dark:text-white">
                {value}%
            </p>

            <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                <div
                    className="h-full rounded-full bg-slate-950 dark:bg-cyan-300"
                    style={{ width: `${value}%` }}
                />
            </div>
        </section>
    );
}

function WorkspaceCard({
    icon,
    title,
    value,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    value: number;
    description: string;
}) {
    return (
        <section className="rounded-[2.25rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-600 dark:text-emerald-300">
                {icon}
            </div>

            <h3 className="text-xl font-black text-slate-950 dark:text-white">
                {title}
            </h3>

            <p className="mt-3 text-5xl font-black text-slate-950 dark:text-white">
                {value}
            </p>

            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                {description}
            </p>
        </section>
    );
}

function LatestPanel({
    title,
    icon,
    children,
}: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-[2.25rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20">
            <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-cyan-600 dark:bg-white/10 dark:text-cyan-300">
                    {icon}
                </div>

                <h3 className="text-xl font-black text-slate-950 dark:text-white">
                    {title}
                </h3>
            </div>

            <div className="space-y-3">{children}</div>
        </section>
    );
}

function LatestItem({
    title,
    subtitle,
    badge,
}: {
    title: string;
    subtitle: string;
    badge: string;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-950/60">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <p className="truncate font-black text-slate-950 dark:text-white">
                        {title}
                    </p>

                    <p className="mt-1 text-xs font-bold text-slate-400">{subtitle}</p>
                </div>

                <span className="shrink-0 rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-black text-cyan-600 dark:text-cyan-300">
                    {badge}
                </span>
            </div>
        </div>
    );
}

function EmptyLatest() {
    return (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center dark:border-white/10 dark:bg-slate-950/60">
            <Sparkles className="mx-auto h-7 w-7 text-slate-400" />

            <p className="mt-3 text-sm font-bold text-slate-500 dark:text-slate-400">
                No records yet.
            </p>
        </div>
    );
}

function DarkStatRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3 last:border-b-0 last:pb-0">
            <span className="inline-flex items-center gap-2 text-sm font-bold text-slate-400">
                <Clock className="h-4 w-4" />
                {label}
            </span>

            <span className="text-sm font-black text-white">{value}</span>
        </div>
    );
}
