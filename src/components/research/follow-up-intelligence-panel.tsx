"use client";

import { useState } from "react";
import {
  ExternalLink,
  Loader2,
  MessageSquare,
  Newspaper,
  Send,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

type ResearchReport = {
  company: any;
  financials?: any;
  news?: any[];
  score?: {
    total?: number;
  };
  decision?: string;
};

type FollowUpResponse = {
  company: any;
  intent: string;
  answer: {
    answer: string;
    keyPoints: string[];
    sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE" | "MIXED";
    decisionImpact:
      | "IMPROVES_CASE"
      | "WEAKENS_CASE"
      | "NO_MAJOR_CHANGE"
      | "INSUFFICIENT_DATA";
    followUpQuestions: string[];
  };
  sources: Array<{
    title: string;
    summary: string;
    source: string;
    url?: string;
    publishedAt?: string;
    sentiment?: string;
  }>;
};

type ChatItem = {
  question: string;
  response: FollowUpResponse;
};

const QUICK_QUESTIONS = [
  {
    label: "Latest news",
    question: "What is the latest news and what does it mean for the investment case?",
    icon: Newspaper,
  },
  {
    label: "Recent growth",
    question: "What are the recent growth drivers and financial trends?",
    icon: TrendingUp,
  },
  {
    label: "Competitors",
    question: "Who are the main competitors and how strong is the company's position?",
    icon: Users,
  },
  {
    label: "Risks",
    question: "What are the biggest risks investors should watch?",
    icon: ShieldAlert,
  },
];

export function FollowUpIntelligencePanel({
  report,
}: {
  report: ResearchReport;
}) {
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(false);

  async function askFollowUp(customQuestion?: string) {
    const finalQuestion = (customQuestion ?? question).trim();

    if (!finalQuestion || loading) return;

    setLoading(true);

    try {
      const response = await fetch("/api/research/follow-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company: report.company?.name ?? report.company?.symbol,
          question: finalQuestion,
          companyProfile: report.company,
          previousDecision: report.decision,
          previousScore: report.score?.total,
          previousNews: report.news,
          previousFinancials: report.financials,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error ?? "Follow-up request failed.");
      }

      setHistory((prev) => [
        {
          question: finalQuestion,
          response: json.data,
        },
        ...prev,
      ]);

      setQuestion("");
    } catch (error) {
      setHistory((prev) => [
        {
          question: finalQuestion,
          response: {
            company: report.company,
            intent: "ERROR",
            answer: {
              answer:
                error instanceof Error
                  ? error.message
                  : "Follow-up research failed.",
              keyPoints: [],
              sentiment: "NEUTRAL",
              decisionImpact: "INSUFFICIENT_DATA",
              followUpQuestions: [],
            },
            sources: [],
          },
        },
        ...prev,
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-300">
            <Sparkles className="h-3.5 w-3.5" />
            Follow-up intelligence
          </div>

          <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950 dark:text-white">
            Ask EquityLens about {report.company?.name ?? "this company"}
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            Ask about latest news, recent growth, competitors, risks, valuation,
            or whether the investment decision has changed.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5">
          <p className="font-black text-slate-900 dark:text-white">
            Current decision
          </p>
          <p className="mt-1 text-slate-600 dark:text-slate-300">
            {report.decision ?? "—"} · Score {report.score?.total ?? "—"}/100
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK_QUESTIONS.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              onClick={() => askFollowUp(item.question)}
              disabled={loading}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:-translate-y-0.5 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            >
              <Icon className="h-5 w-5 text-cyan-600 dark:text-cyan-300" />
              <p className="mt-3 text-sm font-black text-slate-950 dark:text-white">
                {item.label}
              </p>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <MessageSquare className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") askFollowUp();
            }}
            placeholder="Ask: Who are the competitors? What changed recently?"
            className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-sm font-semibold outline-none transition focus:border-cyan-400 dark:border-white/10 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <button
          onClick={() => askFollowUp()}
          disabled={loading || !question.trim()}
          className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 text-sm font-black text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Ask
        </button>
      </div>

      <div className="mt-8 space-y-5">
        {history.map((item, index) => (
          <FollowUpAnswerCard key={`${item.question}-${index}`} item={item} />
        ))}
      </div>
    </section>
  );
}

function FollowUpAnswerCard({ item }: { item: ChatItem }) {
  const response = item.response;

  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
        Question
      </p>

      <h3 className="mt-2 text-lg font-black text-slate-950 dark:text-white">
        {item.question}
      </h3>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge label={response.intent} />
        <Badge label={response.answer.sentiment} />
        <Badge label={formatDecisionImpact(response.answer.decisionImpact)} />
      </div>

      <p className="mt-5 whitespace-pre-line text-sm leading-7 text-slate-700 dark:text-slate-200">
        {response.answer.answer}
      </p>

      {response.answer.keyPoints?.length ? (
        <div className="mt-5">
          <p className="text-sm font-black text-slate-950 dark:text-white">
            Key points
          </p>

          <ul className="mt-3 space-y-2">
            {response.answer.keyPoints.map((point) => (
              <li
                key={point}
                className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 dark:bg-slate-950 dark:text-slate-200"
              >
                {point}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {response.sources?.length ? (
        <div className="mt-5">
          <p className="text-sm font-black text-slate-950 dark:text-white">
            Sources used
          </p>

          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            {response.sources.slice(0, 6).map((source) => (
              <div
                key={`${source.title}-${source.source}`}
                className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-950"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-black text-slate-950 dark:text-white">
                    {source.title}
                  </p>

                  {source.url ? (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 text-slate-400 transition hover:text-cyan-500"
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

      {response.answer.followUpQuestions?.length ? (
        <div className="mt-5">
          <p className="text-sm font-black text-slate-950 dark:text-white">
            Suggested next questions
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {response.answer.followUpQuestions.map((question) => (
              <span
                key={question}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-600 dark:border-white/10 dark:bg-slate-950 dark:text-slate-300"
              >
                {question}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-slate-600 dark:border-white/10 dark:bg-slate-950 dark:text-slate-300">
      {label.replaceAll("_", " ")}
    </span>
  );
}

function formatDecisionImpact(value: string) {
  if (value === "IMPROVES_CASE") return "Improves case";
  if (value === "WEAKENS_CASE") return "Weakens case";
  if (value === "NO_MAJOR_CHANGE") return "No major change";
  return "Insufficient data";
}
