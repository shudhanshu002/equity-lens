import type React from "react";
import {
    ArrowRight,
    BarChart3,
    Brain,
    Building2,
    FileText,
    Search,
    Sparkles,
} from "lucide-react";

type EmptyStateProps = {
    variant: "research" | "compare";
    onPrimaryAction: () => void;
};

const RESEARCH_STEPS = [
    "Resolve company name into stock profile",
    "Collect fundamentals and valuation metrics",
    "Generate investment memo and risk analysis",
];

const COMPARE_STEPS = [
    "Run research workflow for each company",
    "Rank companies using explainable scores",
    "Generate winner summary and tradeoffs",
];

export function EmptyState({
    variant,
    onPrimaryAction,
}: EmptyStateProps) {
    const isResearch = variant === "research";

    return (
        <section className="mb-8 overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/30">
            <div className="grid lg:grid-cols-[1fr_0.8fr]">
                <div className="p-8 md:p-10">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-600 dark:text-cyan-300">
                        <Sparkles className="h-4 w-4" />
                        {isResearch ? "Ready for research" : "Ready for comparison"}
                    </div>

                    <h2 className="max-w-2xl text-4xl font-black tracking-tight text-slate-950 dark:text-white">
                        {isResearch
                            ? "Run your first investment research memo"
                            : "Compare companies and find the strongest candidate"}
                    </h2>

                    <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
                        {isResearch
                            ? "Start with a company like Apple, Microsoft, Nvidia, Amazon, or Netflix. The agent will return a scored investment memo with source traceability."
                            : "Start with examples like Nvidia, Tesla, Netflix or Apple, Microsoft, Amazon. The agent will rank each company and explain the winner."}
                    </p>

                    <button
                        onClick={onPrimaryAction}
                        className="mt-8 inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-4 text-sm font-black text-white shadow-xl shadow-slate-900/20 transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950"
                    >
                        {isResearch ? "Run Demo Research" : "Run Demo Comparison"}
                        <ArrowRight className="h-4 w-4" />
                    </button>

                    <div className="mt-8 grid gap-3">
                        {(isResearch ? RESEARCH_STEPS : COMPARE_STEPS).map(
                            (step, index) => (
                                <ProcessStep key={step} index={index + 1} text={step} />
                            )
                        )}
                    </div>
                </div>

                <div className="relative bg-slate-950 p-8 text-white md:p-10">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.24),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(139,92,246,0.22),_transparent_35%)]" />

                    <div className="relative">
                        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/10">
                            {isResearch ? (
                                <Search className="h-8 w-8 text-cyan-300" />
                            ) : (
                                <BarChart3 className="h-8 w-8 text-cyan-300" />
                            )}
                        </div>

                        <p className="mb-3 text-sm font-black uppercase tracking-[0.3em] text-cyan-300">
                            Empty Workspace
                        </p>

                        <h3 className="text-3xl font-black">
                            {isResearch ? "No report generated yet" : "No comparison yet"}
                        </h3>

                        <p className="mt-4 text-sm leading-7 text-slate-300">
                            {isResearch
                                ? "Once you run the agent, this area will show thesis, decision score, financial metrics, news sentiment, risks, trace logs, and export buttons."
                                : "Once you run comparison, this area will show winner, rankings, score chart, tradeoffs, data quality, and exportable memo."}
                        </p>

                        <div className="mt-8 space-y-3">
                            <PreviewRow
                                icon={<Building2 className="h-4 w-4" />}
                                label={isResearch ? "Suggested input" : "Suggested comparison"}
                                value={isResearch ? "Nvidia" : "Nvidia, Tesla, Netflix"}
                            />

                            <PreviewRow
                                icon={<Brain className="h-4 w-4" />}
                                label="AI provider"
                                value="Gemini"
                            />

                            <PreviewRow
                                icon={<FileText className="h-4 w-4" />}
                                label="Output"
                                value="Markdown memo"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function ProcessStep({ index, text }: { index: number; text: string }) {
    return (
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-slate-950/60">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-950 text-xs font-black text-white dark:bg-white dark:text-slate-950">
                {index}
            </div>

            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {text}
            </p>
        </div>
    );
}

function PreviewRow({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-cyan-300">
                    {icon}
                </div>

                <p className="text-sm font-bold text-slate-300">{label}</p>
            </div>

            <p className="text-xs font-black text-slate-400">{value}</p>
        </div>
    );
}