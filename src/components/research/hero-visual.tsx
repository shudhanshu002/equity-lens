import {
  Activity,
  BarChart3,
  Brain,
  Database,
  GitBranch,
  ShieldCheck,
} from "lucide-react";

export function HeroVisual() {
  return (
    <div className="relative mx-auto flex h-[420px] max-w-xl items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-400/10" />
      <div className="absolute h-72 w-72 rounded-full border border-cyan-400/20" />
      <div className="absolute h-96 w-96 rounded-full border border-violet-400/20" />

      <div className="absolute left-1/2 top-1/2 h-7 w-7 animate-orbit rounded-full border border-cyan-400/30 bg-white p-1 shadow-xl shadow-cyan-500/20 dark:bg-slate-950">
        <Database className="h-full w-full text-cyan-400" />
      </div>

      <div className="absolute left-1/2 top-1/2 h-7 w-7 animate-orbit rounded-full border border-violet-400/30 bg-white p-1 shadow-xl shadow-violet-500/20 dark:bg-slate-950 [animation-delay:-5s]">
        <Brain className="h-full w-full text-violet-400" />
      </div>

      <div className="absolute left-1/2 top-1/2 h-7 w-7 animate-orbit rounded-full border border-emerald-400/30 bg-white p-1 shadow-xl shadow-emerald-500/20 dark:bg-slate-950 [animation-delay:-10s]">
        <ShieldCheck className="h-full w-full text-emerald-400" />
      </div>

      <div className="animate-float-slow relative w-full max-w-md rounded-[2rem] border border-slate-200 bg-white/80 p-5 shadow-2xl shadow-slate-900/20 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/80 dark:shadow-black/50">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-500">
              Live Agent Run
            </p>
            <h3 className="mt-1 text-xl font-black text-slate-950 dark:text-white">
              NVIDIA Research
            </h3>
          </div>

          <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-500">
            INVEST
          </span>
        </div>

        <div className="grid gap-3">
          <HeroStep
            icon={<GitBranch className="h-4 w-4" />}
            label="LangGraph workflow"
            value="5 nodes completed"
          />

          <HeroStep
            icon={<Database className="h-4 w-4" />}
            label="Financial data"
            value="Alpha Vantage"
          />

          <HeroStep
            icon={<Brain className="h-4 w-4" />}
            label="AI memo"
            value="Gemini 2.5 Flash"
          />

          <HeroStep
            icon={<BarChart3 className="h-4 w-4" />}
            label="Score"
            value="88 / 100"
          />
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-950 dark:text-white">
            <Activity className="h-4 w-4 text-cyan-400" />
            Thesis Preview
          </div>

          <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
            Strong AI infrastructure demand, high profitability, and superior
            growth profile make NVDA the strongest candidate in the comparison.
          </p>
        </div>
      </div>
    </div>
  );
}

function HeroStep({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-cyan-500 shadow-sm dark:bg-slate-900">
          {icon}
        </div>
        <span className="text-sm font-semibold">{label}</span>
      </div>

      <span className="text-sm font-black text-slate-950 dark:text-white">
        {value}
      </span>
    </div>
  );
}