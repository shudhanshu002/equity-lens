import {
    ArrowRight,
    BarChart3,
    Building2,
    CheckCircle2,
    LineChart,
    PlayCircle,
    Sparkles,
    TrendingUp,
} from "lucide-react";
import { AppTab } from "@/components/research/floating-navbar";

type DemoScenariosSectionProps = {
    onTabChange: (tab: AppTab) => void;
    onPickResearch: (company: string) => void;
    onPickCompare: (companies: string) => void;
};

const RESEARCH_DEMOS = [
    {
        company: "Apple",
        decision: "WATCHLIST",
        reason: "Strong profitability but valuation and missing fields may reduce conviction.",
    },
    {
        company: "Microsoft",
        decision: "WATCHLIST",
        reason: "High-quality business with strong margins, but valuation discipline matters.",
    },
    {
        company: "Nvidia",
        decision: "INVEST",
        reason: "Strong AI infrastructure growth, profitability, and market leadership.",
    },
];

const COMPARISON_DEMOS = [
    {
        companies: "Nvidia, Tesla, Netflix",
        winner: "Nvidia",
        reason: "Best demo because it usually shows INVEST, PASS, and WATCHLIST outcomes together.",
    },
    {
        companies: "Apple, Microsoft, Amazon",
        winner: "Microsoft",
        reason: "Good big-tech comparison with strong business quality and valuation tradeoffs.",
    },
];

export function DemoScenariosSection({
    onTabChange,
    onPickResearch,
    onPickCompare,
}: DemoScenariosSectionProps) {
    return (
        <section className="py-20">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
                <div className="max-w-3xl">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-600 dark:text-cyan-300">
                        <PlayCircle className="h-4 w-4" />
                        Demo scenarios
                    </div>

                    <h2 className="text-4xl font-black tracking-tight text-slate-950 dark:text-white">
                        Run these examples during submission review
                    </h2>

                    <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        These scenarios are designed to quickly demonstrate the agent,
                        scoring model, comparison workflow, export feature, and data-quality
                        transparency.
                    </p>
                </div>

                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-4 text-emerald-600 dark:text-emerald-300">
                    <div className="flex items-center gap-2 text-sm font-black">
                        <CheckCircle2 className="h-5 w-5" />
                        Reviewer-friendly demos
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
                <div className="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/30 md:p-8">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                            <Building2 className="h-5 w-5" />
                        </div>

                        <div>
                            <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-500">
                                Single Research
                            </p>

                            <h3 className="text-2xl font-black text-slate-950 dark:text-white">
                                Best one-company demos
                            </h3>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        {RESEARCH_DEMOS.map((demo) => (
                            <button
                                key={demo.company}
                                onClick={() => {
                                    onPickResearch(demo.company);
                                    onTabChange("research");
                                }}
                                className="group rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 text-left transition hover:-translate-y-0.5 hover:border-cyan-400/40 hover:bg-white dark:border-white/10 dark:bg-slate-950/60 dark:hover:bg-white/[0.06]"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div>
                                        <h4 className="text-xl font-black text-slate-950 dark:text-white">
                                            {demo.company}
                                        </h4>

                                        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                                            {demo.reason}
                                        </p>
                                    </div>

                                    <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-black text-amber-600 dark:text-amber-300">
                                        {demo.decision}
                                    </span>
                                </div>

                                <div className="mt-4 inline-flex items-center gap-2 text-sm font-black text-cyan-600 dark:text-cyan-300">
                                    Open in Research tab
                                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="rounded-[2.5rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-2xl shadow-slate-900/20 dark:border-white/10 md:p-8">
                        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                            <BarChart3 className="h-7 w-7 text-cyan-300" />
                        </div>

                        <p className="mb-2 text-sm font-black uppercase tracking-[0.3em] text-cyan-300">
                            Comparison demos
                        </p>

                        <h3 className="text-2xl font-black">
                            Show ranking and winner selection
                        </h3>

                        <div className="mt-6 space-y-4">
                            {COMPARISON_DEMOS.map((demo) => (
                                <button
                                    key={demo.companies}
                                    onClick={() => {
                                        onPickCompare(demo.companies);
                                        onTabChange("compare");
                                    }}
                                    className="group w-full rounded-[1.5rem] border border-white/10 bg-white/5 p-5 text-left transition hover:bg-white/10"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div>
                                            <h4 className="font-black text-white">
                                                {demo.companies}
                                            </h4>

                                            <p className="mt-2 text-sm leading-6 text-slate-300">
                                                {demo.reason}
                                            </p>
                                        </div>

                                        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-300">
                                            Winner: {demo.winner}
                                        </span>
                                    </div>

                                    <div className="mt-4 inline-flex items-center gap-2 text-sm font-black text-cyan-300">
                                        Open in Compare tab
                                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04]">
                        <div className="mb-4 flex items-center gap-2 text-violet-500">
                            <Sparkles className="h-5 w-5" />
                            <h3 className="font-black text-slate-950 dark:text-white">
                                Suggested demo flow
                            </h3>
                        </div>

                        <div className="space-y-3">
                            <DemoFlowStep
                                icon={<TrendingUp className="h-4 w-4" />}
                                text="Run Nvidia single-company research"
                            />

                            <DemoFlowStep
                                icon={<LineChart className="h-4 w-4" />}
                                text="Run Nvidia, Tesla, Netflix comparison"
                            />

                            <DemoFlowStep
                                icon={<CheckCircle2 className="h-4 w-4" />}
                                text="Show score chart, agent trace, warnings, and export"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function DemoFlowStep({
    icon,
    text,
}: {
    icon: React.ReactNode;
    text: string;
}) {
    return (
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-slate-950/60">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-cyan-600 shadow-sm dark:bg-white/10 dark:text-cyan-300">
                {icon}
            </div>

            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {text}
            </p>
        </div>
    );
}