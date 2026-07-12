"use client";

import { Bell, CheckCircle2, Plus } from "lucide-react";
import { useState } from "react";

export function FollowCompanyResultCard({ result }: { result: any }) {
  const [saved, setSaved] = useState(false);
  const company = result?.company;

  if (!company) return null;

  async function saveFollow() {
    const item = {
      symbol: company.symbol,
      name: company.name,
      exchange: company.exchange,
      country: company.country,
      currency: company.currency,
      coverageMode: company.coverageMode,
      followedAt: new Date().toISOString(),
    };

    try {
      const existing = JSON.parse(
        localStorage.getItem("equitylens_followed_companies") ?? "[]"
      );

      const merged = [
        item,
        ...existing.filter(
          (old: any) =>
            `${old.symbol}-${old.exchange}` !== `${item.symbol}-${item.exchange}`
        ),
      ];

      localStorage.setItem(
        "equitylens_followed_companies",
        JSON.stringify(merged)
      );

      setSaved(true);
    } catch {
      setSaved(false);
    }
  }

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-950">
      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">
        <Bell className="h-3.5 w-3.5" />
        Follow company
      </div>

      <h2 className="mt-4 text-2xl font-black text-slate-950 dark:text-white">
        {company.name}
      </h2>

      <p className="mt-2 text-sm font-bold text-slate-500 dark:text-slate-400">
        {company.symbol} · {company.exchange} · {company.country}
      </p>

      <p className="mt-4 text-sm leading-7 text-slate-700 dark:text-slate-200">
        {result.message ??
          "This company is ready to be added to your followed companies list."}
      </p>

      {result.warnings?.length ? (
        <div className="mt-4 rounded-2xl border border-amber-300/40 bg-amber-300/10 p-4">
          {result.warnings.map((warning: string) => (
            <p
              key={warning}
              className="text-sm font-bold text-amber-800 dark:text-amber-100"
            >
              {warning}
            </p>
          ))}
        </div>
      ) : null}

      <button
        onClick={saveFollow}
        className="mt-6 inline-flex h-12 items-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-black text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950"
      >
        {saved ? <CheckCircle2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        {saved ? "Followed" : "Follow company"}
      </button>
    </section>
  );
}
