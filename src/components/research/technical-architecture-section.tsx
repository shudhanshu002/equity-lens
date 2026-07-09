import {
    AppWindow,
    ArrowRight,
    Brain,
    Code2,
    Database,
    FileJson,
    KeyRound,
    Server,
    ShieldCheck,
    Workflow,
} from "lucide-react";

const ARCHITECTURE_LAYERS = [
    {
        icon: <AppWindow className="h-5 w-5" />,
        title: "Frontend Layer",
        stack: "Next.js + React + Tailwind",
        description:
            "Professional SaaS interface with landing page, research workspace, compare workspace, history, theme toggle, and command palette.",
    },
    {
        icon: <Server className="h-5 w-5" />,
        title: "API Layer",
        stack: "Next.js API Routes",
        description:
            "Backend endpoints handle research, comparison, health checks, validation, and structured JSON responses.",
    },
    {
        icon: <Workflow className="h-5 w-5" />,
        title: "Agent Layer",
        stack: "LangGraph.js",
        description:
            "Stateful workflow executes company resolution, financial fetch, news fetch, scoring, and memo generation nodes.",
    },
    {
        icon: <Brain className="h-5 w-5" />,
        title: "AI Reasoning Layer",
        stack: "Gemini",
        description:
            "Generates structured investment memos after the deterministic score and decision are already calculated.",
    },
];

const ENDPOINTS = [
    {
        method: "GET",
        path: "/api/health",
        description: "Checks provider configuration and backend readiness.",
    },
    {
        method: "POST",
        path: "/api/research",
        description: "Runs a single-company investment research workflow.",
    },
    {
        method: "POST",
        path: "/api/compare",
        description: "Runs multi-company comparison and winner selection.",
    },
];

const ENV_VARS = [
    "ALPHA_VANTAGE_API_KEY",
    "GOOGLE_API_KEY",
    "GOOGLE_MODEL",
    "FINNHUB_API_KEY",
];

export function TechnicalArchitectureSection() {
    return (
        <section className="py-20">
            <div className="mb-10 max-w-3xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-600 dark:text-cyan-300">
                    <Code2 className="h-4 w-4" />
                    Technical architecture
                </div>

                <h2 className="text-4xl font-black tracking-tight text-slate-950 dark:text-white">
                    Built as a full-stack AI product architecture
                </h2>

                <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                    EquityLens AI separates UI, API routes, agent workflow, scoring logic,
                    data providers, and LLM memo generation into clean layers.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
                <div className="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/30 md:p-8">
                    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="mb-2 text-sm font-black uppercase tracking-[0.3em] text-cyan-500">
                                System layers
                            </p>

                            <h3 className="text-3xl font-black text-slate-950 dark:text-white">
                                Clean separation of responsibilities
                            </h3>
                        </div>

                        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-black text-emerald-600 dark:text-emerald-300">
                            Production-style structure
                        </span>
                    </div>

                    <div className="space-y-5">
                        {ARCHITECTURE_LAYERS.map((layer, index) => (
                            <div
                                key={layer.title}
                                className="relative rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-950/60"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-cyan-600 shadow-sm dark:bg-white/10 dark:text-cyan-300">
                                        {layer.icon}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div>
                                                <h4 className="font-black text-slate-950 dark:text-white">
                                                    {layer.title}
                                                </h4>

                                                <p className="mt-1 text-sm font-bold text-cyan-600 dark:text-cyan-300">
                                                    {layer.stack}
                                                </p>
                                            </div>

                                            <span className="font-mono text-xs font-black text-slate-400">
                                                LAYER_0{index + 1}
                                            </span>
                                        </div>

                                        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                                            {layer.description}
                                        </p>
                                    </div>
                                </div>

                                {index < ARCHITECTURE_LAYERS.length - 1 && (
                                    <div className="absolute -bottom-5 left-11 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 dark:border-white/10 dark:bg-slate-950">
                                        <ArrowRight className="h-3.5 w-3.5 rotate-90" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-2xl shadow-slate-900/20 dark:border-white/10 md:p-8">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.25),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(139,92,246,0.22),_transparent_35%)]" />

                        <div className="relative">
                            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                                <FileJson className="h-7 w-7 text-cyan-300" />
                            </div>

                            <p className="mb-2 text-sm font-black uppercase tracking-[0.3em] text-cyan-300">
                                API surface
                            </p>

                            <h3 className="text-3xl font-black">Three core endpoints</h3>

                            <div className="mt-6 space-y-3">
                                {ENDPOINTS.map((endpoint) => (
                                    <div
                                        key={endpoint.path}
                                        className="rounded-2xl border border-white/10 bg-white/5 p-4"
                                    >
                                        <div className="mb-2 flex items-center gap-3">
                                            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 font-mono text-xs font-black text-cyan-300">
                                                {endpoint.method}
                                            </span>

                                            <code className="font-mono text-sm font-black text-white">
                                                {endpoint.path}
                                            </code>
                                        </div>

                                        <p className="text-sm leading-6 text-slate-300">
                                            {endpoint.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20 md:p-8">
                        <div className="mb-6 flex items-center gap-2">
                            <KeyRound className="h-5 w-5 text-amber-500" />
                            <h3 className="text-2xl font-black text-slate-950 dark:text-white">
                                Environment configuration
                            </h3>
                        </div>

                        <div className="space-y-3">
                            {ENV_VARS.map((envVar) => (
                                <div
                                    key={envVar}
                                    className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-slate-950/60"
                                >
                                    <code className="font-mono text-sm font-black text-slate-700 dark:text-slate-200">
                                        {envVar}
                                    </code>

                                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                </div>
                            ))}
                        </div>

                        <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
                            <p className="text-sm font-bold leading-6 text-amber-700 dark:text-amber-300">
                                Never commit `.env.local`. Use `.env.example` for submission.
                            </p>
                        </div>
                    </div>

                    <div className="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20 md:p-8">
                        <div className="mb-6 flex items-center gap-2">
                            <Database className="h-5 w-5 text-emerald-500" />
                            <h3 className="text-2xl font-black text-slate-950 dark:text-white">
                                Data handling
                            </h3>
                        </div>

                        <p className="text-sm leading-7 text-slate-600 dark:text-slate-400">
                            Alpha Vantage provides financial data. Finnhub can provide news
                            when configured. Safe fallback behavior keeps demos reliable while
                            metadata clearly shows what sources were used.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}