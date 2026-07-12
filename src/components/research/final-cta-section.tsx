import {
  ArrowRight,
  BarChart3,
  Brain,
  FileText,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { AppTab } from "@/components/research/floating-navbar";

type FinalCtaSectionProps = {
  onTabChange: (tab: AppTab) => void;
};

export function FinalCtaSection({ onTabChange }: FinalCtaSectionProps) {
  return (
    <section className="pb-20 pt-10">
      <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-2xl shadow-slate-900/30 dark:border-white/10 md:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.28),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(139,92,246,0.24),_transparent_35%)]" />

        <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-cyan-300">
              <Sparkles className="h-4 w-4" />
              Ready to run the agent
            </div>

            <h2 className="max-w-3xl text-4xl font-black tracking-tight md:text-6xl">
              Start with one company, then compare the strongest opportunities.
            </h2>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300">
              Run a full research memo for Apple, Microsoft, Nvidia, Tesla, or
              any supported public company. Then use comparison mode to rank
              multiple companies with explainable scoring.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={() => onTabChange("research")}
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-black text-slate-950 shadow-xl shadow-black/20 transition hover:-translate-y-0.5"
              >
                Run Research
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => onTabChange("compare")}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-6 py-4 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-white/15"
              >
                Compare Companies
                <BarChart3 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
                  Suggested Demo
                </p>

                <h3 className="mt-2 text-2xl font-black">
                  Nvidia vs Tesla vs Netflix
                </h3>
              </div>

              <TrendingUp className="h-7 w-7 text-emerald-300" />
            </div>

            <div className="space-y-3">
              <DemoStep
                icon={<Brain className="h-4 w-4" />}
                title="Run Gemini memo"
                value="Structured thesis"
              />

              <DemoStep
                icon={<BarChart3 className="h-4 w-4" />}
                title="Compare scores"
                value="NVDA wins"
              />

              <DemoStep
                icon={<FileText className="h-4 w-4" />}
                title="Export output"
                value="Markdown memo"
              />
            </div>

            <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
              <p className="text-sm font-bold text-emerald-300">
                Best submission demo: show one research run, one comparison run,
                exported memo, and agent trace metadata.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DemoStep({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-cyan-300">
          {icon}
        </div>

        <p className="text-sm font-bold text-slate-200">{title}</p>
      </div>

      <p className="text-xs font-black text-slate-400">{value}</p>
    </div>
  );
}