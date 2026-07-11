"use client";

import type React from "react";
import {
    ArrowRight,
    BarChart3,
    Brain,
    CheckCircle2,
    Database,
    FileText,
    LineChart,
    Newspaper,
    PieChart,
    ShieldCheck,
    Sparkles,
    TrendingUp,
    Zap,
} from "lucide-react";
import type { AppTab } from "@/lib/frontend/app-tabs";

type PremiumHomePageProps = {
    onTabChange: (tab: AppTab) => void;
    onPickResearch: (company: string) => void;
    onPickCompare: (companies: string) => void;
};

const PRODUCT_BADGES = [
    "Multi Agent Pipeline",
    "Live Financial Data",
    "News Sentiment",
    "Financial Scoring",
    "AI Recommendation",
    "Export Report",
];

const WORKFLOW = [
    {
        title: "Company",
        icon: <TrendingUp className="h-5 w-5" />,
    },
    {
        title: "Financial Agent",
        icon: <Database className="h-5 w-5" />,
    },
    {
        title: "News Agent",
        icon: <Newspaper className="h-5 w-5" />,
    },
    {
        title: "Scoring Agent",
        icon: <PieChart className="h-5 w-5" />,
    },
    {
        title: "Reasoning Agent",
        icon: <Brain className="h-5 w-5" />,
    },
    {
        title: "Investment Memo",
        icon: <FileText className="h-5 w-5" />,
    },
];

export function PremiumHomePage({
    onTabChange,
    onPickResearch,
    onPickCompare,
}: PremiumHomePageProps) {
    return (
        <div className="space-y-24">
            <section className="grid min-h-[calc(100vh-9rem)] items-center gap-12 xl:grid-cols-[1.05fr_0.95fr]">
                <div>
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-600 shadow-lg shadow-cyan-500/10 dark:text-cyan-300">
                        <Sparkles className="h-4 w-4" />
                        Autonomous AI investment research
                    </div>

                    <h1 className="max-w-5xl text-5xl font-black tracking-tight text-slate-950 dark:text-white md:text-7xl">
                        EquityLens AI
                        <span className="block bg-gradient-to-r from-cyan-500 via-violet-500 to-emerald-500 bg-clip-text text-transparent">
                            AI-powered investment research
                        </span>
                        built with financial agents.
                    </h1>

                    <p className="mt-6 max-w-2xl text-lg leading-9 text-slate-600 dark:text-slate-300">
                        Research companies, compare stocks, understand financial health,
                        track sentiment, generate investment memos, and export reports from
                        a premium AI-native SaaS workspace.
                    </p>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <button
                            onClick={() => {
                                onPickResearch("Nvidia");
                                onTabChange("research");
                            }}
                            className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-7 py-4 text-sm font-black text-white shadow-2xl shadow-slate-900/20 transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950"
                        >
                            Start Research
                            <ArrowRight className="h-4 w-4" />
                        </button>

                        <button
                            onClick={() => {
                                onPickCompare("Nvidia, Tesla, Netflix");
                                onTabChange("compare");
                            }}
                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-7 py-4 text-sm font-black text-slate-700 shadow-xl shadow-slate-900/5 backdrop-blur-xl transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
                        >
                            View Demo
                            <BarChart3 className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {PRODUCT_BADGES.map((badge) => (
                            <div
                                key={badge}
                                className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm font-black text-slate-700 shadow-lg shadow-slate-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                            >
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                {badge}
                            </div>
                        ))}
                    </div>
                </div>

                <HeroProductVisual />
            </section>

            <FilloutStyleWindow
                onTabChange={onTabChange}
                onPickResearch={onPickResearch}
            />

            <HowItWorksSection />
        </div>
    );
}

function HeroProductVisual() {
    return (
        <div className="relative mx-auto w-full max-w-xl perspective-[1400px]">
            <div className="absolute -left-10 top-10 h-24 w-24 rounded-full border border-cyan-400/30 bg-cyan-400/10 blur-sm" />
            <div className="absolute -right-8 bottom-16 h-28 w-28 rounded-full border border-violet-400/30 bg-violet-400/10 blur-sm" />

            <div className="animate-float-slow rotate-x-[7deg] rotate-y-[-9deg] overflow-hidden rounded-[2.5rem] border border-white/20 bg-slate-950 p-5 text-white shadow-2xl shadow-cyan-500/20">
                <div className="mb-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-300">
                            Live research
                        </p>
                        <h3 className="mt-2 text-2xl font-black">NVDA</h3>
                    </div>

                    <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-xs font-black text-emerald-300">
                        BUY · 92%
                    </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                    <MiniStockCard label="Revenue" value="+21%" positive />
                    <MiniStockCard label="ROE" value="25%" positive />
                    <MiniStockCard label="P/E" value="31" />
                </div>

                <div className="mt-5 rounded-[2rem] border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
                    <div className="mb-5 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-slate-400">
                                Financial Health
                            </p>
                            <p className="mt-1 text-4xl font-black">94%</p>
                        </div>

                        <div className="flex h-20 w-20 items-center justify-center rounded-full border-[10px] border-cyan-300 text-sm font-black">
                            94
                        </div>
                    </div>

                    <div className="space-y-3">
                        <ScoreLine label="Growth" value={89} />
                        <ScoreLine label="Valuation" value={61} />
                        <ScoreLine label="Sentiment" value={76} />
                    </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                    <SignalCard title="Strong AI demand" tone="positive" />
                    <SignalCard title="High valuation risk" tone="warning" />
                </div>
            </div>
        </div>
    );
}

