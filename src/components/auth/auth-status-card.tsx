"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
    CheckCircle2,
    Database,
    KeyRound,
    Loader2,
    Mail,
    ShieldCheck,
    UserCheck,
} from "lucide-react";
import {
    formatAccountDate,
    getConnectedProviderLabel,
    getUserAccountDetails,
    hasGoogleProvider,
    hasPasswordProvider,
    type UserAccountDetails,
} from "@/lib/user-data/account-client";

export function AuthStatusCard() {
    const { status } = useSession();

    const [account, setAccount] = useState<UserAccountDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loggedIn = status === "authenticated";

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
                    err instanceof Error ? err.message : "Failed to load auth status."
                );
            } finally {
                setLoading(false);
            }
        }

        if (status !== "loading") {
            void loadAccount();
        }
    }, [loggedIn, status]);

    if (!loggedIn) {
        return null;
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
                            Loading authentication status
                        </h3>

                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            Checking login providers and account security.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20 md:p-8">
            <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-xl shadow-emerald-500/20">
                        <UserCheck className="h-7 w-7" />
                    </div>

                    <div>
                        <p className="mb-2 text-sm font-black uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-300">
                            Authentication Status
                        </p>

                        <h3 className="text-3xl font-black text-slate-950 dark:text-white">
                            {getConnectedProviderLabel(account)}
                        </h3>

                        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-400">
                            Your account can use one or more login methods. Google-only users
                            can set a password, and password users can change their password
                            from this settings page.
                        </p>
                    </div>
                </div>

                <div
                    className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-xs font-black ${account?.emailVerified
                            ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-600 dark:text-emerald-300"
                            : "border-amber-400/20 bg-amber-400/10 text-amber-700 dark:text-amber-300"
                        }`}
                >
                    {account?.emailVerified ? (
                        <CheckCircle2 className="h-4 w-4" />
                    ) : (
                        <ShieldCheck className="h-4 w-4" />
                    )}
                    {account?.emailVerified ? "Email Verified" : "Email Pending"}
                </div>
            </div>

            {error && (
                <p className="mb-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-bold text-red-600 dark:text-red-300">
                    {error}
                </p>
            )}

            <div className="grid gap-5 lg:grid-cols-3">
                <AuthStatusTile
                    icon={<Mail className="h-5 w-5" />}
                    title="Email"
                    value={account?.email ?? "-"}
                    active={Boolean(account?.email)}
                />

                <AuthStatusTile
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                            <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                        </svg>
                    }
                    title="Google Login"
                    value={hasGoogleProvider(account) ? "Connected" : "Not Connected"}
                    active={hasGoogleProvider(account)}
                />

                <AuthStatusTile
                    icon={<KeyRound className="h-5 w-5" />}
                    title="Password Login"
                    value={hasPasswordProvider(account) ? "Enabled" : "Not Set"}
                    active={hasPasswordProvider(account)}
                />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
                <AuthMetaBox
                    label="Provider"
                    value={getConnectedProviderLabel(account)}
                />

                <AuthMetaBox
                    label="Storage"
                    value="PostgreSQL"
                />

                <AuthMetaBox
                    label="Created"
                    value={account?.createdAt ? formatAccountDate(account.createdAt) : "-"}
                />
            </div>

            <div className="mt-6 flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-xs font-black text-cyan-700 dark:text-cyan-300">
                <Database className="h-4 w-4" />
                Sessions, OAuth accounts, OTP records, settings, history, watchlist, and
                exports are linked through your user id.
            </div>
        </section>
    );
}

function AuthStatusTile({
    icon,
    title,
    value,
    active,
}: {
    icon: React.ReactNode;
    title: string;
    value: string;
    active: boolean;
}) {
    return (
        <div
            className={`rounded-[2rem] border p-5 ${active
                    ? "border-emerald-400/20 bg-emerald-400/10"
                    : "border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-950/60"
                }`}
        >
            <div
                className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl ${active
                        ? "bg-emerald-500 text-white"
                        : "bg-white text-slate-400 shadow-sm dark:bg-white/10"
                    }`}
            >
                {icon}
            </div>

            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                {title}
            </p>

            <p className="mt-2 break-words text-lg font-black text-slate-950 dark:text-white">
                {value}
            </p>
        </div>
    );
}

function AuthMetaBox({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-950/60">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                {label}
            </p>

            <p className="mt-2 text-sm font-black text-slate-950 dark:text-white">
                {value}
            </p>
        </div>
    );
}