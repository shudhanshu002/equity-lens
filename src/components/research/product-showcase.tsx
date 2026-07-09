import {
  ArrowRight,
  BarChart3,
  FileText,
  History,
  LineChart,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { AppTab } from "@/components/research/floating-navbar";

type ProductShowcaseProps = {
  onTabChange: (tab: AppTab) => void;
};

const PRODUCT_AREAS = [
  {
    tab: "research" as AppTab,
    icon: <Search className="h-5 w-5" />,
    title: "Research Workspace",
    description:
      "Run a complete AI analyst workflow for one company with financials, score, thesis, risks, and exportable memo.",
    previewTitle: "Apple Inc.",
    previewBadge: "WATCHLIST",
    previewScore: "61",
    points: ["Financial snapshot", "Bull & bear case", "Agent trace"],
  },
  {
    tab: "compare" as AppTab,
    icon: <BarChart3 className="h-5 w-5" />,
    title: "Comparison Workspace",
    description:
      "Compare 2–3 companies side-by-side and get a ranked investment decision with a clear winner.",
    previewTitle: "NVDA vs TSLA vs NFLX",
    previewBadge: "NVDA WINS",
    previewScore: "88",
    points: ["Ranking", "Tradeoffs", "Score chart"],
  },
  {
    tab: "history" as AppTab,
    icon: <History className="h-5 w-5" />,
    title: "Research History",
    description:
      "Save recent reports locally and reopen previous research without rerunning the whole agent workflow.",
    previewTitle: "Saved Reports",
    previewBadge: "LOCAL",
    previewScore: "8",
    points: ["Reports", "Comparisons", "Quick reopen"],
  },
];

export function ProductShowcase({ onTabChange }: ProductShowcaseProps) {
  return (
    <section className="py-20">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-600 dark:text-cyan-300">
            <Sparkles className="h-4 w-4" />
            Product experience
          </div>

          <h2 className="text-4xl font-black tracking-tight text-slate-950 dark:text-white">
            Three workspaces built for real investment research flow
          </h2>

          <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
            The app is organized like a professional SaaS product, not a single
            form page. Users can research, compare, and reopen past analysis
            from separate focused workspaces.
          </p>
        </div>

        <button
          onClick={() => onTabChange("research")}
          className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-4 text-sm font-black text-white shadow-xl shadow-slate-900/15 transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950"
        >
          Launch Product
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {PRODUCT_AREAS.map((area) => (
          <button
            key={area.title}
            onClick={() => onTabChange(area.tab)}
            className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white text-left shadow-2xl shadow-slate-900/5 transition hover:-translate-y-1 hover:shadow-slate-900/15 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20"
          >
            <div className="p-6">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white transition group-hover:scale-105 dark:bg-white dark:text-slate-950">
                {area.icon}
              </div>

              <h3 className="text-2xl font-black text-slate-950 dark:text-white">
                {area.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                {area.description}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {area.points.map((point) => (
                  <span
                    key={point}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                  >
                    {point}
                  </span>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-950/70">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04]">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">
                      Preview
                    </p>

                    <p className="mt-1 line-clamp-1 font-black text-slate-950 dark:text-white">
                      {area.previewTitle}
                    </p>
                  </div>

                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-600 dark:text-emerald-300">
                    {area.previewBadge}
                  </span>
                </div>

                <div className="grid grid-cols-[auto_1fr] items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 text-2xl font-black text-white dark:bg-white dark:text-slate-950">
                    {area.previewScore}
                  </div>

                  <div>
                    <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                      <LineChart className="h-4 w-4 text-cyan-500" />
                      Research score
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                      <div className="h-full w-3/4 rounded-full bg-cyan-400" />
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <MiniSignal
                    icon={<ShieldCheck className="h-4 w-4" />}
                    label="Traceable"
                  />

                  <MiniSignal
                    icon={<FileText className="h-4 w-4" />}
                    label="Exportable"
                  />
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function MiniSignal({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-300">
      <span className="text-cyan-500">{icon}</span>
      {label}
    </div>
  );
}