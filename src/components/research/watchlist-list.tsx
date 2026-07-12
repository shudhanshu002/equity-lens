"use client";

import { useEffect, useState } from "react";
import { Bell, Trash2 } from "lucide-react";

export function LocalFollowedCompanies() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    load();
  }, []);

  function load() {
    try {
      setItems(
        JSON.parse(localStorage.getItem("equitylens_followed_companies") ?? "[]")
      );
    } catch {
      setItems([]);
    }
  }

  function remove(item: any) {
    const next = items.filter(
      (old) => `${old.symbol}-${old.exchange}` !== `${item.symbol}-${item.exchange}`
    );

    localStorage.setItem("equitylens_followed_companies", JSON.stringify(next));
    setItems(next);
  }

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-950">
      <div className="flex items-center gap-3">
        <Bell className="h-5 w-5 text-emerald-500" />
        <h2 className="text-2xl font-black text-slate-950 dark:text-white">
          Followed companies
        </h2>
      </div>

      {items.length ? (
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {items.map((item) => (
            <div
              key={`${item.symbol}-${item.exchange}`}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-black text-slate-950 dark:text-white">
                    {item.name}
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-500 dark:text-slate-400">
                    {item.symbol} · {item.exchange} · {item.country}
                  </p>
                </div>

                <button
                  onClick={() => remove(item)}
                  className="rounded-xl p-2 text-slate-400 transition hover:bg-red-400/10 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <p className="mt-3 text-xs font-bold text-slate-500 dark:text-slate-400">
                Followed at {new Date(item.followedAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
          No followed companies yet. Try: Follow Nvidia news.
        </p>
      )}
    </section>
  );
}
