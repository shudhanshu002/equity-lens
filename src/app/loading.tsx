import {
    Activity,
    BarChart3,
    Brain,
    Database,
    GitBranch,
    ShieldCheck,
    Sparkles,
} from "lucide-react";

const LOADING_STEPS = [
    {
        icon: <GitBranch className="h-4 w-4" />,
        title: "Preparing agent workflow",
        description: "Initializing LangGraph research pipeline",
    },
    {
        icon: <Database className="h-4 w-4" />,
        title: "Connecting data layer",
        description: "Checking financial and news providers",
    },
    {
        icon: <BarChart3 className="h-4 w-4" />,
        title: "Loading score engine",
        description: "Preparing deterministic scoring rules",
    },
    {
        icon: <Brain className="h-4 w-4" />,
        title: "Starting memo engine",
        description: "Preparing Gemini research output",
    },
];

export default function Loading() {
    return (
        <main className="min-h-screen overflow-hidden bg-slate-50 text-slate-950 dark:bg-[#020617] dark:text-white">
            <div className="pointer-events-none fixed inset-0">
                <div className="absolute left-[-10%] top-[-10%] h-[420px] w-[420px] rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-400/10" />
                <div className="absolute right-[-10%] top-[20%] h-[420px] w-[420px] rounded-full bg-violet-400/20 blur-3xl dark:bg-violet-400/10" />
                <div className="absolute bottom-[-20%] left-[30%] h-[420px] w-[420px] rounded-full bg-emerald-400/10 blur-3xl dark:bg-emerald-400/5" />
            </div>

            <section className="relative z-10 flex min-h-screen items-center justify-center px-5 py-10">
                <div className="w-full max-w-5xl overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/30">
                    <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
                        <div className="relative bg-slate-950 p-8 text-white md:p-10">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.26),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(139,92,246,0.24),_transparent_35%)]" />

                            <div className="relative">
                                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/10">
                                    <Activity className="h-8 w-8 animate-pulse text-cyan-300" />
                                </div>

                                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-300">
                                    <Sparkles className="h-4 w-4" />
                                    EquityLens AI
                                </div>

                                <h1 className="text-4xl font-black tracking-tight md:text-5xl">
                                    Loading research workspace
                                </h1>

                                <p className="mt-5 text-sm leading-7 text-slate-300">
                                    Preparing the investment research command center, provider
                                    status, scoring engine, and AI memo workflow.
                                </p>

                                <div className="mt-8 rounded-3xl border border-white/10 bg-white/10 p-5">
                                    <div className="mb-3 flex items-center gap-2 text-emerald-300">
                                        <ShieldCheck className="h-5 w-5" />
                                        <p className="font-black">Transparent by design</p>
                                    </div>

                                    <p className="text-sm leading-6 text-slate-300">
                                        Reports include source metadata, fallback warnings, score
                                        breakdowns, and exportable memo output.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 md:p-10">
                            <p className="mb-2 text-sm font-black uppercase tracking-[0.3em] text-cyan-500">
                                Startup sequence
                            </p>

                            <h2 className="text-3xl font-black text-slate-950 dark:text-white">
                                Preparing product modules
                            </h2>

                            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                                This screen appears while the route is loading.
                            </p>

                            <div className="mt-8 space-y-4">
                                {LOADING_STEPS.map((step, index) => (
                                    <div
                                        key={step.title}
                                        className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-950/60"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-cyan-600 shadow-sm dark:bg-white/10 dark:text-cyan-300">
                                                {step.icon}
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                    <h3 className="font-black text-slate-950 dark:text-white">
                                                        {step.title}
                                                    </h3>

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
                </div>
            </section>
        </main>
    );
}