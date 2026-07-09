import type React from "react";
import {
  BarChart3,
  Brain,
  Clock3,
  Database,
  FileText,
  GitBranch,
  Layers3,
  Scale,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

type WorkspaceOverviewProps = {
  variant: "research" | "compare";
};

const RESEARCH_CARDS = [
  {
    icon: <Database className="h-5 w-5" />,
    label: "Data Collection",
    value: "Financials + News",
    description: "Collects company profile, fundamentals, valuation, and sentiment signals.",
  },
  {
    icon: <Scale className="h-5 w-5" />,
    label: "Decision Model",
    value: "Explainable Score",
    description: "Uses rule-based scoring before the AI memo is generated.",
  },
  {
    icon: <FileText className="h-5 w-5" />,
    label: "Research Output",
    value: "Exportable Memo",
    description: "Generates thesis, bull case, bear case, risks, and decision triggers.",
  },
];

const COMPARE_CARDS = [
  {
    icon: <Layers3 className="h-5 w-5" />,
    label: "Multi-Agent Runs",
    value: "2–3 Companies",
    description: "Runs the full research workflow for each selected company.",
  },
  {
    icon: <TrendingUp className="h-5 w-5" />,
    label: "Winner Selection",
    value: "Ranked Output",
    description: "Ranks companies using deterministic scores and AI reasoning.",
  },
  {
    icon: <BarChart3 className="h-5 w-5" />,
    label: "Comparison View",
    value: "Score Chart",
    description: "Shows side-by-side score breakdown and key tradeoffs.",
  },
];

export function WorkspaceOverview({ variant }: WorkspaceOverviewProps) {
  const isResearch = variant === "research";
  const cards = isResearch ? RESEARCH_CARDS : COMPARE_CARDS;

  return (
    <section className="mb-8 grid gap-5 lg:grid-cols-[1fr_0.75fr]">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20 md:p-7">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-600 dark:text-cyan-300">
              <GitBranch className="h-4 w-4" />
              {isResearch ? "Single-company workflow" : "Comparison workflow"}
            </div>

            <h2 className="text-2xl font-black text-slate-950 dark:text-white">
              {isResearch
                ? "Run a complete analyst workflow for one company"
                : "Rank companies with repeatable investment logic"}
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              {isResearch
                ? "The agent resolves the company, collects data, calculates an explainable score, and generates a professional investment memo."
                : "The comparison engine runs research for each company, ranks them, explains tradeoffs, and selects the strongest opportunity."}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-emerald-600 dark:text-emerald-300">
            <div className="flex items-center gap-2 text-sm font-black">
              <ShieldCheck className="h-5 w-5" />
              Traceable
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {cards.map((card) => (
            <OverviewCard
              key={card.label}
              icon={card.icon}
              label={card.label}
              value={card.value}
              description={card.description}
            />
          ))}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-xl shadow-slate-900/20 dark:border-white/10 md:p-7">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.24),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(139,92,246,0.22),_transparent_35%)]" />

        <div className="relative">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
            <Brain className="h-7 w-7 text-violet-300" />
          </div>

          <p className="mb-2 text-sm font-black uppercase tracking-[0.3em] text-cyan-300">
            Agent Mode
          </p>

          <h3 className="text-2xl font-black">
            {isResearch ? "Research Memo Generator" : "Investment Comparator"}
          </h3>

          <p className="mt-3 text-sm leading-6 text-slate-300">
            {isResearch
              ? "Best demo input: Apple, Microsoft, Nvidia, Amazon, or Netflix."
              : "Best demo input: Nvidia, Tesla, Netflix to show Invest, Pass, and Watchlist outcomes."}
          </p>

          <div className="mt-6 grid gap-3">
            <StatusRow
              icon={<Clock3 className="h-4 w-4" />}
              label="Execution"
              value="Real-time API run"
            />

            <StatusRow
              icon={<FileText className="h-4 w-4" />}
              label="Output"
              value="Markdown export"
            />

            <StatusRow
              icon={<ShieldCheck className="h-4 w-4" />}
              label="Safety"
              value="Warnings included"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function OverviewCard({
  icon,
  label,
  value,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-950/60">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-cyan-600 shadow-sm dark:bg-white/10 dark:text-cyan-300">
        {icon}
      </div>

      <p className="text-xs font-black uppercase tracking-widest text-slate-500">
        {label}
      </p>

      <h3 className="mt-2 font-black text-slate-950 dark:text-white">
        {value}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}

function StatusRow({
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