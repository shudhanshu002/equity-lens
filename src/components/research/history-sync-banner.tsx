"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
    CheckCircle2,
    Database,
    History,
    Loader2,
    RefreshCcw,
    UploadCloud,
    X,
} from "lucide-react";
import {
    clearLocalHistoryAfterSync,
    getLocalHistoryForSync,
    syncLocalHistoryToDatabase,
} from "@/lib/user-data/history-sync-client";

type HistorySyncBannerProps = {
    onSynced?: () => void;
};

export function HistorySyncBanner({ onSynced }: HistorySyncBannerProps) {
    const { status } = useSession();

    const [localCount, setLocalCount] = useState(0);
    const [syncing, setSyncing] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const loggedIn = status === "authenticated";

    useEffect(() => {
        if (!loggedIn) return;

        const localItems = getLocalHistoryForSync();
        setLocalCount(localItems.length);
    }, [loggedIn]);

    if (!loggedIn || dismissed || localCount === 0) {
        return null;
    }

    async function syncNow() {
        setSyncing(true);
        setMessage("");
        setError("");

        try {
            const result = await syncLocalHistoryToDatabase();

            clearLocalHistoryAfterSync();
            setLocalCount(0);

            setMessage(
                `${result.syncedCount} local history item${result.syncedCount === 1 ? "" : "s"
                } synced to your account.`
            );

            onSynced?.();

            window.setTimeout(() => {
                setDismissed(true);
            }, 2500);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to sync local history."
            );
        } finally {
            setSyncing(false);
        }
    }

    return (
        <section className="rounded-[2rem] border border-blue-400/20 bg-blue-400/10 p-5 shadow-xl shadow-blue-500/5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500 text-white shadow-lg shadow-blue-500/20">
                        {message ? (
                            <CheckCircle2 className="h-6 w-6" />
                        ) : (
                            <UploadCloud className="h-6 w-6" />
                        )}
                    </div>

                    <div>
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                            <p className="font-black text-slate-950 dark:text-white">
                                Sync local history
                            </p>

                            <span className="rounded-full border border-blue-400/20 bg-white/60 px-3 py-1 text-xs font-black text-blue-700 dark:bg-white/10 dark:text-blue-300">
                                {localCount} local item{localCount === 1 ? "" : "s"}
                            </span>
                        </div>

                        <p className="max-w-3xl text-sm leading-7 text-slate-700 dark:text-slate-300">
                            You created research history before logging in. Sync it now to
                            save those reports permanently in PostgreSQL.
                        </p>

                        {message && (
                            <p className="mt-3 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                                {message}
                            </p>
                        )}

                        {error && (
                            <p className="mt-3 text-sm font-bold text-red-600 dark:text-red-300">
                                {error}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-3">
                    <button
                        onClick={() => void syncNow()}
                        disabled={syncing}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-xl shadow-slate-900/15 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
                    >
                        {syncing ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Syncing
                            </>
                        ) : (
                            <>
                                Sync to Database
                                <Database className="h-4 w-4" />
                            </>
                        )}
                    </button>

                    <button
                        onClick={() => {
                            const localItems = getLocalHistoryForSync();
                            setLocalCount(localItems.length);
                        }}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-lg shadow-slate-900/5 transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
                    >
                        Refresh
                        <RefreshCcw className="h-4 w-4" />
                    </button>

                    <button
                        onClick={() => setDismissed(true)}
                        className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-lg shadow-slate-900/5 transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/10 dark:text-slate-300"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="mt-5 flex items-center gap-2 rounded-2xl border border-blue-400/20 bg-white/50 px-4 py-3 text-xs font-black text-blue-700 dark:bg-white/10 dark:text-blue-300">
                <History className="h-4 w-4" />
                Local browser history will be cleared after successful sync.
            </div>
        </section>
    );
}