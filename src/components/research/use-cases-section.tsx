import {
  BriefcaseBusiness,
  GraduationCap,
  Landmark,
  PieChart,
  Rocket,
  ShieldCheck,
} from "lucide-react";

const USE_CASES = [
  {
    icon: <GraduationCap className="h-5 w-5" />,
    title: "Student Research Projects",
    description:
      "Quickly generate structured company research reports for finance, AI, and product assignments.",
    audience: "Students",
  },
  {
    icon: <BriefcaseBusiness className="h-5 w-5" />,
    title: "Analyst-Style Screening",
    description:
      "Screen companies using explainable scoring before doing deeper manual research.",
    audience: "Analysts",
  },
  {
    icon: <PieChart className="h-5 w-5" />,
    title: "Portfolio Watchlist Review",
    description:
      "Compare multiple companies and decide which ones deserve deeper tracking.",
    audience: "Investors",
  },
  {
    icon: <Landmark className="h-5 w-5" />,
    title: "Business Case Evaluation",
    description:
      "Understand company fundamentals, valuation pressure, risks, and competitive signals.",
    audience: "Product Teams",
  },
];

export function UseCasesSection() {
  return (
    <section className="py-20">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-600 dark:text-emerald-300">
            <Rocket className="h-4 w-4" />
            Use cases
          </div>

          <h2 className="text-4xl font-black tracking-tight text-slate-950 dark:text-white">
            Designed for people who need faster investment reasoning
          </h2>

          <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
            EquityLens AI is useful wherever company research needs to be
            repeatable, explainable, and presentation-ready.
          </p>

          <div className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04]">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <h3 className="text-xl font-black text-slate-950 dark:text-white">
              Not just an AI answer
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
              The app separates score calculation, data quality, source tracing,
              and memo generation. That makes it easier to explain during review
              or demo.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {USE_CASES.map((useCase) => (
            <div
              key={useCase.title}
              className="group rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 transition hover:-translate-y-1 hover:shadow-2xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20"
            >
              <div className="mb-5 flex items-center justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-cyan-600 transition group-hover:bg-cyan-400/10 dark:bg-white/10 dark:text-cyan-300">
                  {useCase.icon}
                </div>

                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                  {useCase.audience}
                </span>
              </div>

              <h3 className="text-xl font-black text-slate-950 dark:text-white">
                {useCase.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                {useCase.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}