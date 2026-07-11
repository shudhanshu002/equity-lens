"use client";

import type React from "react";
import {
    ArrowRight,
    BarChart3,
    Bot,
    Building2,
    CheckCircle2,
    Command,
    Loader2,
    MessageSquare,
    Search,
    SendHorizontal,
    Sparkles,
    WandSparkles,
} from "lucide-react";

type ConversationalResearchPanelProps = {
    variant: "research" | "compare";
    company: string;
    setCompany: React.Dispatch<React.SetStateAction<string>>;
    companies: string;
    setCompanies: React.Dispatch<React.SetStateAction<string>>;
    loading: boolean;
    error: string;
    onResearch: () => void;
    onCompare: () => void;
};

const RESEARCH_PROMPTS = [
    "Analyze Nvidia",
    "Should I invest in Apple?",
    "Research Microsoft fundamentals",
    "Is Netflix a good long-term stock?",
];

const COMPARE_PROMPTS = [
    "Compare Tesla with Microsoft",
    "Compare Nvidia, Tesla, Netflix",
    "Rank Apple, Microsoft, Amazon",
    "Which is better: Meta or Google?",
];

export function ConversationalResearchPanel({
    variant,
    company,
    setCompany,
    companies,
    setCompanies,
    loading,
    error,
    onResearch,
    onCompare,
}: ConversationalResearchPanelProps) {
    const value = variant === "research" ? company : companies;
    const setValue = variant === "research" ? setCompany : setCompanies;

    const prompts = variant === "research" ? RESEARCH_PROMPTS : COMPARE_PROMPTS;

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (loading) return;

        if (variant === "research") {
            onResearch();
            return;
        }

        onCompare();
    }

    function applyPrompt(prompt: string) {
        if (variant === "research") {
            const cleaned = prompt
                .replace(/^Analyze\s+/i, "")
                .replace(/^Should I invest in\s+/i, "")
                .replace(/^Research\s+/i, "")
                .replace(/\?$/i, "")
                .replace(/\sfundamentals$/i, "")
                .replace(/\sis a good long-term stock$/i, "")
                .trim();

            setCompany(cleaned || prompt);
            return;
        }

        const cleaned = prompt
            .replace(/^Compare\s+/i, "")
            .replace(/^Rank\s+/i, "")
            .replace(/^Which is better:\s+/i, "")
            .replace(/\?/g, "")
            .replace(/\swith\s/gi, ", ")
            .replace(/\sor\s/gi, ", ")
            .trim();

        setCompanies(cleaned || prompt);
    }

    return (
        <section className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/30 md:p-8">
            <div className="absolute right-[-12%] top-[-30%] h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-400/10" />
            <div className="absolute bottom-[-35%] left-[18%] h-80 w-80 rounded-full bg-violet-400/20 blur-3xl dark:bg-violet-400/10" />

            <div className="relative">
                <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-600 dark:text-cyan-300">
                            <Bot className="h-4 w-4" />
                            Ask EquityLens
                        </div>

                        <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white md:text-4xl">
                            {variant === "research"
                                ? "Ask a financial research question."
                                : "Ask EquityLens to compare companies."}
                        </h2>

                        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
                            {variant === "research"
                                ? "Type naturally like: Analyze Nvidia, Should I invest in Reliance, or Research Apple fundamentals."
                                : "Type naturally like: Compare Tesla with Microsoft, Rank Nvidia Tesla Netflix, or Which is better Apple or Amazon."}
                        </p>
                    </div>

                    <div className="hidden rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-500 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-400 md:block">
                        <span className="inline-flex items-center gap-2">
                            <Command className="h-4 w-4" />
                            Ctrl K for commands
                        </span>
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="rounded-[2rem] border border-slate-200 bg-slate-50 p-3 shadow-inner dark:border-white/10 dark:bg-slate-950/60"
                >
                    <div className="flex items-center gap-3">
                        <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-cyan-600 shadow-sm dark:bg-white/10 dark:text-cyan-300 sm:flex">
                            {variant === "research" ? (
                                <Search className="h-5 w-5" />
                            ) : (
                                <BarChart3 className="h-5 w-5" />
                            )}
                        </div>

                        <input
                            value={value}
                            onChange={(event) => setValue(event.target.value)}
                            placeholder={
                                variant === "research"
                                    ? "Analyze Nvidia..."
                                    : "Compare Tesla with Microsoft..."
                            }
                            className="min-h-14 flex-1 bg-transparent px-2 text-base font-bold text-slate-950 outline-none placeholder:text-slate-400 dark:text-white md:text-lg"
                        />

                        <button
                            type="submit"
                            disabled={loading || !value.trim()}
                            className="inline-flex h-12 shrink-0 items-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-black text-white shadow-xl shadow-slate-900/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Running
                                </>
                            ) : (
                                <>
                                    <span className="hidden sm:inline">
                                        {variant === "research" ? "Analyze" : "Compare"}
                                    </span>
                                    <SendHorizontal className="h-4 w-4" />
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {error && (
                    <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-bold text-red-600 dark:text-red-300">
                        {error}
                    </div>
                )}

                <div className="mt-5">
                    <div className="mb-3 flex items-center gap-2 text-sm font-black text-slate-500 dark:text-slate-400">
                        <WandSparkles className="h-4 w-4" />
                        Suggested prompts
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {prompts.map((prompt) => (
                            <button
                                key={prompt}
                                onClick={() => applyPrompt(prompt)}
                                className="group inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-400/30 hover:text-cyan-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-cyan-300"
                            >
                                <MessageSquare className="h-3.5 w-3.5" />
                                {prompt}
                                <ArrowRight className="h-3.5 w-3.5 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-3">
                    <CapabilityCard
                        icon={<Building2 className="h-4 w-4" />}
                        title="Company aware"
                        description="Understands company names and maps them to tickers."
                    />

                    <CapabilityCard
                        icon={<Sparkles className="h-4 w-4" />}
                        title="AI-native"
                        description="Turns plain English into a structured research workflow."
                    />

                    <CapabilityCard
                        icon={<CheckCircle2 className="h-4 w-4" />}
                        title="Explainable"
                        description="Every recommendation includes scores and reasoning."
                    />
                </div>
            </div>
        </section>
    );
}

function CapabilityCard({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-950/50">
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