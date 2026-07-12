"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, ExternalLink, Loader2, Sparkles } from "lucide-react";

type CompareResult = { companies: any[]; comparison?: any };
type CompareFollowUpData = {
  intent: string;
  answer: { answer: string; winner?: { symbol: string; name: string; reason: string } | null; keyPoints: string[]; sentiment: string; decisionImpact: string; followUpQuestions: string[] };
  researchByCompany: Array<{ company: any; sources: Array<{ title: string; summary: string; source: string; url?: string; publishedAt?: string; sentiment?: string }> }>;
};
type ChatItem = { question: string; response: CompareFollowUpData };

const QUICK_QUESTIONS = [
  "Which company has stronger recent growth and why?",
  "Which company has lower investment risk?",
  "Which one looks better for long-term investment?",
];

export function CompareFollowUpPanel({ compareResult }: { compareResult: CompareResult }) {
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(false);
  const conversationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const nodes = conversationRef.current?.querySelectorAll<HTMLElement>("[data-follow-up-turn]");
      nodes?.[nodes.length - 1]?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [history.length, loading]);

  async function askCompareFollowUp(customQuestion?: string) {
    const finalQuestion = (customQuestion ?? question).trim();
    if (!finalQuestion || loading) return;

    setQuestion("");
    setLoading(true);

    try {
      const response = await fetch("/api/compare/follow-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: finalQuestion,
          companies: compareResult.companies.map((report) => report.company?.name ?? report.company?.symbol),
          companyProfiles: compareResult.companies.map((report) => report.company),
          previousComparison: compareResult.comparison,
          previousReports: compareResult.companies,
        }),
      });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error ?? "Compare follow-up failed.");
      setHistory((current) => [...current, { question: finalQuestion, response: json.data }]);
    } catch (error) {
      setHistory((current) => [...current, {
        question: finalQuestion,
        response: { intent: "ERROR", answer: { answer: error instanceof Error ? error.message : "Compare follow-up failed.", winner: null, keyPoints: [], sentiment: "NEUTRAL", decisionImpact: "INSUFFICIENT_DATA", followUpQuestions: [] }, researchByCompany: [] },
      }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="border-t border-slate-200 pt-7 dark:border-white/10">
      {history.length === 0 && (
        <div className="mb-5">
          <p className="text-sm font-semibold text-slate-950 dark:text-white">Ask a follow-up</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {QUICK_QUESTIONS.map((item) => (
              <button key={item} type="button" onClick={() => void askCompareFollowUp(item)} disabled={loading} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-left text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 disabled:opacity-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white">
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-emerald-500" />{item}
              </button>
            ))}
          </div>
        </div>
      )}

      <div ref={conversationRef} className="space-y-10">
        {history.map((item, index) => <CompareChatAnswer key={`${item.question}-${index}`} item={item} />)}
        {loading && <div data-follow-up-turn className="grid scroll-mt-24 grid-cols-[32px_minmax(0,1fr)] gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-[10px] font-bold text-white dark:bg-white dark:text-slate-950">EL</div><div className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" />Working on comparison follow-up...</div></div>}
      </div>

      <form onSubmit={(event) => { event.preventDefault(); void askCompareFollowUp(); }} className="sticky bottom-4 z-20 mt-8 rounded-2xl border border-slate-300 bg-white p-2 shadow-[0_10px_35px_rgba(15,23,42,0.10)] dark:border-white/15 dark:bg-slate-900">
        <div className="flex min-h-12 items-center gap-2 pl-3">
          <input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask about growth, risk, valuation, or long-term potential" className="min-w-0 flex-1 bg-transparent py-2 text-sm text-slate-950 outline-none placeholder:text-slate-400 dark:text-white" />
          <button type="submit" disabled={loading || !question.trim()} aria-label="Ask follow-up" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white transition disabled:bg-slate-200 disabled:text-slate-400 dark:bg-white dark:text-slate-950 dark:disabled:bg-white/10 dark:disabled:text-white/30">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}</button>
        </div>
      </form>
    </section>
  );
}

function CompareChatAnswer({ item }: { item: ChatItem }) {
  return (
    <div data-follow-up-turn className="scroll-mt-24">
      <div className="mb-6 flex justify-end"><div className="max-w-[80%] rounded-2xl rounded-br-md bg-slate-200 px-4 py-3 text-sm font-medium text-slate-900 dark:bg-white/10 dark:text-white">{item.question}</div></div>
      <div className="grid grid-cols-[32px_minmax(0,1fr)] gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-[10px] font-bold text-white dark:bg-white dark:text-slate-950">EL</div>
        <div className="chat-response-reveal min-w-0">
          <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-slate-400"><span>{formatLabel(item.response.intent)}</span><span>·</span><span>{formatLabel(item.response.answer.decisionImpact)}</span></div>
          {item.response.answer.winner && <div className="mt-3 border-l-2 border-emerald-500 pl-4"><p className="text-sm font-semibold text-slate-950 dark:text-white">{item.response.answer.winner.name} ({item.response.answer.winner.symbol})</p><p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.response.answer.winner.reason}</p></div>}
          <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-700 dark:text-slate-200">{item.response.answer.answer}</p>
          {item.response.answer.keyPoints?.length > 0 && <ul className="mt-4 space-y-2">{item.response.answer.keyPoints.map((point) => <li key={point} className="flex items-start gap-2 text-sm leading-6 text-slate-600 dark:text-slate-300"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-500" />{point}</li>)}</ul>}
          {item.response.researchByCompany?.length > 0 && <div className="mt-5 border-t border-slate-200 pt-4 dark:border-white/10"><p className="text-xs font-semibold text-slate-400">Sources</p><div className="mt-3 space-y-3">{item.response.researchByCompany.flatMap((group) => group.sources.slice(0, 2).map((source) => <div key={`${group.company.name}-${source.title}`} className="flex items-start justify-between gap-3"><div><p className="text-xs font-medium text-slate-700 dark:text-slate-200">{source.title}</p><p className="mt-1 text-[11px] text-slate-400">{group.company.name} · {source.source}</p></div>{source.url && <a href={source.url} target="_blank" rel="noreferrer" aria-label="Open source" className="text-slate-400 hover:text-emerald-500"><ExternalLink className="h-3.5 w-3.5" /></a>}</div>))}</div></div>}
        </div>
      </div>
    </div>
  );
}

function formatLabel(value: string) { return value?.replaceAll("_", " ") ?? ""; }
