import type React from "react";
import {
    AlertTriangle,
    BarChart3,
    Brain,
    CheckCircle2,
    Database,
    FileText,
    GitBranch,
    Newspaper,
    Scale,
    ShieldCheck,
} from "lucide-react";

const SCORE_WEIGHTS = [
    {
        label: "Growth",
        weight: 25,
        description: "Revenue expansion and business momentum.",
    },
    {
        label: "Profitability",
        weight: 20,
        description: "Margins, return on equity, and operating quality.",
    },
    {
        label: "Balance Sheet",
        weight: 20,
        description: "Debt, liquidity, and cash-flow signal strength.",
    },
    {
        label: "Valuation",
        weight: 20,
        description: "P/E, forward P/E, PEG, and price-to-sales risk.",
    },
    {
        label: "Sentiment",
        weight: 15,
        description: "News tone and market signal quality.",
    },
];

const DECISION_RULES = [
    {
        decision: "INVEST",
        range: "75–100",
        description: "Strong score with attractive quality and risk profile.",
        tone: "border-emerald-400/20 bg-emerald-400/10 text-emerald-600 dark:text-emerald-300",
    },
    {
        decision: "WATCHLIST",
        range: "55–74",
        description: "Promising company, but needs better price, data, or risk clarity.",
        tone: "border-amber-400/20 bg-amber-400/10 text-amber-600 dark:text-amber-300",
    },
    {
        decision: "PASS",
        range: "0–54",
        description: "Weak score, unattractive risk/reward, or insufficient conviction.",
        tone: "border-red-400/20 bg-red-400/10 text-red-600 dark:text-red-300",
    },
];

export function MethodologySection() {
    return (
        <section className="py-20">
            <div className="mb-10 max-w-3xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-sm font-bold text-violet-600 dark:text-violet-300">
                    <Scale className="h-4 w-4" />
                    Scoring methodology
                </div>

                <h2 className="text-4xl font-black tracking-tight text-slate-950 dark:text-white">
                    Transparent investment scoring before AI reasoning
                </h2>

                <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                    EquityLens does not ask an LLM to randomly choose a stock. The system
                    first calculates a deterministic score, then uses Gemini to explain
                    the result in a structured investment memo.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/30 md:p-8">
                    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="mb-2 text-sm font-black uppercase tracking-[0.3em] text-cyan-500">
                                Score model
                            </p>

                            <h3 className="text-3xl font-black text-slate-950 dark:text-white">
                                Five weighted signals
                            </h3>
                        </div>

                        <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-black text-cyan-600 dark:text-cyan-300">
                            Total = 100
                        </span>
                    </div>

                    <div className="space-y-5">
                        {SCORE_WEIGHTS.map((item) => (
                            <div
                                key={item.label}
                                className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-950/60"
                            >
                                <div className="mb-3 flex items-center justify-between gap-4">
                                    <div>
                                        <h4 className="font-black text-slate-950 dark:text-white">
                                            {item.label}
                                        </h4>

                                        <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                                            {item.description}
                                        </p>
                                    </div>

                                    <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-black text-cyan-600 dark:text-cyan-300">
                                        {item.weight}%
                                    </span>
                                </div>

                                <div className="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                                    <div
                                        className="h-full rounded-full bg-cyan-400"
                                        style={{ width: `${item.weight * 4}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-2xl shadow-slate-900/20 dark:border-white/10 md:p-8">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.25),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(139,92,246,0.22),_transparent_35%)]" />

                        <div className="relative">
                            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                                <GitBranch className="h-7 w-7 text-cyan-300" />
                            </div>

                            <p className="mb-2 text-sm font-black uppercase tracking-[0.3em] text-cyan-300">
                                Agent layers
                            </p>

                            <h3 className="text-3xl font-black">
                                Data, score, then memo
                            </h3>

                            <p className="mt-4 text-sm leading-7 text-slate-300">
                                The agent separates responsibilities so the output is easier to
                                debug, explain, and trust during evaluation.
                            </p>

                            <div className="mt-6 grid gap-3">
                                <LayerRow
                                    icon={<Database className="h-4 w-4" />}
                                    label="Data layer"
                                    value="Financials + News"
                                />

                                <LayerRow
                                    icon={<BarChart3 className="h-4 w-4" />}
                                    label="Scoring layer"
                                    value="TypeScript rules"
                                />

                                <LayerRow
                                    icon={<Brain className="h-4 w-4" />}
                                    label="Memo layer"
                                    value="Gemini reasoning"
                                />

                                <LayerRow
                                    icon={<FileText className="h-4 w-4" />}
                                    label="Output layer"
                                    value="Exportable memo"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20 md:p-8">
                        <div className="mb-6 flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-emerald-500" />
                            <h3 className="text-2xl font-black text-slate-950 dark:text-white">
                                Decision thresholds
                            </h3>
                        </div>

                        <div className="space-y-4">
                            {DECISION_RULES.map((rule) => (
                                <div
                                    key={rule.decision}
                                    className={`rounded-[1.5rem] border p-5 ${rule.tone}`}
                                >
                                    <div className="mb-2 flex items-center justify-between gap-4">
                                        <p className="font-black">{rule.decision}</p>
                                        <p className="font-mono text-sm font-black">{rule.range}</p>
                                    </div>

                                    <p className="text-sm leading-6 opacity-90">
                                        {rule.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-3">
                <MethodNote
                    icon={<Newspaper className="h-5 w-5" />}
                    title="News sentiment is supporting data"
                    description="News sentiment contributes to the score, but it does not overpower financial quality."
                />

                <MethodNote
                    icon={<AlertTriangle className="h-5 w-5" />}
                    title="Missing fields are treated safely"
                    description="Unavailable metrics are treated as unknown, not automatically positive or negative."
                />

                <MethodNote
                    icon={<CheckCircle2 className="h-5 w-5" />}
                    title="Every result is explainable"
                    description="Reports include source metadata, fallback notes, warnings, trace steps, and score breakdown."
                />
            </div>
        </section>
    );
}

function LayerRow({
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

function MethodNote({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-cyan-600 dark:bg-white/10 dark:text-cyan-300">
                {icon}
            </div>

            <h3 className="font-black text-slate-950 dark:text-white">{title}</h3>

            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                {description}
            </p>
        </div>
    );
}