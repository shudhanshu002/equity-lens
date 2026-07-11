"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import {
    Brain,
    Building2,
    CheckCircle2,
    Database,
    FileText,
    GitBranch,
    Loader2,
    Newspaper,
    PieChart,
    ShieldCheck,
    Sparkles,
} from "lucide-react";

type AgentGraphVisualizationProps = {
    loading: boolean;
    variant: "research" | "compare";
};

type GraphNode = {
    id: string;
    label: string;
    description: string;
    icon: React.ReactNode;
    x: string;
    y: string;
};

type GraphEdge = {
    from: string;
    to: string;
};

const RESEARCH_NODES: GraphNode[] = [
    {
        id: "company",
        label: "Company",
        description: "User input",
        icon: <Building2 className="h-5 w-5" />,
        x: "50%",
        y: "4%",
    },
    {
        id: "resolve",
        label: "Resolve Agent",
        description: "Maps company to ticker",
        icon: <GitBranch className="h-5 w-5" />,
        x: "50%",
        y: "20%",
    },
    {
        id: "financial",
        label: "Financial Agent",
        description: "Fetches fundamentals",
        icon: <Database className="h-5 w-5" />,
        x: "30%",
        y: "40%",
    },
    {
        id: "news",
        label: "News Agent",
        description: "Reads market signals",
        icon: <Newspaper className="h-5 w-5" />,
        x: "70%",
        y: "40%",
    },
    {
        id: "ratio",
        label: "Ratio Agent",
        description: "Calculates financial health",
        icon: <PieChart className="h-5 w-5" />,
        x: "30%",
        y: "60%",
    },
    {
        id: "sentiment",
        label: "Sentiment Agent",
        description: "Classifies news impact",
        icon: <Brain className="h-5 w-5" />,
        x: "70%",
        y: "60%",
    },
    {
        id: "decision",
        label: "Decision Agent",
        description: "Scores recommendation",
        icon: <ShieldCheck className="h-5 w-5" />,
        x: "50%",
        y: "78%",
    },
    {
        id: "memo",
        label: "Investment Memo",
        description: "Structured AI output",
        icon: <FileText className="h-5 w-5" />,
        x: "50%",
        y: "94%",
    },
];

const RESEARCH_EDGES: GraphEdge[] = [
    { from: "company", to: "resolve" },
    { from: "resolve", to: "financial" },
    { from: "resolve", to: "news" },
    { from: "financial", to: "ratio" },
    { from: "news", to: "sentiment" },
    { from: "ratio", to: "decision" },
    { from: "sentiment", to: "decision" },
    { from: "decision", to: "memo" },
];

const COMPARE_NODES: GraphNode[] = [
    {
        id: "companies",
        label: "Companies",
        description: "2–3 inputs",
        icon: <Building2 className="h-5 w-5" />,
        x: "50%",
        y: "4%",
    },
    {
        id: "orchestrator",
        label: "LangGraph",
        description: "Parallel research",
        icon: <GitBranch className="h-5 w-5" />,
        x: "50%",
        y: "20%",
    },
    {
        id: "companyA",
        label: "Company A",
        description: "Research run",
        icon: <Database className="h-5 w-5" />,
        x: "22%",
        y: "42%",
    },
    {
        id: "companyB",
        label: "Company B",
        description: "Research run",
        icon: <Database className="h-5 w-5" />,
        x: "50%",
        y: "42%",
    },
    {
        id: "companyC",
        label: "Company C",
        description: "Research run",
        icon: <Database className="h-5 w-5" />,
        x: "78%",
        y: "42%",
    },
    {
        id: "normalize",
        label: "Normalize",
        description: "Score alignment",
        icon: <PieChart className="h-5 w-5" />,
        x: "50%",
        y: "64%",
    },
    {
        id: "rank",
        label: "Ranking Agent",
        description: "Winner selection",
        icon: <ShieldCheck className="h-5 w-5" />,
        x: "50%",
        y: "80%",
    },
    {
        id: "comparison",
        label: "Comparison Memo",
        description: "Final output",
        icon: <FileText className="h-5 w-5" />,
        x: "50%",
        y: "94%",
    },
];

const COMPARE_EDGES: GraphEdge[] = [
    { from: "companies", to: "orchestrator" },
    { from: "orchestrator", to: "companyA" },
    { from: "orchestrator", to: "companyB" },
    { from: "orchestrator", to: "companyC" },
    { from: "companyA", to: "normalize" },
    { from: "companyB", to: "normalize" },
    { from: "companyC", to: "normalize" },
    { from: "normalize", to: "rank" },
    { from: "rank", to: "comparison" },
];

