"use client";

import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import {
    AlertTriangle,
    Database,
    Loader2,
    Lock,
    ShieldAlert,
    Trash2,
} from "lucide-react";
import {
    deleteUserAccount,
    formatAccountDate,
    getAccountUsageTotal,
    getConnectedProviderLabel,
    getUserAccountDetails,
    hasPasswordProvider,
    type UserAccountDetails,
} from "@/lib/user-data/account-client";

export function AccountDangerZone() {
    const { status } = useSession();

    const [account, setAccount] = useState<UserAccountDetails | null>(null);

    const [password, setPassword] = useState("");
    const [confirmation, setConfirmation] = useState("");

    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

    const [error, setError] = useState("");

    const loggedIn = status === "authenticated";
    const requiresPassword = hasPasswordProvider(account);
    const canDelete =
        confirmation === "DELETE_MY_ACCOUNT" &&
        (!requiresPassword || password.trim().length > 0);

    useEffect(() => {
        async function loadAccount() {
            setLoading(true);
            setError("");

            try {
                if (!loggedIn) {
                    setAccount(null);
                    return;
                }

                const details = await getUserAccountDetails();
                setAccount(details);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Failed to load account details."
                );
            } finally {
                setLoading(false);
            }
        }

        if (status !== "loading") {
            void loadAccount();
        }
    }, [loggedIn, status]);

    async function handleDeleteAccount() {
        if (!canDelete || deleting) return;

        setDeleting(true);
        setError("");

        try {
            await deleteUserAccount({
                password: requiresPassword ? password : undefined,
                confirmation: "DELETE_MY_ACCOUNT",
            });

            await signOut({
                callbackUrl: "/",
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete account.");
        } finally {
            setDeleting(false);
        }
    }

    if (loading) {
        return (
            <section className="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20 md:p-8">
                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </div>

                    <div>
                        <h3 className="text-2xl font-black text-slate-950 dark:text-white">
                            Loading account security
                        </h3>

                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            Fetching account usage and provider details.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    if (!loggedIn) {
        return null;
    }

    return (
        <section className="rounded-[2.5rem] border border-red-400/20 bg-red-400/10 p-6 md:p-8">
            <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-500 text-white shadow-xl shadow-red-500/20">
                        <ShieldAlert className="h-7 w-7" />
                    </div>

                    <div>
                        <p className="mb-2 text-sm font-black uppercase tracking-[0.25em] text-red-600 dark:text-red-300">
                            Danger Zone
                        </p>

                        <h3 className="text-3xl font-black text-slate-950 dark:text-white">
                            Delete account permanently
                        </h3>

                        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-700 dark:text-slate-300">
                            This action deletes your account and all linked workspace data,
                            including settings, watchlist items, research history, exports,
                            sessions, OAuth accounts, and OTP records.
                        </p>
                    </div>
                </div>

                <div className="rounded-[1.75rem] border border-red-400/20 bg-white/60 p-5 dark:bg-white/10">
                    <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-red-600 dark:text-red-300">
                        Account Summary
                    </p>

                    <div className="space-y-3 text-sm">
                        <DangerMetaRow
                            label="Provider"
                            value={getConnectedProviderLabel(account)}
                        />

                        <DangerMetaRow
                            label="Workspace Items"
                            value={String(getAccountUsageTotal(account))}
                        />

                        <DangerMetaRow
                            label="Joined"
                            value={
                                account?.createdAt ? formatAccountDate(account.createdAt) : "-"
                            }
                        />
                    </div>
                </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-[2rem] border border-red-400/20 bg-white/70 p-5 dark:bg-slate-950/40">
                    <div className="mb-4 flex items-center gap-3 text-red-600 dark:text-red-300">
                        <AlertTriangle className="h-5 w-5" />
                        <p className="font-black">What will be deleted?</p>
                    </div>

                    <div className="space-y-3">
                        <DeleteImpactRow label="Watchlist Items" value={account?.usage.watchlistItems ?? 0} />
                        <DeleteImpactRow label="History Items" value={account?.usage.historyItems ?? 0} />
                        <DeleteImpactRow label="Export Records" value={account?.usage.exportItems ?? 0} />
                        <DeleteImpactRow label="OTP Records" value={account?.usage.otpTokens ?? 0} />
                    </div>

                    <div className="mt-5 flex items-center gap-2 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-xs font-black text-red-700 dark:text-red-300">
                        <Database className="h-4 w-4" />
                        Cascade delete is handled by Prisma relations.
                    </div>
                </div>

                <div className="rounded-[2rem] border border-red-400/20 bg-white/70 p-5 dark:bg-slate-950/40">
                    <label className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-300">
                        Type DELETE_MY_ACCOUNT to confirm
                    </label>

                    <input
                        value={confirmation}
                        onChange={(event) => {
                            setConfirmation(event.target.value);
                            setError("");
                        }}
                        placeholder="DELETE_MY_ACCOUNT"
                        className="h-14 w-full rounded-2xl border border-red-400/20 bg-white px-4 text-sm font-black text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-red-400 dark:bg-slate-950/60 dark:text-white"
                    />

                    {requiresPassword && (
                        <div className="mt-4">
                            <label className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-300">
                                Password
                            </label>

                            <div className="flex h-14 items-center gap-3 rounded-2xl border border-red-400/20 bg-white px-4 dark:bg-slate-950/60">
                                <Lock className="h-5 w-5 text-slate-400" />

                                <input
                                    value={password}
                                    onChange={(event) => {
                                        setPassword(event.target.value);
                                        setError("");
                                    }}
                                    type="password"
                                    placeholder="Enter your password"
                                    className="w-full bg-transparent text-sm font-bold text-slate-950 outline-none placeholder:text-slate-400 dark:text-white"
                                />
                            </div>
                        </div>
                    )}

                    {error && (
                        <p className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-bold text-red-600 dark:text-red-300">
                            {error}
                        </p>
                    )}

                    <button
                        onClick={() => void handleDeleteAccount()}
                        disabled={!canDelete || deleting}
                        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-4 text-sm font-black text-white shadow-xl shadow-red-600/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {deleting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Deleting Account
                            </>
                        ) : (
                            <>
                                <Trash2 className="h-4 w-4" />
                                Delete My Account
                            </>
                        )}
                    </button>
                </div>
            </div>
        </section>
    );
}

function DangerMetaRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-red-400/20 pb-3 last:border-b-0 last:pb-0">
            <span className="font-bold text-slate-600 dark:text-slate-400">
                {label}
            </span>

            <span className="font-black text-slate-950 dark:text-white">{value}</span>
        </div>
    );
}

function DeleteImpactRow({ label, value }: { label: string; value: number }) {
    return (
        <div className="flex items-center justify-between rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {label}
            </span>

            <span className="text-sm font-black text-red-600 dark:text-red-300">
                {value}
            </span>
        </div>
    );
}