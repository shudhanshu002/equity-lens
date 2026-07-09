import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Brain,
  Database,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

const MARKET_SIGNALS = [
  {
    icon: <TrendingUp className="h-4 w-4" />,
    label: "NVDA",
    value: "INVEST",
    meta: "Score 88",
    tone: "text-emerald-500",
  },
  {
    icon: <BarChart3 className="h-4 w-4" />,
    label: "MSFT",
    value: "WATCHLIST",
    meta: "Score 65",
    tone: "text-amber-500",
  },
  {
    icon: <Activity className="h-4 w-4" />,
    label: "TSLA",
    value: "PASS",
    meta: "Score 47",
    tone: "text-red-500",
  },
  {
    icon: <Database className="h-4 w-4" />,
    label: "Data Layer",
    value: "Alpha Vantage",
    meta: "Financials",
    tone: "text-cyan-500",
  },
  {
    icon: <Brain className="h-4 w-4" />,
    label: "AI Memo",
    value: "Gemini",
    meta: "Structured",
    tone: "text-violet-500",
  },
  {
    icon: <ShieldCheck className="h-4 w-4" />,
    label: "Scoring",
    value: "Deterministic",
    meta: "Explainable",
    tone: "text-emerald-500",
  },
];

export function MarketIntelligenceStrip() {
  const repeatedSignals = [...MARKET_SIGNALS, ...MARKET_SIGNALS];

  return (
    <section className="py-8">
      <style>
        {`
          @keyframes equitylens-marquee {
            from {
              transform: translateX(0);
            }
            to {
              transform: translateX(-50%);
            }
          }

          .equitylens-marquee {
            animation: equitylens-marquee 28s linear infinite;
          }

          .equitylens-marquee:hover {
            animation-play-state: paused;
          }
        `}
      </style>

      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white/80 p-3 shadow-xl shadow-slate-900/5 backdrop-blur dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20">
        <div className="mb-3 flex items-center justify-between px-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">
              Live product signals
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-cyan-600 dark:text-cyan-300">
            Agent-ready workflow
            <ArrowUpRight className="h-3.5 w-3.5" />
          </div>
        </div>

        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-20 bg-gradient-to-r from-white to-transparent dark:from-[#050b18]" />
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-20 bg-gradient-to-l from-white to-transparent dark:from-[#050b18]" />

          <div className="equitylens-marquee flex w-max gap-3">
            {repeatedSignals.map((signal, index) => (
              <div
                key={`${signal.label}-${index}`}
                className="flex min-w-[250px] items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-slate-950/70"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-white/10 ${signal.tone}`}
                  >
                    {signal.icon}
                  </div>

                  <div>
                    <p className="text-sm font-black text-slate-950 dark:text-white">
                      {signal.label}
                    </p>

                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {signal.meta}
                    </p>
                  </div>
                </div>

                <span className={`text-xs font-black ${signal.tone}`}>
                  {signal.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}