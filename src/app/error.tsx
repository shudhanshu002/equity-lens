"use client";

import { useEffect } from "react";
import {
    AlertTriangle,
    ArrowLeft,
    Bug,
    RefreshCcw,
    ShieldAlert,
} from "lucide-react";

type ErrorPageProps = {
    error: Error & {
        digest?: string;
    };
    reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
    useEffect(() => {
        console.error("EquityLens runtime error:", error);
    }, [error]);

    return (
        <main className="min-h-screen overflow-hidden bg-slate-50 text-slate-950 dark:bg-[#020617] dark:text-white">
            <div className="pointer-events-none fixed inset-0">
                <div className="absolute left-[-10%] top-[-10%] h-[420px] w-[420px] rounded-full bg-red-400/20 blur-3xl dark:bg-red-400/10" />
                <div className="absolute right-[-10%] top-[20%] h-[420px] w-[420px] rounded-full bg-violet-400/20 blur-3xl dark:bg-violet-400/10" />
                <div className="absolute bottom-[-20%] left-[30%] h-[420px] w-[420px] rounded-full bg-cyan-400/10 blur-3xl dark:bg-cyan-400/5" />
            </div>

            <section className="relative z-10 flex min-h-screen items-center justify-center px-5 py-10">
                <div className="w-full max-w-5xl overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/30">
                    <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
                        <div className="relative bg-slate-950 p-8 text-white md:p-10">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(248,113,113,0.25),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(139,92,246,0.24),_transparent_35%)]" />

                            <div className="relative">
                                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/10">
                                    <AlertTriangle className="h-8 w-8 text-red-300" />
                                </div>

                                <p className="mb-3 text-sm font-black uppercase tracking-[0.3em] text-red-300">
                                    Runtime Error
                                </p>

                                <h1 className="text-4xl font-black tracking-tight md:text-5xl">
                                    Something broke inside EquityLens AI
                                </h1>

                                <p className="mt-5 text-sm leading-7 text-slate-300">
                                    The app hit an unexpected rendering or runtime issue. This can
                                    happen because of a failed response shape, missing field, or
                                    frontend component error.
                                </p>

                                <div className="mt-8 rounded-3xl border border-white/10 bg-white/10 p-5">
                                    <div className="mb-3 flex items-center gap-2 text-amber-300">
                                        <ShieldAlert className="h-5 w-5" />
                                        <p className="font-black">Developer note</p>
                                    </div>

                                    <p className="text-sm leading-6 text-slate-300">
                                        Check the browser console and terminal logs for the exact
                                        stack trace. The error message is shown on the right.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 md:p-10">
                            <div className="mb-8">
                                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm font-bold text-red-600 dark:text-red-300">
                                    <Bug className="h-4 w-4" />
                                    Error captured
                                </div>

                                <h2 className="text-3xl font-black text-slate-950 dark:text-white">
                                    Runtime details
                                </h2>

                                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                                    Use this message to debug the failing component or API
                                    response field.
                                </p>
                            </div>

                            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-950/60">
                                <p className="mb-3 text-xs font-black uppercase tracking-widest text-slate-500">
                                    Error Message
                                </p>

                                <p className="break-words text-sm font-semibold leading-6 text-slate-700 dark:text-slate-300">
                                    {error.message || "Unknown error"}
                                </p>

                                {error.digest && (
                                    <div className="mt-5 rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/5">
                                        <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                                            Digest
                                        </p>

                                        <p className="mt-1 break-words font-mono text-xs text-slate-600 dark:text-slate-400">
                                            {error.digest}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 flex flex-wrap gap-3">
                                <button
                                    onClick={reset}
                                    className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-xl shadow-slate-900/20 transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950"
                                >
                                    <RefreshCcw className="h-4 w-4" />
                                    Try Again
                                </button>

                                <a
                                    href="/"
                                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-lg shadow-slate-900/5 transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/10 dark:text-slate-300"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Back Home
                                </a>
                            </div>

                            <div className="mt-8 rounded-[1.5rem] border border-amber-400/20 bg-amber-400/10 p-5">
                                <p className="font-black text-amber-600 dark:text-amber-300">
                                    Common fixes
                                </p>

                                <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
                                    <li>Check if an API response field is undefined.</li>
                                    <li>Check if a component expects an array but gets null.</li>
                                    <li>Check if an icon import from lucide-react is invalid.</li>
                                    <li>Run npm run build to catch TypeScript issues.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}