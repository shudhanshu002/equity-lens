"use client";

import type React from "react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import {
    ArrowRight,
    BarChart3,
    Database,
    Download,
    History,
    LineChart,
    Lock,
    Settings,
    ShieldCheck,
    Sparkles,
} from "lucide-react";
import type { AppTab } from "@/lib/frontend/app-tabs";
import { AuthModal } from "@/components/auth/auth-modal";

type AuthGuardCardProps = {
    title: string;
    description: string;
    feature: "history" | "portfolio" | "exports" | "settings" | "dashboard";
    onTabChange?: (tab: AppTab) => void;
    children?: React.ReactNode;
};

const FEATURE_CONFIG = {
    history: {
        icon: History,
        color: "blue",
        benefits: [
            "Save research reports",
            "Store comparison results",
            "Sync local history to database",
        ],
    },
    portfolio: {
        icon: LineChart,
        color: "emerald",
        benefits: [
            "Save watchlist companies",
            "Track research ideas",
            "Sync portfolio across sessions",
        ],
    },
    exports: {
        icon: Download,
        color: "orange",
        benefits: [
            "Save export history",
            "Track downloaded reports",
            "Store report metadata",
        ],
    },
    settings: {
        icon: Settings,
        color: "violet",
        benefits: [
            "Save provider preferences",
            "Sync theme settings",
            "Manage account security",
        ],
    },
    dashboard: {
        icon: BarChart3,
        color: "cyan",
        benefits: [
            "View workspace summary",
            "Track account activity",
            "Monitor research progress",
        ],
    },
};

export function AuthGuardCard({
    title,
    description,
    feature,
    onTabChange,
    children,
}: AuthGuardCardProps) {
    const { status } = useSession();

    const [authOpen, setAuthOpen] = useState(false);
    const [authMode, setAuthMode] = useState<"login" | "signup">("login");

    const loggedIn = status === "authenticated";
    const loading = status === "loading";

    if (loading) {
        return (
            <section className="rounded-[2.5rem] border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04]">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                    <ShieldCheck className="h-7 w-7 animate-pulse" />
                </div>

                <h2 className="text-3xl font-black text-slate-950 dark:text-white">
                    Checking session
                </h2>

                <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                    EquityLens is verifying your account access.
                </p>
            </section>
        );
    }

    if (loggedIn) {
        return <>{children}</>;
    }

    const config = FEATURE_CONFIG[feature];
    const Icon = config.icon;

    return (
        <>
            <section className="relative overflow-hidden rounded-[2.75rem] border border-slate-200 bg-white p-7 shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/30 md:p-10">
                <div className="absolute right-[-14%] top-[-34%] h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-400/10" />
                <div className="absolute bottom-[-40%] left-[18%] h-96 w-96 rounded-full bg-violet-400/20 blur-3xl dark:bg-violet-400/10" />

                <div className="relative grid gap-8 xl:grid-cols-[1.1fr_0.9fr] xl:items-center">
                    <div>
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm font-black text-amber-700 dark:text-amber-300">
                            <Lock className="h-4 w-4" />
                            Login Required
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

                            {onTabChange && (
                                <button
                                    onClick={() => onTabChange("research")}
                                    className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-6 py-3 text-sm font-black text-cyan-700 transition hover:-translate-y-0.5 dark:text-cyan-300"
                                >
                                    Try Research Without Login
                                    <Sparkles className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="rounded-[2.5rem] border border-slate-200 bg-slate-950 p-7 text-white shadow-2xl shadow-slate-900/20 dark:border-white/10">
                        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/10">
                            <Icon className="h-8 w-8 text-cyan-300" />
                        </div>

                        <p className="mb-2 text-sm font-black uppercase tracking-[0.25em] text-cyan-300">
                            Account Feature
                        </p>

                        <h3 className="text-3xl font-black">
                            Database-backed workspace
                        </h3>

                        <p className="mt-4 text-sm leading-7 text-slate-300">
                            Login connects this feature to your PostgreSQL user workspace
                            instead of temporary browser state.
                        </p>

                        <div className="mt-7 space-y-4">
                            {config.benefits.map((benefit) => (
                                <div
                                    key={benefit}
                                    className="flex items-center gap-3 text-sm font-bold text-slate-300"
                                >
                                    <ShieldCheck className="h-5 w-5 text-emerald-300" />
                                    {benefit}
                                </div>
                            ))}
                        </div>

                        <div className="mt-7 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-xs font-black text-slate-300">
                            <Database className="h-4 w-4 text-cyan-300" />
                            Protected by NextAuth session
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