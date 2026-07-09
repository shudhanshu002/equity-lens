import {
  Activity,
  BarChart3,
  Brain,
  CheckCircle2,
  Database,
  FileText,
  LineChart,
  ShieldCheck,
  TrendingUp,
  Zap,
} from "lucide-react";

const SCORE_ROWS = [
  {
    label: "Growth",
    value: 94,
  },
  {
    label: "Profitability",
    value: 89,
  },
  {
    label: "Balance Sheet",
    value: 76,
  },
  {
    label: "Valuation",
    value: 71,
  },
  {
    label: "Sentiment",
    value: 83,
  },
];

const TRACE_STEPS = [
  {
    icon: <Database className="h-4 w-4" />,
    label: "Financials fetched",
    status: "Alpha Vantage",
  },
  {
    icon: <Activity className="h-4 w-4" />,
    label: "News analyzed",
    status: "Fallback safe",
  },
  {
    icon: <BarChart3 className="h-4 w-4" />,
    label: "Score calculated",
    status: "88 / 100",
  },
  {
    icon: <Brain className="h-4 w-4" />,
    label: "Memo generated",
    status: "Gemini",
  },
];

export function ResultsPreviewSection() {
  return (
    <section className="py-20">
      <div className="mb-10 max-w-3xl">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-600 dark:text-cyan-300">
          <Zap className="h-4 w-4" />
          Output preview
        </div>

        <h2 className="text-4xl font-black tracking-tight text-slate-950 dark:text-white">
          Research output that looks ready for a real analyst workflow
        </h2>

        <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
          Every report combines a decision, score breakdown, source trace,
          thesis, risks, and exportable memo format.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/30 md:p-8">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="mb-2 text-sm font-black uppercase tracking-[0.3em] text-cyan-500">
                Investment Memo
              </p>

              <h3 className="text-3xl font-black text-slate-950 dark:text-white">
                NVIDIA Corporation
              </h3>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                AI infrastructure · Semiconductors · US Market
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-3 text-emerald-600 dark:text-emerald-300">
              <p className="text-xs font-black uppercase tracking-widest">
                Decision
              </p>
              <p className="mt-1 text-xl font-black">INVEST</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <PreviewMetric
              icon={<TrendingUp className="h-5 w-5" />}
              label="Total Score"
              value="88"
              helper="Strong conviction"
            />

            <PreviewMetric
              icon={<ShieldCheck className="h-5 w-5" />}
              label="Confidence"
              value="82%"
              helper="High data quality"
            />

            <PreviewMetric
              icon={<FileText className="h-5 w-5" />}
              label="Memo"
              value="Gemini"
              helper="Structured output"
            />
          </div>

          <div className="mt-6 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-950/60">
            <div className="mb-3 flex items-center gap-2">
              <Brain className="h-5 w-5 text-violet-500" />
              <h4 className="font-black text-slate-950 dark:text-white">
                Thesis Preview
              </h4>
            </div>

            <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
              NVIDIA screens as the strongest candidate due to exceptional
              growth, durable AI infrastructure demand, high profitability, and
              strong market positioning. Valuation remains the key risk, but the
              company’s quality score supports an INVEST decision.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <MemoCard
              title="Bull Case"
              items={[
                "AI infrastructure demand remains strong",
                "High margins support reinvestment",
                "Strong ecosystem advantage",
              ]}
            />

            <MemoCard
              title="Risk Case"
              items={[
                "Premium valuation may compress",
                "Cyclicality in semiconductor demand",
                "Competition from custom AI chips",
              ]}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/30 md:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.3em] text-emerald-500">
                  Score Engine
                </p>

                <h3 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                  Explainable scoring
                </h3>
              </div>

              <LineChart className="h-6 w-6 text-cyan-500" />
            </div>

            <div className="space-y-4">
              {SCORE_ROWS.map((row) => (
                <div key={row.label}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {row.label}
                    </span>

                    <span className="font-black text-slate-950 dark:text-white">
                      {row.value}
                    </span>
                  </div>

                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                    <div
                      className="h-full rounded-full bg-cyan-400"
                      style={{ width: `${row.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2.5rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-2xl shadow-slate-900/20 dark:border-white/10 md:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-300">
                  Agent Trace
                </p>

                <h3 className="mt-2 text-2xl font-black">
                  Run transparency
                </h3>
              </div>

              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-300">
                COMPLETED
              </span>
            </div>

            <div className="space-y-3">
              {TRACE_STEPS.map((step) => (
                <div
                  key={step.label}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-cyan-300">
                      {step.icon}
                    </div>

                    <p className="text-sm font-bold text-slate-200">
                      {step.label}
                    </p>
                  </div>

                  <p className="text-xs font-black text-slate-400">
                    {step.status}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
              <div className="mb-2 flex items-center gap-2 text-emerald-300">
                <CheckCircle2 className="h-5 w-5" />
                <p className="font-black">Export ready</p>
              </div>

              <p className="text-sm leading-6 text-slate-300">
                The final output can be downloaded or copied as a Markdown
                investment memo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PreviewMetric({
  icon,
  label,
  value,
  helper,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-950/60">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-cyan-600 shadow-sm dark:bg-white/10 dark:text-cyan-300">
        {icon}
      </div>

      <p className="text-xs font-black uppercase tracking-widest text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-black text-slate-950 dark:text-white">
        {value}
      </p>

      <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
        {helper}
      </p>
    </div>
  );
}

function MemoCard({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-950/60">
      <h4 className="mb-4 font-black text-slate-950 dark:text-white">
        {title}
      </h4>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-3">
            <div className="mt-2 h-1.5 w-1.5 rounded-full bg-cyan-400" />
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
              {item}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}