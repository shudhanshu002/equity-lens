"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
    Activity,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Database,
    KeyRound,
    Loader2,
    RefreshCcw,
    Server,
    ShieldAlert,
    ShieldCheck,
    Sparkles,
    Wifi,
    XCircle,
} from "lucide-react";
import {
    formatAdminHealthDate,
    formatAdminHealthMetadataValue,
    getAdminHealth,
    getAdminHealthDotStyle,
    getAdminHealthStatusLabel,
    getAdminHealthStatusStyle,
    getAdminHealthSummary,
    type AdminHealthCheck,
    type AdminHealthData,
    type AdminHealthStatus,
} from "@/lib/user-data/admin-health-client";

export function AdminHealthPanel() {
    const { data: session, status } = useSession();

    const [health, setHealth] = useState<AdminHealthData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const isAdmin = session?.user?.role === "ADMIN";
    const summary = getAdminHealthSummary(health);

    async function loadHealth() {
        if (!isAdmin) {
            setLoading(false);
            setRefreshing(false);
            return;
        }

        setError("");

        try {
            const data = await getAdminHealth();
            setHealth(data);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to load admin health."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        if (status !== "loading") {
            void loadHealth();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, isAdmin]);

    async function refreshHealth() {
        setRefreshing(true);
        await loadHealth();
    }

    if (status === "loading" || loading) {
        return (
            <section className="rounded-[2.5rem] border border-slate-200 bg-white p-12 text-center shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04]">
                <Loader2 className="mx-auto h-10 w-10 animate-spin text-slate-400" />

                <h2 className="mt-5 text-3xl font-black text-slate-950 dark:text-white">
                    Loading system health
                </h2>

                <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                    Checking database, auth, AI provider, market APIs, and SMTP config.
                </p>
            </section>
        );
    }

    if (!isAdmin) {
        return (
            <section className="rounded-[2.75rem] border border-red-400/20 bg-red-400/10 p-8 text-center">
                <ShieldAlert className="mx-auto h-12 w-12 text-red-600 dark:text-red-300" />

                <h2 className="mt-5 text-3xl font-black text-slate-950 dark:text-white">
                    Admin health requires admin access
                </h2>

                <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-700 dark:text-slate-300">
                    Only users with the ADMIN role can view system health checks.
                </p>
            </section>
        );
    }

    if (!health) {
        return (
            <section className="rounded-[2.5rem] border border-red-400/20 bg-red-400/10 p-8">
                <h2 className="text-3xl font-black text-slate-950 dark:text-white">
                    Could not load health data
                </h2>

                <p className="mt-3 text-sm font-bold text-red-600 dark:text-red-300">
                    {error || "Unknown health check error."}
                </p>

                <button
                    onClick={() => void refreshHealth()}
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white dark:bg-white dark:text-slate-950"
                >
                    Retry
                    <RefreshCcw className="h-4 w-4" />
                </button>
            </section>
        );
    }

    return (
        <div>
            <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-white/10">
                <div className="flex items-center gap-3">
                    <span className={`h-2 w-2 rounded-full ${getAdminHealthDotStyle(health.status)}`} />
                    <div><h2 className="text-lg font-semibold text-slate-950 dark:text-white">System health</h2><p className="text-xs text-slate-400">{getAdminHealthStatusLabel(health.status)} · {health.responseTimeMs}ms · {formatAdminHealthDate(health.checkedAt)}</p></div>
                </div>
                <button onClick={() => void refreshHealth()} disabled={refreshing} aria-label="Refresh health" className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 dark:border-white/10"><RefreshCcw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} /></button>
            </header>
            <div className="grid grid-cols-3 border-b border-slate-200 dark:border-white/10">
                {[["Healthy", summary.up], ["Warnings", summary.warn], ["Down", summary.down]].map(([label, value]) => <div key={label} className="border-r border-slate-200 px-4 py-3 first:pl-0 last:border-r-0 dark:border-white/10"><p className="text-xs text-slate-400">{label}</p><p className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">{value}</p></div>)}
            </div>
            <div className="divide-y divide-slate-200 border-b border-slate-200 dark:divide-white/10 dark:border-white/10">
                {health.checks.map((check) => <div key={check.name} className="grid gap-1 py-3 text-sm sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-5"><span className="font-medium text-slate-900 dark:text-white">{check.name}</span><span className="text-xs text-slate-400">{check.message}</span><span className={`text-xs font-semibold ${check.status === "UP" ? "text-emerald-600" : check.status === "WARN" ? "text-amber-600" : "text-red-600"}`}>{getAdminHealthStatusLabel(check.status)} · {check.responseTimeMs}ms</span></div>)}
            </div>
        </div>
    );

    /* Legacy health layout retained below while the compact view is active. */
    const legacyHealth = health as AdminHealthData;
    return ((health: AdminHealthData) => (
        <section className="relative overflow-hidden rounded-[2.75rem] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/30 md:p-8">
            <div className="absolute right-[-18%] top-[-42%] h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl dark:bg-emerald-400/10" />
            <div className="absolute bottom-[-44%] left-[14%] h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-400/10" />

            <div className="relative">
                <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <div
                            className={`mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-black ${getAdminHealthStatusStyle(
                                health.status
                            )}`}
                        >
                            <StatusIcon status={health.status} />
                            System {getAdminHealthStatusLabel(health.status)}
                        </div>

                        <h2 className="text-4xl font-black tracking-tight text-slate-950 dark:text-white">
                            Platform health checks.
                        </h2>

                        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">
                            Monitor core services used by EquityLens AI, including database,
                            authentication, OAuth, Gemini, Alpha Vantage, Finnhub, and SMTP.
                        </p>
                    </div>

                    <button
                        onClick={() => void refreshHealth()}
                        disabled={refreshing}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-6 text-sm font-black text-white shadow-xl shadow-slate-900/15 transition hover:-translate-y-0.5 disabled:opacity-60 dark:bg-white dark:text-slate-950"
                    >
                        {refreshing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCcw className="h-4 w-4" />
                        )}
                        Refresh Health
                    </button>
                </div>

                {error && (
                    <p className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-bold text-red-600 dark:text-red-300">
                        <AlertTriangle className="mr-2 inline h-4 w-4" />
                        {error}
                    </p>
                )}

                <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <HealthMetric
                        icon={<Activity className="h-5 w-5" />}
                        label="Overall"
                        value={health.status}
                        helper={getAdminHealthStatusLabel(health.status)}
                    />

                    <HealthMetric
                        icon={<CheckCircle2 className="h-5 w-5" />}
                        label="Healthy"
                        value={String(summary.up)}
                        helper={`${summary.total} total checks`}
                    />

                    <HealthMetric
                        icon={<AlertTriangle className="h-5 w-5" />}
                        label="Warnings"
                        value={String(summary.warn)}
                        helper="Non-blocking issues"
                    />

                    <HealthMetric
                        icon={<XCircle className="h-5 w-5" />}
                        label="Down"
                        value={String(summary.down)}
                        helper={`${health.responseTimeMs}ms response`}
                    />
                </div>

                <div className="mb-8 grid gap-6 xl:grid-cols-[1fr_0.85fr]">
                    <div className="rounded-[2.25rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-950/60">
                        <div className="mb-5 flex items-center justify-between gap-4">
                            <h3 className="text-2xl font-black text-slate-950 dark:text-white">
                                Service Checks
                            </h3>

                            <span className="rounded-full bg-white px-4 py-2 text-xs font-black text-slate-500 dark:bg-white/10 dark:text-slate-300">
                                {summary.total} checks
                            </span>
                        </div>

                        <div className="space-y-4">
                            {health.checks.map((check) => (
                                <HealthCheckCard key={check.name} check={check} />
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-[2.25rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-950/60">
                            <h3 className="mb-5 text-2xl font-black text-slate-950 dark:text-white">
                                Runtime Config
                            </h3>

                            <div className="space-y-3">
                                <EnvRow label="NODE_ENV" value={health.environment.nodeEnv} />
                                <EnvRow
                                    label="DATABASE_URL"
                                    value={health.environment.hasDatabaseUrl}
                                />
                                <EnvRow
                                    label="AUTH_SECRET"
                                    value={health.environment.hasAuthSecret}
                                />
                                <EnvRow
                                    label="Google OAuth"
                                    value={health.environment.hasGoogleOAuth}
                                />
                                <EnvRow
                                    label="Gemini API"
                                    value={health.environment.hasGoogleApiKey}
                                />
                                <EnvRow
                                    label="Alpha Vantage"
                                    value={health.environment.hasAlphaVantageKey}
                                />
                                <EnvRow
                                    label="Finnhub"
                                    value={health.environment.hasFinnhubKey}
                                />
                                <EnvRow label="SMTP" value={health.environment.hasSmtp} />
                                <EnvRow
                                    label="Admin Setup Token"
                                    value={health.environment.hasAdminSetupToken}
                                />
                            </div>
                        </div>

                        <div className="rounded-[2.25rem] border border-slate-200 bg-slate-950 p-6 text-white dark:border-white/10">
                            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                                <Clock className="h-7 w-7 text-cyan-300" />
                            </div>

                            <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300">
                                Last Checked
                            </p>

                            <p className="mt-3 text-2xl font-black">
                                {formatAdminHealthDate(health.checkedAt)}
                            </p>

                            <p className="mt-3 text-sm leading-6 text-slate-300">
                                Health endpoint responded in {health.responseTimeMs}ms.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-xs font-black text-amber-700 dark:text-amber-300">
                    <AlertTriangle className="mr-2 inline h-4 w-4" />
                    This panel does not expose secret values. It only checks whether
                    required configuration exists.
                </div>
            </div>
        </section>
    ))(legacyHealth);
}

function HealthCheckCard({ check }: { check: AdminHealthCheck }) {
    const metadataEntries = Object.entries(check.metadata ?? {});

    return (
        <article className="rounded-[1.75rem] border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black ${getAdminHealthStatusStyle(
                                check.status
                            )}`}
                        >
                            <span
                                className={`h-2 w-2 rounded-full ${getAdminHealthDotStyle(
                                    check.status
                                )}`}
                            />
                            {getAdminHealthStatusLabel(check.status)}
                        </span>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600 dark:bg-white/10 dark:text-slate-300">
                            {check.responseTimeMs}ms
                        </span>
                    </div>

                    <h4 className="text-xl font-black text-slate-950 dark:text-white">
                        {check.name}
                    </h4>

                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                        {check.message}
                    </p>
                </div>

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300">
                    <ServiceIcon name={check.name} />
                </div>
            </div>

            {metadataEntries.length > 0 && (
                <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    {metadataEntries.map(([key, value]) => (
                        <div
                            key={key}
                            className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-slate-950/60"
                        >
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                {formatMetadataKey(key)}
                            </p>

                            <p className="mt-1 truncate text-sm font-black text-slate-950 dark:text-white">
                                {formatAdminHealthMetadataValue(value)}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </article>
    );
}

function HealthMetric({
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
        <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-950/60">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm dark:bg-white/10 dark:text-emerald-300">
                {icon}
            </div>

            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
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

function EnvRow({ label, value }: { label: string; value: string | boolean }) {
    const enabled = typeof value === "boolean" ? value : Boolean(value);

    return (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/5">
            <span className="text-sm font-black text-slate-700 dark:text-slate-300">
                {label}
            </span>

            <span
                className={`rounded-full px-3 py-1 text-xs font-black ${enabled
                        ? "bg-emerald-400/10 text-emerald-700 dark:text-emerald-300"
                        : "bg-red-400/10 text-red-700 dark:text-red-300"
                    }`}
            >
                {typeof value === "boolean" ? (value ? "Set" : "Missing") : value}
            </span>
        </div>
    );
}

function StatusIcon({ status }: { status: AdminHealthStatus }) {
    if (status === "UP") {
        return <CheckCircle2 className="h-4 w-4" />;
    }

    if (status === "WARN") {
        return <AlertTriangle className="h-4 w-4" />;
    }

    return <XCircle className="h-4 w-4" />;
}

function ServiceIcon({ name }: { name: string }) {
    const normalized = name.toLowerCase();

    if (normalized.includes("database")) {
        return <Database className="h-5 w-5" />;
    }

    if (normalized.includes("auth")) {
        return <KeyRound className="h-5 w-5" />;
    }

    if (normalized.includes("oauth")) {
        return <ShieldCheck className="h-5 w-5" />;
    }

    if (
        normalized.includes("gemini") ||
        normalized.includes("alpha") ||
        normalized.includes("finnhub")
    ) {
        return <Wifi className="h-5 w-5" />;
    }

    return <Server className="h-5 w-5" />;
}

function formatMetadataKey(key: string) {
    return key
        .replace(/([A-Z])/g, " $1")
        .replace(/_/g, " ")
        .trim();
}
