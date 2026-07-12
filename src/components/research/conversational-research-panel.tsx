"use client";

import type React from "react";
import {
    ArrowUp,
    Loader2,
    MessageCircleQuestion,
    Sparkles,
} from "lucide-react";

type ConversationalResearchPanelProps = {
    variant: "research" | "compare";
    company: string;
    setCompany: React.Dispatch<React.SetStateAction<string>>;
    companies: string;
    setCompanies: React.Dispatch<React.SetStateAction<string>>;
    loading: boolean;
    error: string;
    conversationActive?: boolean;
    contextCompany?: string;
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
    conversationActive = false,
    contextCompany,
    onResearch,
    onCompare,
}: ConversationalResearchPanelProps) {
    const value = variant === "research" ? company : companies;
    const setValue = variant === "research" ? setCompany : setCompanies;
    const isFollowUp = variant === "research" && conversationActive && Boolean(contextCompany);
    const prompts = isFollowUp
        ? ["Has the investment case changed?", "What are the biggest risks now?", "How does valuation look?", "What should I monitor next?"]
        : variant === "research" ? RESEARCH_PROMPTS : COMPARE_PROMPTS;

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
        if (isFollowUp) {
            setCompany(prompt);
            return;
        }

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
        <section className={conversationActive ? "relative" : "relative -mb-12 h-[calc(100dvh-8.5rem)] min-h-[420px] overflow-hidden"}>
            <div className={conversationActive ? "mx-auto w-full max-w-4xl" : "mx-auto flex h-full w-full max-w-4xl flex-col px-5 pb-2 sm:px-8 md:px-12"}>
                {!conversationActive && <div className="flex flex-1 flex-col items-center justify-center text-center">
                    <h2 className="max-w-2xl text-2xl font-semibold tracking-normal text-slate-950 dark:text-white sm:text-3xl">
                        {variant === "research"
                            ? "What company would you like to research?"
                            : "Which companies would you like to compare?"}
                    </h2>

                    <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                        {variant === "research"
                            ? "Ask about fundamentals, financial health, sentiment, valuation, or long-term investment potential."
                            : "Compare financial health, scoring, sentiment, and investment potential in one report."}
                    </p>

                </div>}

                {!conversationActive && <div className="mx-auto mb-3 grid w-full max-w-2xl gap-2 sm:grid-cols-2">
                        {prompts.map((prompt) => (
                            <button
                                key={prompt}
                                type="button"
                                onClick={() => applyPrompt(prompt)}
                                className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 dark:border-white/10 dark:text-slate-300 dark:hover:border-white/20 dark:hover:bg-white/5 dark:hover:text-white"
                            >
                                <Sparkles className="h-4 w-4 shrink-0 text-emerald-500" />
                                <span>{prompt}</span>
                            </button>
                        ))}
                </div>}

                {error && (
                    <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300">
                        {error}
                    </div>
                )}

                {isFollowUp && (
                    <div className="mb-2 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
                        {prompts.map((prompt) => (
                            <button key={prompt} type="button" onClick={() => applyPrompt(prompt)} disabled={loading} className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-emerald-300 hover:text-slate-950 disabled:opacity-50 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-emerald-400/40 dark:hover:text-white">
                                <MessageCircleQuestion className="h-3.5 w-3.5 text-emerald-500" />
                                {prompt}
                            </button>
                        ))}
                    </div>
                )}

                {variant === "research" && (
                    <div className="mb-2 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200">
                        <MessageCircleQuestion className="h-3.5 w-3.5 shrink-0" />
                        <span>Use one chat for one company. Start a new chat to analyze a different company.</span>
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="rounded-2xl border border-slate-300 bg-white p-2 shadow-[0_10px_35px_rgba(15,23,42,0.10)] transition focus-within:border-slate-400 dark:border-white/15 dark:bg-white/[0.06] dark:shadow-black/30 dark:focus-within:border-white/30"
                >
                    <div className="flex min-h-14 items-center gap-2 pl-3">
                        <input
                            value={value}
                            onChange={(event) => setValue(event.target.value)}
                            placeholder={
                                isFollowUp
                                    ? `Ask a follow-up about ${contextCompany}...`
                                    : variant === "research"
                                    ? "Nvidia"
                                    : "Nvidia, Microsoft"
                            }
                            aria-label={isFollowUp ? `Ask a follow-up about ${contextCompany}` : variant === "research" ? "Research question" : "Companies to compare"}
                            className="min-w-0 flex-1 bg-transparent py-3 text-base font-normal text-slate-950 outline-none placeholder:text-slate-400 dark:text-white"
                        />

                        <button
                            type="submit"
                            disabled={loading || !value.trim()}
                            aria-label={variant === "research" ? "Analyze company" : "Compare companies"}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 dark:disabled:bg-white/10 dark:disabled:text-white/30"
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <ArrowUp className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                </form>

                <p className="mt-3 text-center text-xs text-slate-400">
                    {isFollowUp
                        ? `Questions in this chat stay connected to ${contextCompany}.`
                        : "EquityLens can make mistakes. Review financial data before investing."}
                </p>
            </div>
        </section>
    );
}
