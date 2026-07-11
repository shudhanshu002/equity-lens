"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
    AlertTriangle,
    CheckCircle2,
    KeyRound,
    Loader2,
    ShieldCheck,
    Sparkles,
} from "lucide-react";
import { promoteSelfToAdmin } from "@/lib/user-data/admin-promote-client";

export function AdminPromoteCard() {
    const { data: session, status, update } = useSession();

    const [setupToken, setSetupToken] = useState("");
    const [working, setWorking] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const loggedIn = status === "authenticated";
    const isAdmin = session?.user?.role === "ADMIN";

    async function handlePromote() {
        setWorking(true);
        setMessage("");
        setError("");

        try {
            const result = await promoteSelfToAdmin(setupToken.trim());

            setMessage(result.message);
            setSetupToken("");

            await update();

            setTimeout(() => {
                window.location.reload();
            }, 700);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to promote account to admin."
            );
        } finally {
            setWorking(false);
        }
    }

    if (status === "loading") {
        return (
            <section className="rounded-[2.25rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04]">
                <div className="flex items-center gap-3 text-sm font-black text-slate-500 dark:text-slate-400">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Checking admin setup status...
                </div>
            </section>
        );
    }

    if (isAdmin) {
        return (
            <section className="rounded-[2.25rem] border border-emerald-400/20 bg-emerald-400/10 p-6">
                <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white">
                        <ShieldCheck className="h-6 w-6" />
                    </div>

                    <div>
                        <h2 className="text-2xl font-black text-slate-950 dark:text-white">
                            Admin access enabled
                        </h2>

                        <p className="mt-2 text-sm leading-7 text-slate-700 dark:text-slate-300">
                            Your account already has ADMIN privileges. You can manage users
                            and platform activity from this admin dashboard.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="relative overflow-hidden rounded-[2.5rem] border border-amber-400/20 bg-amber-400/10 p-6 shadow-xl shadow-amber-900/5 dark:bg-amber-400/5 md:p-8">
            <div className="absolute right-[-20%] top-[-50%] h-80 w-80 rounded-full bg-amber-400/20 blur-3xl" />

            <div className="relative">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-white/60 px-4 py-2 text-sm font-black text-amber-700 dark:bg-white/10 dark:text-amber-300">
                    <Sparkles className="h-4 w-4" />
                    First Admin Setup
                </div>

                <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white md:text-4xl">
                    Promote your account to admin.
                </h2>

                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-700 dark:text-slate-300">
                    Use this only once during initial project setup. After the first admin
                    exists, new admins should be promoted from the admin users panel.
                </p>

                {!loggedIn && (
                    <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-bold text-red-600 dark:text-red-300">
                        <AlertTriangle className="mr-2 inline h-4 w-4" />
                        Please login first before promoting your account.
                    </div>
                )}

                <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_auto]">
                    <div className="flex h-14 items-center gap-3 rounded-2xl border border-amber-400/20 bg-white/70 px-4 dark:bg-slate-950/60">
                        <KeyRound className="h-5 w-5 text-amber-600 dark:text-amber-300" />

                        <input
                            type="password"
                            value={setupToken}
                            onChange={(event) => setSetupToken(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter" && setupToken.trim() && loggedIn) {
                                    void handlePromote();
                                }
                            }}
                            placeholder="Enter ADMIN_SETUP_TOKEN..."
                            className="w-full bg-transparent text-sm font-bold text-slate-950 outline-none placeholder:text-slate-400 dark:text-white"
                        />
                    </div>

                    <button
                        onClick={() => void handlePromote()}
                        disabled={!loggedIn || !setupToken.trim() || working}
                        className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 text-sm font-black text-white shadow-xl shadow-slate-900/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
                    >
                        {working ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <ShieldCheck className="h-4 w-4" />
                        )}
                        Promote Me
                    </button>
                </div>

                {message && (
                    <p className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="mr-2 inline h-4 w-4" />
                        {message}
                    </p>
                )}

                {error && (
                    <p className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-bold text-red-600 dark:text-red-300">
                        <AlertTriangle className="mr-2 inline h-4 w-4" />
                        {error}
                    </p>
                )}
            </div>
        </section>
    );
}