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

    if (!loggedIn) {
        return null;
    }

    return (
        <section className="max-w-2xl border-b border-red-300 pb-6 dark:border-red-400/20">
            <div className="mb-5 flex gap-3">
                <div className="flex gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-600 text-white">
                        <ShieldAlert className="h-4 w-4" />
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-slate-950 dark:text-white">
                            Delete account
                        </h3>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Permanently remove your account and all workspace data.
                        </p>
                    </div>
                </div>

                <div className="hidden">
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

            <div>
                <div className="hidden">
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

                <div>
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
                        className="h-10 w-full rounded-lg border border-red-300 bg-transparent px-3 text-sm font-medium text-slate-950 outline-none focus:border-red-500 dark:border-red-400/20 dark:text-white"
                    />

                    {requiresPassword && (
                        <div className="mt-4">
                            <label className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-300">
                                Password
                            </label>

                            <div className="flex h-10 items-center gap-3 rounded-lg border border-red-300 px-3 dark:border-red-400/20">
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
                        className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-medium text-white disabled:opacity-50"
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
