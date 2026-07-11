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
    UserCircle2,
} from "lucide-react";
import {
    formatCurrentUserDate,
    getCurrentUser,
    getCurrentUserDisplayName,
    getCurrentUserInitials,
    getCurrentUserWorkspaceCount,
    currentUserHasPassword,
    currentUserHasProvider,
    currentUserIsVerified,
    type CurrentUserResponse,
} from "@/lib/user-data/me-client";

export function CurrentUserCard() {
    const { status } = useSession();

    const [user, setUser] = useState<CurrentUserResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loggedIn = status === "authenticated";

    useEffect(() => {
        async function loadCurrentUser() {
            setLoading(true);
            setError("");

            try {
                if (!loggedIn) {
                    setUser(null);
                    return;
                }

                const currentUser = await getCurrentUser();
                setUser(currentUser);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Failed to load current user."
                );
            } finally {
                setLoading(false);
            }
        }

        if (status !== "loading") {
            void loadCurrentUser();
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
                            Loading current user
                        </h3>

                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            Checking your active session and workspace.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20 md:p-8">
            <div className="absolute right-[-16%] top-[-35%] h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-400/10" />

            <div className="relative">
                <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-slate-950 text-xl font-black text-white shadow-xl shadow-slate-900/20 dark:bg-white dark:text-slate-950">
                            {user?.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={user.image}
                                    alt={getCurrentUserDisplayName(user)}
                                    className="h-full w-full rounded-3xl object-cover"
                                />
                            ) : (
                                getCurrentUserInitials(user)
                            )}
                        </div>

                        <div>
                            <p className="mb-2 text-sm font-black uppercase tracking-[0.25em] text-cyan-600 dark:text-cyan-300">
                                Current User
                            </p>

                            <h3 className="text-3xl font-black text-slate-950 dark:text-white">
                                {getCurrentUserDisplayName(user)}
                            </h3>

                            <p className="mt-2 flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400">
                                <Mail className="h-4 w-4" />
                                {user?.email}
                            </p>
                        </div>
                    </div>

                    <div
                        className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-xs font-black ${currentUserIsVerified(user)
                                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-600 dark:text-emerald-300"
                                : "border-amber-400/20 bg-amber-400/10 text-amber-700 dark:text-amber-300"
                            }`}
                    >
                        {currentUserIsVerified(user) ? (
                            <CheckCircle2 className="h-4 w-4" />
                        ) : (
                            <ShieldCheck className="h-4 w-4" />
                        )}
                        {currentUserIsVerified(user) ? "Verified Session" : "Email Pending"}
                    </div>
                </div>

                {error && (
                    <p className="mb-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-bold text-red-600 dark:text-red-300">
                        {error}
                    </p>
                )}

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <CurrentUserMetric
                        icon={<UserCircle2 className="h-5 w-5" />}
                        label="Role"
                        value={user?.role ?? "USER"}
                    />

                    <CurrentUserMetric
                        icon={<Database className="h-5 w-5" />}
                        label="Workspace Items"
                        value={String(getCurrentUserWorkspaceCount(user))}
                    />

                    <CurrentUserMetric
                        icon={<KeyRound className="h-5 w-5" />}
                        label="Password Login"
                        value={currentUserHasPassword(user) ? "Enabled" : "Not Set"}
                    />

                    <CurrentUserMetric
                        icon={<ShieldCheck className="h-5 w-5" />}
                        label="Google Login"
                        value={currentUserHasProvider(user, "google") ? "Connected" : "No"}
                    />
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                    <MetaBox
                        label="Watchlist"
                        value={String(user?.counts.watchlistItems ?? 0)}
                    />

                    <MetaBox
                        label="History"
                        value={String(user?.counts.historyItems ?? 0)}
                    />

                    <MetaBox
                        label="Exports"
                        value={String(user?.counts.exportItems ?? 0)}
                    />
                </div>

                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-black text-slate-600 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-300">
                    Account created:{" "}
                    {user?.createdAt ? formatCurrentUserDate(user.createdAt) : "-"}
                </div>
            </div>
        </section>
    );
}

function CurrentUserMetric({
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
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-cyan-600 shadow-sm dark:bg-white/10 dark:text-cyan-300">
                {icon}
            </div>

            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                {label}
            </p>

            <p className="mt-2 text-lg font-black text-slate-950 dark:text-white">
                {value}
            </p>
        </div>
    );
}

function MetaBox({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-950/60">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                {label}
            </p>

            <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                {value}
            </p>
        </div>
    );
}