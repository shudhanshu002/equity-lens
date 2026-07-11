"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import {
    Brain,
    CheckCircle2,
    Clock3,
    Database,
    FileText,
    GitBranch,
    Loader2,
    Newspaper,
    PieChart,
    Search,
    ShieldCheck,
    Sparkles,
} from "lucide-react";

type AgentProgressTimelineProps = {
    loading: boolean;
    variant: "research" | "compare";
};

type ProgressStep = {
    title: string;
    description: string;
    icon: React.ReactNode;
};

const RESEARCH_STEPS: ProgressStep[] = [
    {
        title: "Resolving Company",
        description: "Mapping the company name to ticker, exchange, sector, and profile.",
        icon: <Search className="h-5 w-5" />,
    },
    {
        title: "Fetching Financial Statements",
        description: "Reading fundamentals, valuation ratios, margins, and profitability metrics.",
        icon: <Database className="h-5 w-5" />,
    },
    {
        title: "Gathering News",
        description: "Collecting recent news signals and market sentiment context.",
        icon: <Newspaper className="h-5 w-5" />,
    },
    {
        title: "Running Sentiment Model",
        description: "Classifying positive, neutral, and negative news impact.",
        icon: <Brain className="h-5 w-5" />,
    },
    {
        title: "Calculating Financial Scores",
        description: "Scoring growth, profitability, balance sheet, valuation, and sentiment.",
        icon: <PieChart className="h-5 w-5" />,
    },
    {
        title: "Generating Investment Thesis",
        description: "Creating the final AI memo with recommendation, risks, and reasoning.",
        icon: <FileText className="h-5 w-5" />,
    },
];

const COMPARE_STEPS: ProgressStep[] = [
    {
        title: "Parsing Companies",
        description: "Preparing each company for independent research execution.",
        icon: <Search className="h-5 w-5" />,
    },
    {
        title: "Running Parallel Research",
        description: "Executing financial and news agents for every company.",
        icon: <GitBranch className="h-5 w-5" />,
    },
    {
        title: "Normalizing Scores",
        description: "Comparing growth, profitability, valuation, risk, and sentiment.",
        icon: <PieChart className="h-5 w-5" />,
    },
    {
        title: "Ranking Candidates",
        description: "Sorting companies by score, confidence, and investment quality.",
        icon: <ShieldCheck className="h-5 w-5" />,
    },
    {
        title: "Selecting Winner",
        description: "Identifying the strongest company and explaining the tradeoffs.",
        icon: <Sparkles className="h-5 w-5" />,
    },
    {
        title: "Writing Comparison Memo",
        description: "Generating the final comparison summary and ranking rationale.",
        icon: <FileText className="h-5 w-5" />,
    },
];

export function AgentProgressTimeline({
    loading,
    variant,
}: AgentProgressTimelineProps) {
    const [activeStep, setActiveStep] = useState(0);

    const steps = useMemo(
        () => (variant === "research" ? RESEARCH_STEPS : COMPARE_STEPS),
        [variant]
    );

    useEffect(() => {
        if (!loading) {
            setActiveStep(0);
            return;
        }

        const interval = window.setInterval(() => {
            setActiveStep((current) => {
                if (current >= steps.length - 1) return current;
                return current + 1;
            });
        }, 850);

        return () => {
            window.clearInterval(interval);
        };
    }, [loading, steps.length]);

    if (!loading) return null;

    return (
        <section className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/30 md:p-8">
            <div className="absolute right-[-14%] top-[-35%] h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-400/10" />
            <div className="absolute bottom-[-36%] left-[16%] h-80 w-80 rounded-full bg-violet-400/20 blur-3xl dark:bg-violet-400/10" />

            <div className="relative">
                <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-600 dark:text-cyan-300">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Research Progress
                        </div>

                        <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white md:text-4xl">
                            Agents are working on your request.
                        </h2>

                        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
                            EquityLens is executing the agent workflow step-by-step before
                            generating the final investment memo.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-slate-950/60">
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                            Progress
                        </p>
                        <p className="mt-1 text-2xl font-black text-slate-950 dark:text-white">
                            {Math.min(
                                100,
                                Math.round(((activeStep + 1) / steps.length) * 100)
                            )}
                            %
                        </p>
                    </div>
                </div>

                <div className="mb-8 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                    <div
                        className="h-full rounded-full bg-slate-950 transition-all duration-700 dark:bg-cyan-300"
                        style={{
                            width: `${Math.min(
                                100,
                                Math.round(((activeStep + 1) / steps.length) * 100)
                            )}%`,
                        }}
                    />
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    {steps.map((step, index) => {
                        const completed = index < activeStep;
                        const active = index === activeStep;
                        const pending = index > activeStep;

                        return (
                            <div
                                key={step.title}
                                className={`relative overflow-hidden rounded-[1.5rem] border p-5 transition-all duration-500 ${active
                                        ? "border-cyan-400/40 bg-cyan-400/10 shadow-xl shadow-cyan-500/10"
                                        : completed
                                            ? "border-emerald-400/30 bg-emerald-400/10"
                                            : "border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-950/60"
                                    }`}
                            >
                                {active && (
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.18),_transparent_35%)]" />
                                )}

                                <div className="relative flex gap-4">
                                    <div
                                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${completed
                                                ? "bg-emerald-500 text-white"
                                                : active
                                                    ? "bg-cyan-500 text-white"
                                                    : "bg-white text-slate-400 shadow-sm dark:bg-white/10"
                                            }`}
                                    >
                                        {completed ? (
                                            <CheckCircle2 className="h-5 w-5" />
                                        ) : active ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            step.icon
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                                            <h3 className="font-black text-slate-950 dark:text-white">
                                                {step.title}
                                            </h3>

                                            <StatusPill
                                                completed={completed}
                                                active={active}
                                                pending={pending}
                                            />
                                        </div>

                                        <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                                            {step.description}
                                        </p>

                                        <p className="mt-3 font-mono text-xs font-black text-slate-400">
                                            AGENT_STEP_{String(index + 1).padStart(2, "0")}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-6 rounded-[1.5rem] border border-violet-400/20 bg-violet-400/10 p-5">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-violet-500 text-white">
                            <Clock3 className="h-5 w-5" />
                        </div>

                        <div>
                            <p className="font-black text-slate-950 dark:text-white">
                                Why this screen matters
                            </p>

                            <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                                Instead of instantly showing a static answer, EquityLens makes
                                the AI workflow visible. This makes the product feel more
                                agentic, explainable, and trustworthy.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function StatusPill({
    completed,
    active,
    pending,
}: {
    completed: boolean;
    active: boolean;
    pending: boolean;
}) {
    if (completed) {
        return (
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-600 dark:text-emerald-300">
                Complete
            </span>
        );
    }

    if (active) {
        return (
            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-black text-cyan-600 dark:text-cyan-300">
                Running
            </span>
        );
    }

    if (pending) {
        return (
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-black text-slate-400 dark:border-white/10 dark:bg-white/5">
                Waiting
            </span>
        );
    }

    return null;
}