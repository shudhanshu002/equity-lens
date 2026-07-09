import {
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle2,
  Database,
  FileText,
  GitBranch,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import { HeroVisual } from "@/components/research/hero-visual";
import { AppTab } from "@/components/research/floating-navbar";
import { IntegrationsFlow } from "./integrations-flow";
import { ProductShowcase } from "./product-showcase";
import { UseCasesSection } from "./use-cases-section";
import { TrustSection } from "./trust-section";
import { ResultsPreviewSection } from "./results-preview-section";
import { FaqSection } from "./faq-section";
import { FinalCtaSection } from "./final-cta-section";
import { MarketIntelligenceStrip } from "./market-intelligence-strip";
import { DemoScenariosSection } from "./demo-scenarios-section";
import { KeyboardShortcutsCard } from "./keyboard-shortcuts-card";
import { TechnicalArchitectureSection } from "./technical-architecture-section";

type LandingPageProps = {
  onTabChange: (tab: AppTab) => void;
    onPickResearch: (company: string) => void;
    onPickCompare: (companies: string) => void;
};

const FEATURES = [
  {
    icon: <Database className="h-5 w-5 text-cyan-500" />,
    title: "Financial Data Collection",
    description:
      "Pulls company fundamentals, profitability metrics, valuation ratios, and profile data from provider APIs.",
  },
  {
    icon: <BarChart3 className="h-5 w-5 text-emerald-500" />,
    title: "Explainable Scoring",
    description:
      "Calculates deterministic scores for growth, profitability, balance sheet strength, valuation, and sentiment.",
  },
  {
    icon: <Brain className="h-5 w-5 text-violet-500" />,
    title: "AI Investment Memo",
    description:
      "Uses Gemini to generate thesis, bull case, bear case, risks, and decision-change triggers.",
  },
  {
    icon: <GitBranch className="h-5 w-5 text-amber-500" />,
    title: "Agent Traceability",
    description:
      "Every report shows sources, fallback usage, warnings, and workflow execution trace.",
  },
];

const WORKFLOW = [
  "Resolve company symbol",
  "Fetch financial snapshot",
  "Collect news sentiment",
  "Run scoring model",
  "Generate AI memo",
  "Export research report",
];

export function LandingPage({ onTabChange, onPickResearch, onPickCompare }: LandingPageProps) {
  return (
    <div className="pt-32">
      <section id="home" className="grid min-h-[calc(100vh-8rem)] items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-600 dark:text-cyan-300">
            <Sparkles className="h-4 w-4" />
            AI-powered equity research command center
          </div>

          <h1 className="max-w-5xl text-5xl font-black tracking-tight text-slate-950 dark:text-white md:text-7xl">
            Turn company names into{" "}
            <span className="bg-gradient-to-r from-cyan-500 via-violet-500 to-emerald-500 bg-clip-text text-transparent">
              investment-grade research
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            EquityLens AI researches a company, scores its fundamentals,
            analyzes news sentiment, generates an investment memo, and decides
            whether to Invest, Watchlist, or Pass.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <button
              onClick={() => onTabChange("research")}
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-4 text-sm font-bold text-white shadow-2xl shadow-slate-900/20 transition hover:-translate-y-0.5 hover:shadow-cyan-500/20 dark:bg-white dark:text-slate-950"
            >
              Start Research
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => onTabChange("compare")}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-4 text-sm font-bold text-slate-900 shadow-lg shadow-slate-900/5 transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/10 dark:text-white"
            >
              Compare Companies
              <BarChart3 className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <LandingStat label="Workflow" value="LangGraph" />
            <LandingStat label="Decision Model" value="Explainable" />
            <LandingStat label="Reports" value="Exportable" />
          </div>
        </div>

        <HeroVisual />
      </section>

      <MarketIntelligenceStrip />

      <IntegrationsFlow />

      <ProductShowcase onTabChange={onTabChange} />

      <UseCasesSection />

      <TrustSection />

      <ResultsPreviewSection />

        <DemoScenariosSection
            onTabChange={onTabChange}
            onPickResearch={onPickResearch}
            onPickCompare={onPickCompare}
        />

      <FaqSection />

      <KeyboardShortcutsCard />

      <TechnicalArchitectureSection />

      <section className="py-20">
        <div className="mb-10 max-w-3xl">
          <p className="mb-3 text-sm font-black uppercase tracking-[0.3em] text-cyan-500">
            What it does
          </p>

          <h2 className="text-4xl font-black tracking-tight text-slate-950 dark:text-white">
            A research workflow that feels like a real SaaS product
          </h2>

          <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
            Instead of only asking an LLM for an opinion, EquityLens separates
            data gathering, scoring, reasoning, source tracking, and export into
            a structured product experience.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 transition hover:-translate-y-1 hover:shadow-2xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/10">
                {feature.icon}
              </div>

              <h3 className="text-lg font-black text-slate-950 dark:text-white">
                {feature.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/30 md:p-10">
          <div className="mb-8 flex flex-wrap items-start justify-between gap-5">
            <div>
              <div className="mb-3 flex items-center gap-2 text-violet-500">
                <Workflow className="h-5 w-5" />
                <p className="text-sm font-black uppercase tracking-[0.3em]">
                  How it works
                </p>
              </div>

              <h2 className="text-4xl font-black text-slate-950 dark:text-white">
                From company input to final investment memo
              </h2>
            </div>

            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-4 text-emerald-600 dark:text-emerald-300">
              <div className="flex items-center gap-2 font-bold">
                <ShieldCheck className="h-5 w-5" />
                Transparent by design
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-6">
            {WORKFLOW.map((step, index) => (
              <div
                key={step}
                className="relative rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-950/60"
              >
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white dark:bg-white dark:text-slate-950">
                  {index + 1}
                </div>

                <p className="text-sm font-bold leading-6 text-slate-800 dark:text-slate-200">
                  {step}
                </p>

                {index < WORKFLOW.length - 1 && (
                  <div className="absolute -right-3 top-1/2 hidden h-px w-6 bg-slate-300 dark:bg-white/20 lg:block" />
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <ProofItem title="Decision thresholds" value="75+ Invest · 55–74 Watchlist · Below 55 Pass" />
            <ProofItem title="Data quality" value="Warnings and fallback usage are shown in every output" />
            <ProofItem title="Submission value" value="Single research, comparison, export, history, and system status" />
          </div>
        </div>
      </section>

      {/* <section className="pb-20">
        <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-2xl shadow-slate-900/20 dark:border-white/10 md:p-10">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="mb-3 text-sm font-black uppercase tracking-[0.3em] text-cyan-300">
                Ready to test
              </p>

              <h2 className="text-4xl font-black">
                Run Apple, Microsoft, or Nvidia research now.
              </h2>

              <p className="mt-4 max-w-2xl text-slate-300">
                Use the Research tab for one company or Compare tab for a
                multi-company decision memo.
              </p>
            </div>

            <button
              onClick={() => onTabChange("research")}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-black text-slate-950 transition hover:-translate-y-0.5"
            >
              Open Research Agent
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section> */}
      <FinalCtaSection onTabChange={onTabChange} />
    </div>
  );
}

function LandingStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-lg shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04]">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-lg font-black text-slate-950 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function ProofItem({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-950/60">
      <div className="mb-2 flex items-center gap-2 text-emerald-500">
        <CheckCircle2 className="h-4 w-4" />
        <p className="font-bold text-slate-950 dark:text-white">{title}</p>
      </div>

      <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
        {value}
      </p>
    </div>
  );
}