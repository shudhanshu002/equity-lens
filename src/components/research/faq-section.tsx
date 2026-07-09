import { HelpCircle } from "lucide-react";

const FAQS = [
  {
    question: "Is EquityLens AI giving financial advice?",
    answer:
      "No. EquityLens AI is for educational, research, and demo purposes only. It helps structure analysis, but users should verify all outputs independently before making investment decisions.",
  },
  {
    question: "Does the LLM decide the investment score?",
    answer:
      "No. The numeric score is calculated using deterministic TypeScript logic. The LLM generates the memo explanation after the score and decision are already calculated.",
  },
  {
    question: "What happens when data is missing?",
    answer:
      "Missing fields are treated as unknown, not automatically good or bad. The app also surfaces warnings so reviewers can see exactly where data was incomplete.",
  },
  {
    question: "Why does the app use fallback news?",
    answer:
      "If Finnhub is not configured, the app uses mock news fallback so the demo remains stable. The metadata clearly shows when fallback data is used.",
  },
  {
    question: "Can reports be exported?",
    answer:
      "Yes. Single-company reports and comparison reports can be copied or downloaded as Markdown memos.",
  },
  {
    question: "Where is history stored?",
    answer:
      "Research history is stored locally in the browser using localStorage. No database is required for the demo version.",
  },
];

export function FaqSection() {
  return (
    <section className="py-20">
      <div className="mb-10 max-w-3xl">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm font-bold text-amber-600 dark:text-amber-300">
          <HelpCircle className="h-4 w-4" />
          FAQ
        </div>

        <h2 className="text-4xl font-black tracking-tight text-slate-950 dark:text-white">
          Questions reviewers may ask during evaluation
        </h2>

        <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
          These answers make the project easier to understand during demo,
          submission review, or technical discussion.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {FAQS.map((faq) => (
          <div
            key={faq.question}
            className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 transition hover:-translate-y-1 hover:shadow-2xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20"
          >
            <h3 className="text-lg font-black text-slate-950 dark:text-white">
              {faq.question}
            </h3>

            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}