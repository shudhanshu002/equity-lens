import {
    Activity,
    BarChart3,
    Brain,
    Database,
    FileSearch,
    GitBranch,
    Newspaper,
    ShieldCheck,
} from "lucide-react";

type LoadingAgentProps = {
    variant: "research" | "compare";
};

const RESEARCH_STEPS = [
    {
        icon: <FileSearch className="h-5 w-5" />,
        title: "Resolving company",
        description: "Matching company name with stock symbol and profile.",
    },
    {
        icon: <Database className="h-5 w-5" />,
        title: "Fetching financials",
        description: "Collecting fundamentals, margins, valuation, and balance indicators.",
    },
    {
        icon: <Newspaper className="h-5 w-5" />,
        title: "Analyzing news",
        description: "Reading market signals and recent sentiment context.",
    },
    {
        icon: <BarChart3 className="h-5 w-5" />,
        title: "Scoring company",
        description: "Running deterministic growth, profitability, valuation, and sentiment scoring.",
    },
    {
        icon: <Brain className="h-5 w-5" />,
        title: "Generating memo",
        description: "Creating thesis, bull case, bear case, risks, and decision triggers.",
    },
];

const COMPARE_STEPS = [
    {
        icon: <GitBranch className="h-5 w-5" />,
        title: "Starting comparison graph",
        description: "Preparing multiple research runs for selected companies.",
    },
    {
        icon: <Database className="h-5 w-5" />,
        title: "Collecting company data",
        description: "Fetching financial and sentiment signals for every company.",
    },
    {
        icon: <BarChart3 className="h-5 w-5" />,
        title: "Ranking companies",
        description: "Comparing scores across growth, profitability, valuation, and risk.",
    },
    {
        icon: <ShieldCheck className="h-5 w-5" />,
        title: "Selecting winner",
        description: "Choosing the strongest company using deterministic score output.",
    },
    {
        icon: <Brain className="h-5 w-5" />,
        title: "Writing comparison memo",
        description: "Generating ranked reasoning and key tradeoffs.",
    },
];

export function LoadingAgent({
    variant,
}: LoadingAgentProps) {
    const isResearch = variant === "research";
    const steps = isResearch ? RESEARCH_STEPS : COMPARE_STEPS;

    return (
        <section className="mb-8 overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/30">
            <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
                <div className="relative bg-slate-950 p-8 text-white md:p-10">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.28),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(139,92,246,0.24),_transparent_35%)]" />

                    <div className="relative">
                        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/10">
                            <Activity className="h-8 w-8 animate-pulse text-cyan-300" />
                        </div>

                        <p className="mb-3 text-sm font-black uppercase tracking-[0.3em] text-cyan-300">
                            Agent Running
                        </p>

                        <h2 className="text-4xl font-black tracking-tight">
                            {isResearch
                                ? "Building investment memo"
                                : "Comparing investment candidates"}
                        </h2>

                        <p className="mt-4 text-sm leading-7 text-slate-300">
                            {isResearch
                                ? "The agent is collecting company data, calculating an explainable score, and generating the final research memo."
                                : "The comparison engine is running research for each company, ranking the outputs, and preparing a winner summary."}
                        </p>

                        <div className="mt-8 rounded-3xl border border-white/10 bg-white/10 p-5">
                            <div className="mb-3 flex items-center gap-2 text-emerald-300">
                                <ShieldCheck className="h-5 w-5" />
                                <p className="font-black">Transparent execution</p>
                            </div>

                            <p className="text-sm leading-6 text-slate-300">
                                After completion, the result will include source metadata,
                                fallback warnings, score breakdown, and exportable memo output.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-8 md:p-10">
                    <div className="mb-8">
                        <p className="mb-2 text-sm font-black uppercase tracking-[0.3em] text-cyan-500">
                            Workflow Progress
                        </p>

                        <h3 className="text-3xl font-black text-slate-950 dark:text-white">
                            {isResearch ? "Research pipeline" : "Comparison pipeline"}
                        </h3>

                        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                            These are the main steps being executed by the backend agent.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {steps.map((step, index) => (
                            <div
                                key={step.title}
                                className="relative rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-950/60"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-cyan-600 shadow-sm dark:bg-white/10 dark:text-cyan-300">
                                        {step.icon}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <h4 className="font-black text-slate-950 dark:text-white">
                                                {step.title}
                                            </h4>

                                            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-black text-cyan-600 dark:text-cyan-300">
                                                STEP {index + 1}
                                            </span>
                                        </div>

                                        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>

                                {index === 0 && (
                                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                                        <div className="h-full w-2/3 animate-pulse rounded-full bg-cyan-400" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}