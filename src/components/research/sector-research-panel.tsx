"use client";

import { ExternalLink, Factory, ShieldAlert, Sparkles, TrendingUp } from "lucide-react";

export function SectorResearchPanel({ result }: { result: any }) {
  if (!result) return null;

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-950">
      <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-400/10 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-purple-700 dark:text-purple-300">
        <Factory className="h-3.5 w-3.5" />
        Sector / Theme Research
      </div>

      <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950 dark:text-white">
        Sector Outlook
      </h2>

      <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-200">
        {result.thesis ?? "No thesis available."}
      </p>

      {result.keyCompanies?.length ? (
        <div className="mt-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <h3 className="text-lg font-black text-slate-950 dark:text-white">
              Key companies
            </h3>
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            {result.keyCompanies.map((item: any) => (
              <div
                key={item.name}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5"
              >
                <p className="font-black text-slate-950 dark:text-white">
                  {item.name}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {item.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <InfoList
          title="Opportunities"
          icon={<TrendingUp className="h-5 w-5 text-emerald-500" />}
          items={result.opportunities}
        />

        <InfoList
          title="Risks"
          icon={<ShieldAlert className="h-5 w-5 text-red-500" />}
          items={result.risks}
        />
      </div>

      {result.watchlistIdeas?.length ? (
        <div className="mt-6 rounded-2xl border border-cyan-300/30 bg-cyan-300/10 p-5">
          <p className="font-black text-cyan-800 dark:text-cyan-200">
            Watchlist ideas
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {result.watchlistIdeas.map((idea: string) => (
              <span
                key={idea}
                className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700 dark:bg-slate-950 dark:text-slate-200"
              >
                {idea}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {result.sources?.length ? (
        <div className="mt-6">
          <p className="font-black text-slate-950 dark:text-white">
            Sources used
          </p>

          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            {result.sources.slice(0, 8).map((source: any) => (
              <div
                key={`${source.headline || source.title}-${source.source}`}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-black text-slate-950 dark:text-white font-sans leading-5">
                    {source.headline || source.title}
                  </p>

                  {source.url ? (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 text-slate-400 transition hover:text-purple-500"
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
        </div>
      ) : null}
    </section>
  );
}

function InfoList({
  title,
  icon,
  items,
}: {
  title: string;
  icon: React.ReactNode;
  items?: string[];
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center gap-2">
        {icon}
        <p className="font-black text-slate-950 dark:text-white">{title}</p>
      </div>

      {items?.length ? (
        <ul className="mt-4 space-y-2">
          {items.map((item) => (
            <li
              key={item}
              className="rounded-xl bg-white px-4 py-3 text-sm font-semibold leading-6 text-slate-700 dark:bg-slate-950 dark:text-slate-200"
            >
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          No items available.
        </p>
      )}
    </div>
  );
}
