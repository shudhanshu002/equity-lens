"use client";

import type React from "react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import {
    ArrowRight,
    Database,
    Loader2,
    Lock,
    ShieldCheck,
    Sparkles,
} from "lucide-react";
import { AuthModal } from "@/components/auth/auth-modal";

type RequireAuthWrapperProps = {
    children: React.ReactNode;
    title?: string;
    description?: string;
    compact?: boolean;
};

export function RequireAuthWrapper({
    children,
    title = "Login required",
    description = "This feature is connected to your authenticated EquityLens workspace.",
    compact = false,
}: RequireAuthWrapperProps) {
    const { status } = useSession();

    const [authOpen, setAuthOpen] = useState(false);
    const [authMode, setAuthMode] = useState<"login" | "signup">("login");

    if (status === "loading") {
        return (
            <section className="rounded-[2.5rem] border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04]">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                    <Loader2 className="h-7 w-7 animate-spin" />
                </div>

                <h2 className="text-3xl font-black text-slate-950 dark:text-white">
                    Checking session
                </h2>

                <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                    Verifying your account access.
                </p>
            </section>
        );
    }

    if (status === "authenticated") {
        return <>{children}</>;
    }

    if (compact) {
        return (
            <>
                <section className="rounded-[2rem] border border-amber-400/20 bg-amber-400/10 p-5">
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <div className="flex gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white">
                                <Lock className="h-6 w-6" />
                            </div>

                            <div>
                                <h3 className="text-xl font-black text-slate-950 dark:text-white">
                                    {title}
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
                                    {description}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                setAuthMode("login");
                                setAuthOpen(true);
                            }}
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-xl shadow-slate-900/15 transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950"
                        >
                            Login
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                </section>

                <AuthModal
                    open={authOpen}
                    onClose={() => setAuthOpen(false)}
                    defaultMode={authMode}
                />
            </>
        );
    }

    return (
        <>
            <section className="relative overflow-hidden rounded-[2.75rem] border border-slate-200 bg-white p-7 shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/30 md:p-10">
                <div className="absolute right-[-14%] top-[-34%] h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-400/10" />
                <div className="absolute bottom-[-40%] left-[18%] h-96 w-96 rounded-full bg-violet-400/20 blur-3xl dark:bg-violet-400/10" />

                <div className="relative grid gap-8 xl:grid-cols-[1.1fr_0.9fr] xl:items-center">
                    <div>
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm font-black text-amber-700 dark:text-amber-300">
                            <Lock className="h-4 w-4" />
                            Protected Feature
                        </div>

                        <h2 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 dark:text-white md:text-6xl">
                            {title}
                        </h2>

                        <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300">
                            {description}
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <button
                                onClick={() => {
                                    setAuthMode("signup");
                                    setAuthOpen(true);
                                }}
                                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white shadow-xl shadow-slate-900/20 transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950"
                            >
                                Create Account
                                <Sparkles className="h-4 w-4" />
                            </button>

                            <button
                                onClick={() => {
                                    setAuthMode("login");
                                    setAuthOpen(true);
                                }}
                                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-black text-slate-700 shadow-lg shadow-slate-900/5 transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
                            >
                                Login
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <div className="rounded-[2.5rem] border border-slate-200 bg-slate-950 p-7 text-white shadow-2xl shadow-slate-900/20 dark:border-white/10">
                        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/10">
                            <ShieldCheck className="h-8 w-8 text-emerald-300" />
                        </div>

                        <p className="mb-2 text-sm font-black uppercase tracking-[0.25em] text-cyan-300">
                            Why login?
                        </p>

                        <h3 className="text-3xl font-black">
                            Database-backed workspace
                        </h3>

                        <p className="mt-4 text-sm leading-7 text-slate-300">
                            Login connects your research history, watchlist, settings,
                            exports, and account data to PostgreSQL using NextAuth sessions.
                        </p>

                        <div className="mt-7 space-y-4">
                            <AuthBenefit text="Persistent saved research reports" />
                            <AuthBenefit text="Database-backed portfolio watchlist" />
                            <AuthBenefit text="Synced settings and export history" />
                        </div>

                        <div className="mt-7 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-xs font-black text-slate-300">
                            <Database className="h-4 w-4 text-cyan-300" />
                            Protected by authenticated user session
                        </div>
                    </div>
                </div>
            </section>

            <AuthModal
                open={authOpen}
                onClose={() => setAuthOpen(false)}
                defaultMode={authMode}
            />
        </>
    );
}

function AuthBenefit({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-3 text-sm font-bold text-slate-300">
            <ShieldCheck className="h-5 w-5 text-emerald-300" />
            {text}
        </div>
    );
}