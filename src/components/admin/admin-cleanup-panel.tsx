"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
    AlertTriangle,
    CheckCircle2,
    Database,
    KeyRound,
    Loader2,
    RefreshCcw,
    ShieldAlert,
    Sparkles,
    Trash2,
} from "lucide-react";
import {
    getAdminCleanupPreview,
    getCleanupRiskLabel,
    getCleanupRiskStyle,
    runAdminCleanup,
    type AdminCleanupPreviewResponse,
    type AdminCleanupRunResponse,
} from "@/lib/user-data/admin-cleanup-client";

export function AdminCleanupPanel() {
    const { data: session, status } = useSession();

    const [preview, setPreview] = useState<AdminCleanupPreviewResponse | null>(
        null
    );
    const [lastRun, setLastRun] = useState<AdminCleanupRunResponse | null>(null);

    const [cleanupSessions, setCleanupSessions] = useState(true);
    const [cleanupOtpTokens, setCleanupOtpTokens] = useState(true);
    const [usedOtpRetentionDays, setUsedOtpRetentionDays] = useState(7);

    const [loading, setLoading] = useState(true);
    const [working, setWorking] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const isAdmin = session?.user?.role === "ADMIN";
    const totalCandidates = preview?.candidates.total ?? 0;

    async function loadPreview() {
        if (!isAdmin) {
            setLoading(false);
            return;
        }

        setError("");

        try {
            const result = await getAdminCleanupPreview();
            setPreview(result);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to load cleanup preview."
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (status !== "loading") {
            void loadPreview();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, isAdmin]);

    async function handleCleanup(dryRun: boolean) {
        const confirmed =
            dryRun ||
            window.confirm(
                "Are you sure you want to permanently delete expired sessions and OTP records?"
            );

        if (!confirmed) return;

        setWorking(true);
        setMessage("");
        setError("");

        try {
            const result = await runAdminCleanup({
                dryRun,
                cleanupSessions,
                cleanupOtpTokens,
                usedOtpRetentionDays,
            });

            setMessage(result.message);
            setLastRun(result.result);

            await loadPreview();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to run cleanup.");
        } finally {
            setWorking(false);
        }
    }

    if (status === "loading" || loading) {
        return (
            <section className="rounded-[2.5rem] border border-slate-200 bg-white p-12 text-center shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04]">
                <Loader2 className="mx-auto h-10 w-10 animate-spin text-slate-400" />

                <h2 className="mt-5 text-3xl font-black text-slate-950 dark:text-white">
                    Loading cleanup preview
                </h2>

                <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                    Checking expired sessions and OTP tokens.
                </p>
            </section>
        );
    }

    if (!isAdmin) {
        return (
            <section className="rounded-[2.75rem] border border-red-400/20 bg-red-400/10 p-8 text-center">
                <ShieldAlert className="mx-auto h-12 w-12 text-red-600 dark:text-red-300" />

                <h2 className="mt-5 text-3xl font-black text-slate-950 dark:text-white">
                    Admin cleanup requires admin access
                </h2>

                <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-700 dark:text-slate-300">
                    Only users with the ADMIN role can run database cleanup operations.
                </p>
            </section>
        );
    }

    return (
        <section className="relative overflow-hidden rounded-[2.75rem] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/30 md:p-8">
            <div className="absolute right-[-18%] top-[-45%] h-96 w-96 rounded-full bg-red-400/20 blur-3xl dark:bg-red-400/10" />
            <div className="absolute bottom-[-45%] left-[12%] h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-400/10" />

            <div className="relative">
                <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm font-black text-red-600 dark:text-red-300">
                            <Trash2 className="h-4 w-4" />
                            Database Cleanup
                        </div>

                        <h2 className="text-4xl font-black tracking-tight text-slate-950 dark:text-white">
                            Clean expired auth records.
                        </h2>

                        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">
                            Remove expired NextAuth sessions, expired OTP tokens, and old used
                            OTP records from the database.
                        </p>
                    </div>

                    <div
                        className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-xs font-black ${getCleanupRiskStyle(
                            totalCandidates
                        )}`}
                    >
                        <Sparkles className="h-4 w-4" />
                        {getCleanupRiskLabel(totalCandidates)}
                    </div>
                </div>

                {error && (
                    <p className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-bold text-red-600 dark:text-red-300">
                        <AlertTriangle className="mr-2 inline h-4 w-4" />
                        {error}
                    </p>
                )}

                {message && (
                    <p className="mb-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="mr-2 inline h-4 w-4" />
                        {message}
                    </p>
                )}

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                    <CleanupMetric
                        icon={<Database className="h-5 w-5" />}
                        label="Total Candidates"
                        value={String(preview?.candidates.total ?? 0)}
                    />

                    <CleanupMetric
                        icon={<KeyRound className="h-5 w-5" />}
                        label="Expired Sessions"
                        value={String(preview?.candidates.expiredSessions ?? 0)}
                    />

                    <CleanupMetric
                        icon={<AlertTriangle className="h-5 w-5" />}
                        label="Expired OTP"
                        value={String(preview?.candidates.expiredOtpTokens ?? 0)}
                    />

                    <CleanupMetric
                        icon={<Trash2 className="h-5 w-5" />}
                        label="Old Used OTP"
                        value={String(preview?.candidates.usedOldOtpTokens ?? 0)}
                    />
                </div>

                <div className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                    <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-950/60">
                        <h3 className="mb-5 text-xl font-black text-slate-950 dark:text-white">
                            Cleanup Options
                        </h3>

                        <div className="space-y-4">
                            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
                                <input
                                    type="checkbox"
                                    checked={cleanupSessions}
                                    onChange={(event) => setCleanupSessions(event.target.checked)}
                                    className="mt-1 h-4 w-4"
                                />

                                <span>
                                    <span className="block text-sm font-black text-slate-950 dark:text-white">
                                        Cleanup expired sessions
                                    </span>

                                    <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">
                                        Deletes old session rows where expiry time has passed.
                                    </span>
                                </span>
                            </label>

                            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
                                <input
                                    type="checkbox"
                                    checked={cleanupOtpTokens}
                                    onChange={(event) =>
                                        setCleanupOtpTokens(event.target.checked)
                                    }
                                    className="mt-1 h-4 w-4"
                                />

                                <span>
                                    <span className="block text-sm font-black text-slate-950 dark:text-white">
                                        Cleanup OTP tokens
                                    </span>

                                    <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">
                                        Deletes expired OTPs and old used OTP records.
                                    </span>
                                </span>
                            </label>

                            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
                                <label className="text-sm font-black text-slate-950 dark:text-white">
                                    Used OTP retention days
                                </label>

                                <input
                                    type="number"
                                    min={1}
                                    max={90}
                                    value={usedOtpRetentionDays}
                                    onChange={(event) =>
                                        setUsedOtpRetentionDays(Number(event.target.value))
                                    }
                                    className="mt-3 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-black text-slate-950 outline-none dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
                                />

                                <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                                    Used OTP tokens older than this value can be deleted.
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 grid gap-3 sm:grid-cols-3">
                            <button
                                onClick={() => void loadPreview()}
                                disabled={working}
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
                            >
                                <RefreshCcw className="h-4 w-4" />
                                Preview
                            </button>

                            <button
                                onClick={() => void handleCleanup(true)}
                                disabled={working}
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 text-sm font-black text-cyan-700 transition hover:bg-cyan-400/20 disabled:opacity-60 dark:text-cyan-300"
                            >
                                {working ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Sparkles className="h-4 w-4" />
                                )}
                                Dry Run
                            </button>

                            <button
                                onClick={() => void handleCleanup(false)}
                                disabled={working || totalCandidates === 0}
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 text-sm font-black text-white shadow-xl shadow-red-600/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {working ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Trash2 className="h-4 w-4" />
                                )}
                                Delete
                            </button>
                        </div>
                    </div>

                    <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-950/60">
                        <h3 className="mb-5 text-xl font-black text-slate-950 dark:text-white">
                            Last Cleanup Result
                        </h3>

                        {lastRun ? (
                            <div className="space-y-4">
                                <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
                                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                                        Mode
                                    </p>

                                    <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                                        {lastRun.dryRun ? "Dry Run" : "Deleted Records"}
                                    </p>
                                </div>

                                <div className="grid gap-3 md:grid-cols-2">
                                    <ResultBox
                                        label="Expired Sessions"
                                        value={lastRun.deleted.expiredSessions}
                                    />

                                    <ResultBox
                                        label="Expired OTP"
                                        value={lastRun.deleted.expiredOtpTokens}
                                    />

                                    <ResultBox
                                        label="Old Used OTP"
                                        value={lastRun.deleted.usedOldOtpTokens}
                                    />

                                    <ResultBox label="Total" value={lastRun.deleted.total} />
                                </div>

                                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                                    <CheckCircle2 className="mr-2 inline h-4 w-4" />
                                    Cleanup operation completed successfully.
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-8 text-center dark:border-white/10 dark:bg-white/5">
                                <Sparkles className="mx-auto h-10 w-10 text-slate-400" />

                                <h4 className="mt-4 text-2xl font-black text-slate-950 dark:text-white">
                                    No cleanup run yet
                                </h4>

                                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                                    Run a dry-run first, then delete records only when the preview
                                    looks correct.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-xs font-black text-amber-700 dark:text-amber-300">
                    <AlertTriangle className="mr-2 inline h-4 w-4" />
                    Cleanup permanently deletes expired auth records. It does not delete
                    users, research history, watchlist items, or export data.
                </div>
            </div>
        </section>
    );
}

function CleanupMetric({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-950/60">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-red-600 shadow-sm dark:bg-white/10 dark:text-red-300">
                {icon}
            </div>

            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                {label}
            </p>

            <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">
                {value}
            </p>
        </div>
    );
}

function ResultBox({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                {label}
            </p>

            <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                {value}
            </p>
        </div>
    );
}