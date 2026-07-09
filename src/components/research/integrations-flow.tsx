import {
  ArrowRight,
  Brain,
  Database,
  FileSearch,
  GitBranch,
  Newspaper,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const PIPELINE = [
  {
    icon: <FileSearch className="h-5 w-5" />,
    title: "Company Resolver",
    description: "Converts user input into a stock symbol and company profile.",
  },
  {
    icon: <Database className="h-5 w-5" />,
    title: "Financial Data",
    description: "Collects fundamentals, margins, valuation, and risk metrics.",
  },
  {
    icon: <Newspaper className="h-5 w-5" />,
    title: "News Signals",
    description: "Reads recent headlines and classifies market sentiment.",
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "Score Engine",
    description: "Runs deterministic scoring before the memo is generated.",
  },
  {
    icon: <Brain className="h-5 w-5" />,
    title: "AI Memo",
    description: "Gemini writes the thesis, risks, bull case, and bear case.",
  },
];

const PROVIDERS = [
  {
    name: "LangGraph.js",
    role: "Agent workflow",
    tone: "text-cyan-500 border-cyan-400/20 bg-cyan-400/10",
  },
  {
    name: "Gemini",
    role: "Memo generation",
    tone: "text-violet-500 border-violet-400/20 bg-violet-400/10",
  },
  {
    name: "Alpha Vantage",
    role: "Financial data",
    tone: "text-emerald-500 border-emerald-400/20 bg-emerald-400/10",
  },
  {
    name: "Finnhub",
    role: "News provider",
    tone: "text-amber-500 border-amber-400/20 bg-amber-400/10",
  },
];

export function IntegrationsFlow() {
  return (
    <section className="py-20">
      <div className="mb-10 max-w-3xl">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-sm font-bold text-violet-600 dark:text-violet-300">
          <GitBranch className="h-4 w-4" />
          Connected research workflow
        </div>

        <h2 className="text-4xl font-black tracking-tight text-slate-950 dark:text-white">
          Built as an agentic SaaS workflow, not a simple chatbot
        </h2>

        <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
          EquityLens separates data collection, scoring, reasoning, and export.
          This makes the output easier to inspect, trust, and explain during
          project evaluation.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.78fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/30 md:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-500">
                Pipeline
              </p>

              <h3 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                Agent execution path
              </h3>
            </div>

            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-black text-emerald-600 dark:text-emerald-300">
              Traceable
            </span>
          </div>

          <div className="space-y-4">
            {PIPELINE.map((step, index) => (
              <div
                key={step.title}
                className="group relative rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:border-cyan-400/40 hover:bg-white dark:border-white/10 dark:bg-slate-950/60 dark:hover:bg-white/[0.06]"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-900/15 dark:bg-white dark:text-slate-950">
                    {step.icon}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h4 className="font-black text-slate-950 dark:text-white">
                        {step.title}
                      </h4>

                      <span className="font-mono text-xs font-bold text-slate-400">
                        NODE_0{index + 1}
                      </span>
                    </div>

                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                      {step.description}
                    </p>
                  </div>
                </div>

                {index < PIPELINE.length - 1 && (
                  <div className="absolute -bottom-5 left-11 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 dark:border-white/10 dark:bg-slate-950">
                    <ArrowRight className="h-3.5 w-3.5 rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-2xl shadow-slate-900/20 dark:border-white/10 md:p-8">
            <div className="absolute" />

            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
              <Sparkles className="h-7 w-7 text-cyan-300" />
            </div>

            <p className="mb-2 text-sm font-black uppercase tracking-[0.3em] text-cyan-300">
              Provider Stack
            </p>

            <h3 className="text-2xl font-black">
              Real APIs with safe fallbacks
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-300">
              The app uses real financial and LLM services, but still remains
              demo-safe by showing fallback usage directly in metadata.
            </p>

            <div className="mt-6 grid gap-3">
              {PROVIDERS.map((provider) => (
                <div
                  key={provider.name}
                  className={`rounded-2xl border px-4 py-3 ${provider.tone}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-black">{provider.name}</p>
                      <p className="mt-1 text-xs opacity-80">
                        {provider.role}
                      </p>
                    </div>

                    <div className="h-2.5 w-2.5 rounded-full bg-current" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04]">
            <p className="text-sm font-black uppercase tracking-[0.3em] text-emerald-500">
              Why this matters
            </p>

            <h3 className="mt-3 text-2xl font-black text-slate-950 dark:text-white">
              Reviewers can inspect every decision
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
              Each report includes agent trace steps, source names, memo
              provider, mock usage, missing-field warnings, and final scoring
              breakdown.
            </p>

            <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm font-bold text-emerald-600 dark:text-emerald-300">
              Transparent output is stronger than a black-box AI answer.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}