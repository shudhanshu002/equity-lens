"use client";

import { Check, Circle, Loader2 } from "lucide-react";

type TraceStep = {
    step: string;
    status: string;
    provider?: string;
    message?: string;
    timestamp?: string;
};

type AgentGraphVisualizationProps = {
    mode?: "research" | "compare" | string;
    company?: string;
    trace?: TraceStep[];
    isRunning?: boolean;
    isLoading?: boolean;
    running?: boolean;
};

const AGENT_NODES = [
    { step: "resolve_company", title: "Resolve" },
    { step: "fetch_financials", title: "Financials" },
    { step: "fetch_news", title: "News" },
    { step: "score_company", title: "Ratios" },
    { step: "fetch_news", title: "Sentiment" },
    { step: "score_company", title: "Decision" },
    { step: "generate_memo", title: "Memo" },
];

export function AgentGraphVisualization({
    company = "User input",
    trace = [],
    isRunning,
    isLoading,
    running,
}: AgentGraphVisualizationProps) {
    const currentlyRunning = Boolean(isRunning || isLoading || running);
    const firstIncompleteIndex = AGENT_NODES.findIndex(
        (node) => !isNodeCompleted(node.step, trace)
    );
    const activeIndex = currentlyRunning
        ? firstIncompleteIndex >= 0
            ? firstIncompleteIndex
            : AGENT_NODES.length - 1
        : -1;
    const completed = !currentlyRunning && trace.some(
        (item) => item.step === "generate_memo" && ["SUCCESS", "FALLBACK"].includes(item.status)
    );

    return (
        <section className="border-y border-slate-200 py-5 dark:border-white/10">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
                <div>
                    <h2 className="text-sm font-semibold text-slate-950 dark:text-white">Research workflow</h2>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{company}</p>
                </div>
                <span className={`text-xs font-medium ${completed ? "text-emerald-600 dark:text-emerald-400" : currentlyRunning ? "text-cyan-600 dark:text-cyan-300" : "text-slate-400"}`}>
                    {completed ? "Completed" : currentlyRunning ? "Running" : "Ready"}
                </span>
            </div>

            <ol className="grid gap-0 sm:grid-cols-7">
                {AGENT_NODES.map((node, index) => {
                    const nodeCompleted = isNodeCompleted(node.step, trace);
                    const active = activeIndex === index;

                    return (
                        <li key={`${node.step}-${node.title}`} className="relative flex min-h-12 items-center gap-3 pb-3 sm:block sm:min-h-0 sm:pb-0 sm:text-center">
                            {index < AGENT_NODES.length - 1 && (
                                <span className={`absolute left-[13px] top-7 h-[calc(100%-16px)] w-px sm:left-1/2 sm:top-[13px] sm:h-px sm:w-full ${nodeCompleted ? "bg-emerald-400" : "bg-slate-200 dark:bg-white/10"}`} />
                            )}
                            <span className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border sm:mx-auto ${active ? "border-cyan-500 bg-cyan-500 text-white" : nodeCompleted ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 bg-slate-50 text-slate-400 dark:border-white/15 dark:bg-slate-950"}`}>
                                {active ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : nodeCompleted ? <Check className="h-3.5 w-3.5" /> : <Circle className="h-2.5 w-2.5" />}
                            </span>
                            <span className={`text-xs font-medium sm:mt-2 sm:block ${active ? "text-cyan-600 dark:text-cyan-300" : nodeCompleted ? "text-slate-800 dark:text-slate-200" : "text-slate-400"}`}>
                                {node.title}
                            </span>
                        </li>
                    );
                })}
            </ol>
        </section>
    );
}

function isNodeCompleted(step: string, trace: TraceStep[]) {
    return trace.some(
        (item) => item.step === step && ["SUCCESS", "FALLBACK"].includes(item.status)
    );
}
