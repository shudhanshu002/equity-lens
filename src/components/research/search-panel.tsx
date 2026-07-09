"use client";

import type React from "react";
import {
  ArrowRight,
  BarChart3,
  Building2,
  Loader2,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";

type SearchPanelProps = {
  variant: "research" | "compare";
  company: string;
  setCompany: (value: string) => void;
  companies: string;
  setCompanies: (value: string) => void;
  loading: boolean;
  error: string;
  onResearch: () => void;
  onCompare: () => void;
};

const RESEARCH_EXAMPLES = ["Apple", "Microsoft", "Nvidia", "Amazon"];
const COMPARE_EXAMPLES = [
  "Nvidia, Tesla, Netflix",
  "Apple, Microsoft, Amazon",
  "Tesla, Ford, General Motors",
];

export function SearchPanel({
  variant,
  company,
  setCompany,
  companies,
  setCompanies,
  loading,
  error,
  onResearch,
  onCompare,
}: SearchPanelProps) {
  const isResearch = variant === "research";

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isResearch) {
      onResearch();
    } else {
      onCompare();
    }
  }

  return (
    <section className="mb-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/30">
      <div className="grid gap-0 lg:grid-cols-[1fr_0.75fr]">
        <div className="p-6 md:p-8">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-600 dark:text-cyan-300">
            {isResearch ? (
              <Search className="h-4 w-4" />
            ) : (
              <BarChart3 className="h-4 w-4" />
            )}
            {isResearch ? "Single company agent run" : "Multi-company comparison"}
          </div>

          <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">
            {isResearch
              ? "Research one company with an AI analyst workflow"
              : "Compare companies and select the strongest opportunity"}
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            {isResearch
              ? "Enter a company name. The agent resolves the ticker, collects financial data, scores the company, and generates a full investment memo."
              : "Enter 2–3 company names separated by commas. The agent researches each company and produces a ranked comparison with a clear winner."}
          </p>

          <form onSubmit={handleSubmit} className="mt-7">
            <label className="mb-3 block text-sm font-bold text-slate-700 dark:text-slate-200">
              {isResearch ? "Company name" : "Companies to compare"}
            </label>

            <div className="flex flex-col gap-3 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-2 dark:border-white/10 dark:bg-slate-950/70 md:flex-row">
              <div className="flex flex-1 items-center gap-3 px-4">
                {isResearch ? (
                  <Building2 className="h-5 w-5 text-slate-400" />
                ) : (
                  <TrendingUp className="h-5 w-5 text-slate-400" />
                )}

                <input
                  value={isResearch ? company : companies}
                  onChange={(event) =>
                    isResearch
                      ? setCompany(event.target.value)
                      : setCompanies(event.target.value)
                  }
                  placeholder={
                    isResearch
                      ? "Example: Apple"
                      : "Example: Nvidia, Tesla, Netflix"
                  }
                  className="min-h-14 flex-1 bg-transparent text-base font-semibold text-slate-950 outline-none placeholder:text-slate-400 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-[1.25rem] bg-slate-950 px-6 text-sm font-black text-white shadow-xl shadow-slate-900/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-slate-950"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Running
                  </>
                ) : (
                  <>
                    {isResearch ? "Run Research" : "Compare"}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm font-semibold text-red-500 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            {(isResearch ? RESEARCH_EXAMPLES : COMPARE_EXAMPLES).map(
              (example) => (
                <button
                  key={example}
                  onClick={() =>
                    isResearch ? setCompany(example) : setCompanies(example)
                  }
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:border-cyan-400/40 hover:text-cyan-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-cyan-300"
                >
                  {example}
                </button>
              )
            )}
          </div>
        </div>

        <div className="relative border-t border-slate-200 bg-slate-950 p-6 text-white dark:border-white/10 lg:border-l lg:border-t-0 md:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.22),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(139,92,246,0.2),_transparent_35%)]" />

          <div className="relative">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
              <Sparkles className="h-7 w-7 text-cyan-300" />
            </div>

            <h3 className="text-2xl font-black">
              {isResearch ? "What you get" : "Comparison output"}
            </h3>

            <div className="mt-6 space-y-3">
              {isResearch ? (
                <>
                  <SideItem text="Investment decision: Invest, Watchlist, or Pass" />
                  <SideItem text="Score breakdown across 5 categories" />
                  <SideItem text="Bull case, bear case, risks, and thesis" />
                  <SideItem text="Agent trace and source quality warnings" />
                </>
              ) : (
                <>
                  <SideItem text="Winner company with deterministic score" />
                  <SideItem text="Ranked companies with reasoning" />
                  <SideItem text="Tradeoffs across growth, valuation, and risk" />
                  <SideItem text="Exportable comparison memo" />
                </>
              )}
            </div>

            <div className="mt-8 rounded-3xl border border-white/10 bg-white/10 p-5">
              <div className="mb-3 flex items-center gap-2 text-emerald-300">
                <ShieldCheck className="h-5 w-5" />
                <p className="font-bold">Transparent scoring</p>
              </div>

              <p className="text-sm leading-6 text-slate-300">
                The numeric decision score is calculated by code. The LLM
                explains the result, but it does not randomly invent the score.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SideItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="h-2 w-2 rounded-full bg-cyan-300" />
      <p className="text-sm font-semibold text-slate-200">{text}</p>
    </div>
  );
}