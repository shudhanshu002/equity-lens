"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Loader2 } from "lucide-react";

type AgentProgressTimelineProps = {
    loading: boolean;
    variant: "research" | "compare";
};

const RESEARCH_STEPS = ["Resolve", "Financials", "News", "Sentiment", "Score", "Memo"];
const COMPARE_STEPS = ["Parse", "Research", "Normalize", "Rank", "Select", "Memo"];

export function AgentProgressTimeline({ loading, variant }: AgentProgressTimelineProps) {
    const [activeStep, setActiveStep] = useState(0);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const steps = useMemo(() => variant === "research" ? RESEARCH_STEPS : COMPARE_STEPS, [variant]);

    useEffect(() => {
        if (!loading) {
            setActiveStep(0);
            setElapsedSeconds(0);
            return;
        }

        const startedAt = Date.now();
        const timer = window.setInterval(() => {
            setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
        }, 250);
        const progress = window.setInterval(() => {
            setActiveStep((current) => Math.min(current + 1, steps.length - 1));
        }, 1100);

        return () => {
            window.clearInterval(timer);
            window.clearInterval(progress);
        };
    }, [loading, steps.length]);

    if (!loading) return null;

    return (
        <section className="border-y border-slate-200 py-5 dark:border-white/10">
            <div className="mb-5 flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin text-cyan-500" />
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-950 dark:text-white">Generating research</p>
                        <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">Running financial, news, scoring, and memo agents</p>
                    </div>
                </div>
                <div className="flex shrink-0 items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>Working for</span>
                    <time className="font-mono text-sm">{formatElapsed(elapsedSeconds)}</time>
                </div>
            </div>

            <ol className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {steps.map((step, index) => {
                    const complete = index < activeStep;
                    const active = index === activeStep;
                    return (
                        <li key={step} className="flex items-center gap-2 text-xs">
                            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${complete ? "bg-emerald-500 text-white" : active ? "bg-cyan-500 text-white" : "bg-slate-200 text-slate-400 dark:bg-white/10"}`}>
                                {complete ? <Check className="h-3 w-3" /> : active ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                            </span>
                            <span className={active ? "font-medium text-slate-950 dark:text-white" : "text-slate-500 dark:text-slate-400"}>{step}</span>
                        </li>
                    );
                })}
            </ol>
        </section>
    );
}

function formatElapsed(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}
