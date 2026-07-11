"use client";

import type React from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    BarChart3,
    Brain,
    CheckCircle2,
    Database,
    FileText,
    ShieldCheck,
    Sparkles,
    TrendingUp,
} from "lucide-react";
import { AuthModal } from "@/components/auth/auth-modal";

export default function SignupPage() {
    const router = useRouter();

    return (
        <main className="min-h-screen overflow-hidden bg-[#f7f8fb] text-slate-950 dark:bg-[#030712] dark:text-white">
            <div className="pointer-events-none fixed inset-0 z-0">
                <div className="absolute left-[-14%] top-[-18%] h-[520px] w-[520px] rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-400/10" />
                <div className="absolute right-[-18%] top-[10%] h-[520px] w-[520px] rounded-full bg-violet-400/20 blur-3xl dark:bg-violet-400/10" />
                <div className="absolute bottom-[-25%] left-[28%] h-[520px] w-[520px] rounded-full bg-emerald-400/10 blur-3xl dark:bg-emerald-400/5" />
            </div>

            <section className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-4 py-10 md:px-8">
                <div className="grid w-full gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
                    <div>
                        <button
                            onClick={() => router.push("/")}
                            className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2.5 text-sm font-black text-slate-700 shadow-lg shadow-slate-900/5 backdrop-blur-xl transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to EquityLens
                        </button>

                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-600 shadow-lg shadow-emerald-500/10 dark:text-emerald-300">
                            <Sparkles className="h-4 w-4" />
                            Create your research workspace
                        </div>

                        <h1 className="max-w-3xl text-5xl font-black tracking-tight text-slate-950 dark:text-white md:text-7xl">
                            Start building your AI investment vault.
                        </h1>

                        <p className="mt-6 max-w-2xl text-lg leading-9 text-slate-600 dark:text-slate-300">
                            Create an EquityLens account to save research memos, compare
                            companies, manage watchlists, and export professional reports.
                        </p>

                        <div className="mt-8 grid gap-4 sm:grid-cols-2">
                            <FeatureCard
                                icon={<Brain className="h-5 w-5" />}
                                title="AI Memos"
                                description="Generate thesis, risks, strengths, and recommendation."
                            />

                            <FeatureCard
                                icon={<Database className="h-5 w-5" />}
                                title="Persistent Data"
                                description="Save your history and portfolio ideas."
                            />

                            <FeatureCard
                                icon={<BarChart3 className="h-5 w-5" />}
                                title="Company Ranking"
                                description="Compare multiple companies and select winners."
                            />

                            <FeatureCard
                                icon={<FileText className="h-5 w-5" />}
                                title="Export Reports"
                                description="Download Markdown, JSON, CSV, and PDF-ready reports."
                            />
                        </div>
                    </div>

                    <div className="relative hidden lg:block">
                        <div className="animate-float-slow overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-950 p-6 text-white shadow-2xl shadow-emerald-500/20">
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-300">
                                        New Workspace
                                    </p>
                                    <h2 className="mt-2 text-3xl font-black">
                                        Investor Command Center
                                    </h2>
                                </div>

                                <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-black text-cyan-300">
                                    SaaS Ready
                                </div>
                            </div>

                            <div className="grid gap-4">
                                <PreviewRow
                                    title="Research history"
                                    meta="Save every generated memo"
                                />

                                <PreviewRow
                                    title="Portfolio watchlist"
                                    meta="Track companies before investing"
                                />

                                <PreviewRow
                                    title="Export center"
                                    meta="Download reports for review"
                                />

                                <PreviewRow
                                    title="Provider settings"
                                    meta="Gemini, Alpha Vantage, and theme preferences"
                                />
                            </div>

                            <div className="mt-6 rounded-[2rem] border border-white/10 bg-white/10 p-5">
                                <div className="mb-3 flex items-center gap-2 text-emerald-300">
                                    <TrendingUp className="h-5 w-5" />
                                    <p className="font-black">Why signup matters</p>
                                </div>

                                <p className="text-sm leading-7 text-slate-300">
                                    Signup makes EquityLens feel like a complete SaaS product,
                                    where every user can keep their own research workspace.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <AuthModal open onClose={() => router.push("/")} defaultMode="signup" />
        </main>
    );
}

function FeatureCard({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="rounded-[1.5rem] border border-slate-200 bg-white/80 p-5 shadow-xl shadow-slate-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                {icon}
            </div>

            <h3 className="font-black text-slate-950 dark:text-white">{title}</h3>

            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                {description}
            </p>
        </div>
    );
}

function PreviewRow({ title, meta }: { title: string; meta: string }) {
    return (
        <div className="flex items-center gap-4 rounded-[1.5rem] border border-white/10 bg-white/10 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
                <CheckCircle2 className="h-5 w-5" />
            </div>

            <div>
                <p className="font-black text-white">{title}</p>
                <p className="mt-1 text-sm text-slate-400">{meta}</p>
            </div>
        </div>
    );
}