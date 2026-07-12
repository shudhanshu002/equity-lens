"use client";

import {
  AlertTriangle,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  ExternalLink,
  Layers,
  Sparkles,
  TrendingUp,
} from "lucide-react";

type SectorResearchResult = {
  thesis: string;
  keyCompanies: Array<{
    name: string;
    reason: string;
  }>;
  opportunities: string[];
  risks: string[];
  watchlistIdeas: string[];
  dataLimitations: string[];
  sources: Array<{
    title: string;
    summary: string;
    source: string;
    url?: string;
    publishedAt?: string;
  }>;
};

type SectorResearchViewProps = {
  query: string;
  result: SectorResearchResult;
  onSelectCompany: (company: string) => void;
};

export function SectorResearchView({
  query,
  result,
  onSelectCompany,
}: SectorResearchViewProps) {
  return (
    <article className="space-y-8 animate-fade-in">
      <div className="overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/30">
        <div className="p-8 md:p-10">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-5">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-600 dark:text-emerald-300">
                <Layers className="h-4 w-4" />
                Sector Analysis
              </div>

              <h2 className="text-4xl font-black tracking-tight text-slate-950 dark:text-white md:text-5xl">
                {query} Outlook
              </h2>

              <p className="mt-5 text-base leading-8 text-slate-700 dark:text-slate-200">
                {result.thesis}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.02]">
          <h3 className="flex items-center gap-2 text-lg font-black text-slate-950 dark:text-white">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            Key Opportunities
          </h3>
          <ul className="mt-4 space-y-3">
            {result.opportunities?.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-xl bg-slate-50 p-3.5 text-sm font-semibold leading-6 text-slate-700 dark:bg-white/5 dark:text-slate-300"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.02]">
          <h3 className="flex items-center gap-2 text-lg font-black text-slate-950 dark:text-white">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Sector Risks
          </h3>
          <ul className="mt-4 space-y-3">
            {result.risks?.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-xl bg-slate-50 p-3.5 text-sm font-semibold leading-6 text-slate-700 dark:bg-white/5 dark:text-slate-300"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {result.keyCompanies?.length ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.02]">
          <h3 className="text-lg font-black text-slate-950 dark:text-white">
            Major Industry Players
          </h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {result.keyCompanies.map((item) => (
              <div
                key={item.name}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-slate-900/60 dark:hover:bg-slate-900"
              >
                <div>
                  <h4 className="text-base font-black text-slate-950 dark:text-white">
                    {item.name}
                  </h4>
                  <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    {item.reason}
                  </p>
                </div>
                <button
                  onClick={() => onSelectCompany(item.name)}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-black text-emerald-600 transition hover:text-emerald-700 dark:text-emerald-300"
                >
                  Research Player
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {result.watchlistIdeas?.length ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.02]">
          <h3 className="flex items-center gap-2 text-lg font-black text-slate-950 dark:text-white">
            <Bookmark className="h-5 w-5 text-cyan-500" />
            Watchlist Ideas
          </h3>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {result.watchlistIdeas.map((idea) => (
              <button
                key={idea}
                onClick={() => onSelectCompany(idea)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700 transition hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                {idea}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {result.sources?.length ? (
        <section className="border-t border-slate-200 pt-6 dark:border-white/10">
          <h3 className="mb-5 text-lg font-black text-slate-950 dark:text-white">
            Analysis Sources
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {result.sources.slice(0, 6).map((source) => (
              <div
                key={source.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-950"
              >
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-sm font-black leading-5 text-slate-950 dark:text-white">
                    {source.title}
                  </h4>
                  {source.url ? (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 text-slate-400 transition hover:text-emerald-500"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : null}
                </div>
                <p className="mt-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                  {source.source}
                  {source.publishedAt ? ` · ${source.publishedAt}` : ""}
                </p>
                <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-600 dark:text-slate-300">
                  {source.summary}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