function FilloutStyleWindow({
    onTabChange,
    onPickResearch,
}: {
    onTabChange: (tab: AppTab) => void;
    onPickResearch: (company: string) => void;
}) {
    return (
        <section className="relative overflow-hidden rounded-[3rem] border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/30">
            <div className="rounded-[2.4rem] border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-slate-950/70">
                <div className="mb-3 flex items-center justify-between rounded-[1.8rem] border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-red-400" />
                        <span className="h-3 w-3 rounded-full bg-amber-400" />
                        <span className="h-3 w-3 rounded-full bg-emerald-400" />
                    </div>

                    <p className="text-sm font-black text-slate-500 dark:text-slate-400">
                        equitylens.ai/research
                    </p>

                    <div className="w-16" />
                </div>

                <div className="grid gap-4 p-3 lg:grid-cols-[0.9fr_1.1fr]">
                    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.04]">
                        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                            <Zap className="h-5 w-5" />
                        </div>

                        <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">
                            Ask EquityLens anything.
                        </h2>

                        <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                            Natural-language research input that feels closer to ChatGPT than
                            a boring search form.
                        </p>

                        <div className="mt-6 space-y-3">
                            {[
                                "Analyze Nvidia",
                                "Compare Tesla with Microsoft",
                                "Should I invest in Reliance?",
                            ].map((prompt) => (
                                <button
                                    key={prompt}
                                    onClick={() => {
                                        onPickResearch(prompt.replace("Analyze ", ""));
                                        onTabChange("research");
                                    }}
                                    className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-black text-slate-700 transition hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-300 dark:hover:bg-white/10"
                                >
                                    {prompt}
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.04]">
                        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-600 dark:text-cyan-300">
                                    Investment Memo
                                </p>
                                <h3 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                                    NVIDIA Corporation
                                </h3>
                            </div>

                            <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-black text-emerald-600 dark:text-emerald-300">
                                BUY
                            </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-4">
                            <Metric label="Confidence" value="92%" />
                            <Metric label="Risk" value="Medium" />
                            <Metric label="Return" value="18%" />
                            <Metric label="Score" value="91" />
                        </div>

                        <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-950/60">
                            <p className="font-black text-slate-950 dark:text-white">
                                Executive Summary
                            </p>

                            <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                                The recommendation is primarily driven by strong revenue growth,
                                superior profitability, AI infrastructure demand, and healthy
                                financial quality.
                            </p>
                        </div>

                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                            <ReasonCard
                                icon={<ShieldCheck className="h-4 w-4" />}
                                title="Healthy cash flow"
                                tone="positive"
                            />
                            <ReasonCard
                                icon={<LineChart className="h-4 w-4" />}
                                title="Valuation high"
                                tone="warning"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function HowItWorksSection() {
    return (
        <section className="pb-20">
            <div className="mx-auto mb-12 max-w-3xl text-center">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-sm font-bold text-violet-600 dark:text-violet-300">
                    <Sparkles className="h-4 w-4" />
                    How it works
                </div>

                <h2 className="text-4xl font-black tracking-tight text-slate-950 dark:text-white md:text-5xl">
                    One question becomes a full agent workflow.
                </h2>

                <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">
                    EquityLens runs financial, news, scoring, and reasoning agents before
                    producing a structured investment memo.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
                {WORKFLOW.map((step, index) => (
                    <div
                        key={step.title}
                        className="relative rounded-[2rem] border border-slate-200 bg-white p-5 text-center shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20"
                    >
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                            {step.icon}
                        </div>

                        <p className="font-black text-slate-950 dark:text-white">
                            {step.title}
                        </p>

                        <p className="mt-2 font-mono text-xs font-black text-slate-400">
                            STEP {String(index + 1).padStart(2, "0")}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}

function MiniStockCard({
    label,
    value,
    positive,
}: {
    label: string;
    value: string;
    positive?: boolean;
}) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
            <p className="text-xs font-bold text-slate-400">{label}</p>
            <p
                className={`mt-1 text-2xl font-black ${positive ? "text-emerald-300" : "text-white"
                    }`}
            >
                {value}
            </p>
        </div>
    );
}

function ScoreLine({ label, value }: { label: string; value: number }) {
    return (
        <div>
            <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-bold text-slate-300">{label}</span>
                <span className="font-black text-white">{value}%</span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                    className="h-full rounded-full bg-cyan-300"
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    );
}

function SignalCard({
    title,
    tone,
}: {
    title: string;
    tone: "positive" | "warning";
}) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
            <p
                className={`text-sm font-black ${tone === "positive" ? "text-emerald-300" : "text-amber-300"
                    }`}
            >
                {title}
            </p>
        </div>
    );
}

function Metric({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-950/60">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                {label}
            </p>
            <p className="mt-1 text-xl font-black text-slate-950 dark:text-white">
                {value}
            </p>
        </div>
    );
}

function ReasonCard({
    icon,
    title,
    tone,
}: {
    icon: React.ReactNode;
    title: string;
    tone: "positive" | "warning";
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-950/60">
            <div
                className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${tone === "positive"
                        ? "bg-emerald-400/10 text-emerald-500"
                        : "bg-amber-400/10 text-amber-500"
                    }`}
            >
                {icon}
            </div>

            <p className="text-sm font-black text-slate-950 dark:text-white">
                {title}
            </p>
        </div>
    );
}