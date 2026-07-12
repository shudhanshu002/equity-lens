"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { BookmarkCheck, BookmarkPlus, Loader2 } from "lucide-react";
import type { InvestmentResearchReport } from "@/lib/types/research";
import { addUserWatchlistItem, type WatchlistRisk, type WatchlistStatus } from "@/lib/user-data/watchlist-client";

const LOCAL_KEY = "equitylens_followed_companies";

export function DecisionActionPanel({ report }: { report: InvestmentResearchReport }) {
  const { status: sessionStatus } = useSession();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");

  const watchlistStatus: WatchlistStatus = report.decision === "INVEST" ? "High Conviction" : "Watchlist";
  const risk: WatchlistRisk = report.score.balanceSheet < 45 || report.score.sentiment < 40 ? "High" : report.score.total >= 75 ? "Low" : "Medium";

  async function saveDecision() {
    if (saving || saved) return;
    setSaving(true);
    setMessage("");

    try {
      if (sessionStatus === "authenticated") {
        await addUserWatchlistItem({
          company: report.company.name,
          symbol: report.company.symbol,
          thesis: report.thesis.slice(0, 600),
          status: watchlistStatus,
          score: report.score.total,
          risk,
        });
        setMessage(`Saved as ${watchlistStatus}.`);
      } else {
        saveLocally(report);
        setMessage("Saved on this device. Sign in to sync it to your account.");
      }
      setSaved(true);
    } catch (error) {
      const text = error instanceof Error ? error.message : "Could not save this company.";
      if (text.toLowerCase().includes("already")) {
        setSaved(true);
        setMessage("This company is already in your watchlist.");
      } else {
        setMessage(text);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-7 rounded-2xl border border-white/10 bg-white/10 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Next action</p>
      <p className="mt-2 text-sm leading-6 text-slate-200">
        {report.decision === "INVEST" && "The score clears the investment threshold. Save it as a high-conviction idea for continued monitoring."}
        {report.decision === "WATCHLIST" && "The case is promising but not strong enough yet. Track the signals that could change the decision."}
        {report.decision === "PASS" && "The current evidence does not support investing. Keep it only if you want to monitor for a future change."}
        {report.decision === "INSUFFICIENT_DATA" && "There is not enough verified evidence for an investment decision. Save it only as a research target."}
      </p>
      <button type="button" onClick={saveDecision} disabled={saving || saved} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-100 disabled:cursor-default disabled:opacity-80">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <BookmarkCheck className="h-4 w-4" /> : <BookmarkPlus className="h-4 w-4" />}
        {saved ? "Saved to watchlist" : report.decision === "INVEST" ? "Save investment idea" : report.decision === "INSUFFICIENT_DATA" ? "Save for more research" : "Keep on watchlist"}
      </button>
      {message ? <p className="mt-3 text-xs leading-5 text-slate-300">{message}</p> : null}
    </div>
  );
}

function saveLocally(report: InvestmentResearchReport) {
  let existing: Array<Record<string, unknown>> = [];
  try {
    existing = JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "[]");
  } catch {
    existing = [];
  }

  const item = {
    ...report.company,
    thesis: report.thesis,
    decision: report.decision,
    score: report.score.total,
    followedAt: new Date().toISOString(),
  };
  const next = [item, ...existing.filter((old) => old.symbol !== report.company.symbol)];
  localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
}