export function AgentGraphVisualization({
    loading,
    variant,
}: AgentGraphVisualizationProps) {
    const [activeIndex, setActiveIndex] = useState(0);

    const nodes = useMemo(
        () => (variant === "research" ? RESEARCH_NODES : COMPARE_NODES),
        [variant]
    );

    const edges = useMemo(
        () => (variant === "research" ? RESEARCH_EDGES : COMPARE_EDGES),
        [variant]
    );

    useEffect(() => {
        if (!loading) {
            setActiveIndex(nodes.length - 1);
            return;
        }

        setActiveIndex(0);

        const interval = window.setInterval(() => {
            setActiveIndex((current) => {
                if (current >= nodes.length - 1) return 1;
                return current + 1;
            });
        }, 900);

        return () => window.clearInterval(interval);
    }, [loading, nodes.length]);

    return (
        <section className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/30 md:p-8">
            <div className="absolute right-[-14%] top-[-30%] h-80 w-80 rounded-full bg-violet-400/20 blur-3xl dark:bg-violet-400/10" />
            <div className="absolute bottom-[-32%] left-[12%] h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-400/10" />

            <div className="relative">
                <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-sm font-bold text-violet-600 dark:text-violet-300">
                            <GitBranch className="h-4 w-4" />
                            LangGraph execution
                        </div>

                        <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white md:text-4xl">
                            Watch the agents execute visually.
                        </h2>

                        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
                            EquityLens makes the workflow visible: company resolution, data
                            gathering, scoring, sentiment, decisioning, and memo generation.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-slate-950/60">
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                            Mode
                        </p>
                        <p className="mt-1 text-lg font-black capitalize text-slate-950 dark:text-white">
                            {variant}
                        </p>
                    </div>
                </div>

                <div className="relative min-h-[640px] overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-950/60">
                    <div className="absolute inset-0 opacity-[0.45] dark:opacity-[0.28]">
                        <div className="h-full w-full bg-[linear-gradient(to_right,rgba(148,163,184,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.18)_1px,transparent_1px)] bg-[size:36px_36px]" />
                    </div>

                    <svg className="absolute inset-0 h-full w-full">
                        {edges.map((edge) => {
                            const from = nodes.find((node) => node.id === edge.from);
                            const to = nodes.find((node) => node.id === edge.to);

                            if (!from || !to) return null;

                            const fromIndex = nodes.findIndex((node) => node.id === edge.from);
                            const toIndex = nodes.findIndex((node) => node.id === edge.to);

                            const edgeActive = activeIndex >= fromIndex && activeIndex >= toIndex;

                            return (
                                <line
                                    key={`${edge.from}-${edge.to}`}
                                    x1={from.x}
                                    y1={from.y}
                                    x2={to.x}
                                    y2={to.y}
                                    stroke={edgeActive ? "currentColor" : "currentColor"}
                                    strokeWidth={edgeActive ? "3" : "2"}
                                    strokeDasharray={edgeActive ? "0" : "7 7"}
                                    className={
                                        edgeActive
                                            ? "text-cyan-500 dark:text-cyan-300"
                                            : "text-slate-300 dark:text-white/15"
                                    }
                                />
                            );
                        })}
                    </svg>

                    {nodes.map((node, index) => {
                        const active = index === activeIndex;
                        const completed = index < activeIndex;
                        const waiting = index > activeIndex;

                        return (
                            <div
                                key={node.id}
                                className="absolute -translate-x-1/2 -translate-y-1/2"
                                style={{
                                    left: node.x,
                                    top: node.y,
                                }}
                            >
                                <div
                                    className={`relative w-[178px] rounded-[1.4rem] border p-4 text-center shadow-xl transition-all duration-500 ${active
                                            ? "scale-105 border-cyan-400/50 bg-cyan-400/10 shadow-cyan-500/15"
                                            : completed
                                                ? "border-emerald-400/40 bg-emerald-400/10 shadow-emerald-500/10"
                                                : "border-slate-200 bg-white dark:border-white/10 dark:bg-slate-950"
                                        } ${waiting ? "opacity-70" : "opacity-100"}`}
                                >
                                    {active && (
                                        <div className="absolute -inset-1 -z-10 rounded-[1.6rem] bg-cyan-400/20 blur-xl" />
                                    )}

                                    <div
                                        className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl ${active
                                                ? "bg-cyan-500 text-white"
                                                : completed
                                                    ? "bg-emerald-500 text-white"
                                                    : "bg-slate-100 text-slate-400 dark:bg-white/10"
                                            }`}
                                    >
                                        {active && loading ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : completed ? (
                                            <CheckCircle2 className="h-5 w-5" />
                                        ) : (
                                            node.icon
                                        )}
                                    </div>

                                    <p className="text-sm font-black text-slate-950 dark:text-white">
                                        {node.label}
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                                        {node.description}
                                    </p>

                                    <p className="mt-3 font-mono text-[10px] font-black text-slate-400">
                                        NODE_{String(index + 1).padStart(2, "0")}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                    <LegendCard
                        icon={<Loader2 className="h-4 w-4 animate-spin" />}
                        title="Running"
                        description="The currently active agent node."
                    />

                    <LegendCard
                        icon={<CheckCircle2 className="h-4 w-4" />}
                        title="Completed"
                        description="Agent step has finished execution."
                    />

                    <LegendCard
                        icon={<Sparkles className="h-4 w-4" />}
                        title="Explainable"
                        description="The full workflow is visible to the user."
                    />
                </div>
            </div>
        </section>
    );
}

function LegendCard({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-950/60">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-cyan-600 shadow-sm dark:bg-white/10 dark:text-cyan-300">
                {icon}
            </div>

            <p className="font-black text-slate-950 dark:text-white">{title}</p>

            <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                {description}
            </p>
        </div>
    );
}