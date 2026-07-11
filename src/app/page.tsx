"use client";

import { useState } from "react";
import { compareCompanies, researchCompany } from "@/lib/api-client";
import type { ComparisonApiResponse } from "@/lib/api-client";
import type { InvestmentResearchReport } from "@/lib/types/research";
import type { AppTab } from "@/lib/frontend/app-tabs";
import { ConversationalResearchPanel } from "@/components/research/conversational-research-panel";
import { AgentProgressTimeline } from "@/components/research/agent-progress-timeline";
import { AgentGraphVisualization } from "@/components/research/agent-graph-visualization";
import { SystemStatus } from "@/components/research/system-status";
import { ReportView } from "@/components/research/report-view";
import { CompareView } from "@/components/research/compare-view";
import { RecentHistory } from "@/components/research/recent-history";
import { ExportsCenter } from "@/components/research/exports-center";
import { AppFooter } from "@/components/research/app-footer";
import {
  BarChart3,
  Brain,
  Database,
  FileText,
  GitBranch,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { NavbarAppShell } from "@/components/research/navbar-app-shell";
import { PremiumHomePage } from "@/components/research/premium-home-page";
import { DatabaseSettingsPanel } from "@/components/research/database-settings-panel";
import { DatabasePortfolioWatchlist } from "@/components/research/database-portfolio-watchlist";
import { DatabaseHistoryCenter } from "@/components/research/database-history-center";
import { useSession } from "next-auth/react";
import { HistorySaveToast } from "@/components/research/history-save-toast";
import { autoSaveComparisonHistory, autoSaveResearchHistory, type AutoSaveHistoryResult } from "@/lib/user-data/auto-save-history";
import { DatabaseExportsCenter } from "@/components/research/database-exports-center";
import { UserDashboardSummary } from "@/components/research/user-dashboard-summary";
import { AuthGuardCard } from "@/components/auth/auth-guard-card";
import { RequireAuthWrapper } from "@/components/auth/require-auth-wrapper";
import { AuthRequiredInline } from "@/components/auth/auth-required-inline";

export default function Home() {
  const { status } = useSession();
  const [historySaveResult, setHistorySaveResult] =
    useState<AutoSaveHistoryResult | null>(null);

  const loggedIn = status === "authenticated";

  const [activeTab, setActiveTab] = useState<AppTab>(() => {
    if (typeof window === "undefined") {
      return "home";
    }

    return getInitialTab(new URLSearchParams(window.location.search).get("tab"));
  });

  const [company, setCompany] = useState("Nvidia");
  const [companies, setCompanies] = useState("Nvidia, Tesla, Netflix");

  const [report, setReport] = useState<InvestmentResearchReport | null>(null);
  const [comparison, setComparison] =
    useState<ComparisonApiResponse["data"]>(undefined);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleResearch() {
    const cleanedCompany = company.trim();

    if (!cleanedCompany || loading) return;

    setError("");
    setLoading(true);
    setComparison(undefined);

    try {
      const response = await researchCompany(cleanedCompany);

      if (!response.success || !response.data) {
        throw new Error(response.error ?? "Failed to run research.");
      }

      setReport(response.data);
      setActiveTab("research");

      const saveResult = await autoSaveResearchHistory(response.data, {
        loggedIn,
        enableLocalFallback: true,
      });

      setHistorySaveResult(saveResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCompare() {
    if (loading) return;

    const parsedCompanies = companies
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (parsedCompanies.length < 2) {
      setError("Please enter at least two companies separated by commas.");
      return;
    }

    setError("");
    setLoading(true);
    setReport(null);

    try {
      const response = await compareCompanies(parsedCompanies);

      if (!response.success || !response.data) {
        throw new Error(response.error ?? "Failed to compare companies.");
      }

      setComparison(response.data);
      setActiveTab("compare");

      const saveResult = await autoSaveComparisonHistory(response.data, {
        loggedIn,
        enableLocalFallback: true,
      });

      setHistorySaveResult(saveResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function pickResearch(selectedCompany: string) {
    setCompany(selectedCompany);
  }

  function pickCompare(selectedCompanies: string) {
    setCompanies(selectedCompanies);
  }

  return (
    <NavbarAppShell activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === "home" && (
        <div className="space-y-16">
          <PremiumHomePage
            onTabChange={setActiveTab}
            onPickResearch={pickResearch}
            onPickCompare={pickCompare}
          />

          <UserDashboardSummary
            onTabChange={setActiveTab}
            onPickResearch={pickResearch}
          />
        </div>
      )}

      {activeTab === "research" && (
        <ResearchWorkspace
          company={company}
          setCompany={setCompany}
          companies={companies}
          setCompanies={setCompanies}
          loading={loading}
          error={error}
          report={report}
          comparison={comparison}
          onResearch={handleResearch}
          onCompare={handleCompare}
          onOpenReport={(savedReport) => {
            setComparison(undefined);
            setReport(savedReport);
            setActiveTab("research");
          }}
          onOpenComparison={(savedComparison) => {
            setReport(null);
            setComparison(savedComparison);
            setActiveTab("compare");
          }}
        />
      )}

      {activeTab === "compare" && (
        <CompareWorkspace
          company={company}
          setCompany={setCompany}
          companies={companies}
          setCompanies={setCompanies}
          loading={loading}
          error={error}
          report={report}
          comparison={comparison}
          onResearch={handleResearch}
          onCompare={handleCompare}
          onOpenReport={(savedReport) => {
            setComparison(undefined);
            setReport(savedReport);
            setActiveTab("research");
          }}
          onOpenComparison={(savedComparison) => {
            setReport(null);
            setComparison(savedComparison);
            setActiveTab("compare");
          }}
        />
      )}

      {activeTab === "history" && (
        <AuthGuardCard
          title="Login to view your saved history."
          description="History is linked to your authenticated account so your reports stay available after refresh."
          feature="history"
          onTabChange={setActiveTab}
        >
          <DatabaseHistoryCenter
            onTabChange={setActiveTab}
            onPickResearch={pickResearch}
            onPickCompare={pickCompare}
          />
        </AuthGuardCard>
      )}

      {activeTab === "portfolio" && (
        <DatabasePortfolioWatchlist
          onTabChange={setActiveTab}
          onPickResearch={pickResearch}
          onPickCompare={pickCompare}
        />
      )}

      {activeTab === "exports" && (
        <RequireAuthWrapper
          title="Login to access saved exports."
          description="Export history is saved to your PostgreSQL account workspace."
        >
          <DatabaseExportsCenter
            report={report}
            comparison={comparison}
          />
        </RequireAuthWrapper>
      )}

      {activeTab === "settings" && <DatabaseSettingsPanel />}

      <AppFooter />

      <HistorySaveToast
        result={historySaveResult}
        onClose={() => setHistorySaveResult(null)}
      />
    </NavbarAppShell>
  );
}

function getInitialTab(tab: string | null): AppTab {
  switch (tab) {
    case "research":
    case "compare":
    case "history":
    case "portfolio":
    case "watchlist":
    case "exports":
    case "settings":
      return tab === "watchlist" ? "portfolio" : tab;
    default:
      return "home";
  }
}

function ResearchWorkspace({
  company,
  setCompany,
  companies,
  setCompanies,
  loading,
  error,
  report,
  comparison,
  onResearch,
  onCompare,
  onOpenReport,
  onOpenComparison,
}: {
  company: string;
  setCompany: React.Dispatch<React.SetStateAction<string>>;
  companies: string;
  setCompanies: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  error: string;
  report: InvestmentResearchReport | null;
  comparison: ComparisonApiResponse["data"] | undefined;
  onResearch: () => void;
  onCompare: () => void;
  onOpenReport: (report: InvestmentResearchReport) => void;
  onOpenComparison: (comparison: NonNullable<ComparisonApiResponse["data"]>) => void;
}) {
  return (
    <div className="space-y-8">
      <ConversationalResearchPanel
        variant="research"
        company={company}
        setCompany={setCompany}
        companies={companies}
        setCompanies={setCompanies}
        loading={loading}
        error={error}
        onResearch={onResearch}
        onCompare={onCompare}
      />

      <SystemStatus />

      {loading && (
        <>
          <AgentProgressTimeline loading={loading} variant="research" />
          <AgentGraphVisualization loading={loading} variant="research" />
        </>
      )}

      {!loading && !report && <ResearchStarter />}

      {!loading && report && (
        <>
          <AgentGraphVisualization loading={false} variant="research" />
          <AuthRequiredInline
            title="Login to save this report."
            description="You can still run research, but saving to database requires login."
          />
          <ReportView report={report} />
        </>
      )}

      <RecentHistory
        currentReport={report}
        currentComparison={comparison}
        onOpenReport={onOpenReport}
        onOpenComparison={onOpenComparison}
      />
    </div>
  );
}

function CompareWorkspace({
  company,
  setCompany,
  companies,
  setCompanies,
  loading,
  error,
  report,
  comparison,
  onResearch,
  onCompare,
  onOpenReport,
  onOpenComparison,
}: {
  company: string;
  setCompany: React.Dispatch<React.SetStateAction<string>>;
  companies: string;
  setCompanies: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  error: string;
  report: InvestmentResearchReport | null;
  comparison: ComparisonApiResponse["data"] | undefined;
  onResearch: () => void;
  onCompare: () => void;
  onOpenReport: (report: InvestmentResearchReport) => void;
  onOpenComparison: (comparison: NonNullable<ComparisonApiResponse["data"]>) => void;
}) {
  return (
    <div className="space-y-8">
      <ConversationalResearchPanel
        variant="compare"
        company={company}
        setCompany={setCompany}
        companies={companies}
        setCompanies={setCompanies}
        loading={loading}
        error={error}
        onResearch={onResearch}
        onCompare={onCompare}
      />

      <SystemStatus />

      {loading && (
        <>
          <AgentProgressTimeline loading={loading} variant="compare" />
          <AgentGraphVisualization loading={loading} variant="compare" />
        </>
      )}

      {!loading && !comparison && <CompareStarter />}

      {!loading && comparison && (
        <>
          <AgentGraphVisualization loading={false} variant="compare" />
          <AuthRequiredInline
            title="Login to save this comparison."
            description="You can still run comparison, but saving to database requires login."
          />
          <CompareView comparison={comparison} />
        </>
      )}

      <RecentHistory
        currentReport={report}
        currentComparison={comparison}
        onOpenReport={onOpenReport}
        onOpenComparison={onOpenComparison}
      />
    </div>
  );
}

function ResearchStarter() {
  return (
    <section className="rounded-[2.5rem] border border-dashed border-slate-300 bg-white p-8 text-center shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20 md:p-12">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-slate-950 text-white shadow-2xl shadow-slate-900/20 dark:bg-white dark:text-slate-950">
        <Search className="h-9 w-9" />
      </div>

      <p className="mb-3 text-sm font-black uppercase tracking-[0.3em] text-cyan-600 dark:text-cyan-300">
        Research workspace
      </p>

      <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white md:text-4xl">
        Ask EquityLens to analyze a company.
      </h2>

      <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">
        Try prompts like “Analyze Nvidia”, “Should I invest in Apple?”, or
        “Research Microsoft fundamentals”. The agent will show progress,
        visualize execution, and generate a structured memo.
      </p>

      <div className="mx-auto mt-8 grid max-w-4xl gap-4 md:grid-cols-3">
        <StarterFeature
          icon={<Database className="h-5 w-5" />}
          title="Financial Data"
          description="Fetches fundamentals, valuation, margins, and profitability."
        />

        <StarterFeature
          icon={<GitBranch className="h-5 w-5" />}
          title="Agent Workflow"
          description="Shows the LangGraph-style execution path."
        />

        <StarterFeature
          icon={<FileText className="h-5 w-5" />}
          title="AI Memo"
          description="Generates recommendation, risks, thesis, and reasoning."
        />
      </div>
    </section>
  );
}

function CompareStarter() {
  return (
    <section className="rounded-[2.5rem] border border-dashed border-slate-300 bg-white p-8 text-center shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20 md:p-12">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-slate-950 text-white shadow-2xl shadow-slate-900/20 dark:bg-white dark:text-slate-950">
        <BarChart3 className="h-9 w-9" />
      </div>

      <p className="mb-3 text-sm font-black uppercase tracking-[0.3em] text-violet-600 dark:text-violet-300">
        Compare workspace
      </p>

      <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white md:text-4xl">
        Compare companies like a research analyst.
      </h2>

      <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">
        Try prompts like “Compare Nvidia, Tesla, Netflix” or “Compare Apple,
        Microsoft, Amazon”. EquityLens ranks companies by score, confidence,
        quality, and risk.
      </p>

      <div className="mx-auto mt-8 grid max-w-4xl gap-4 md:grid-cols-3">
        <StarterFeature
          icon={<Sparkles className="h-5 w-5" />}
          title="Winner Selection"
          description="Highlights the strongest company with reasoning."
        />

        <StarterFeature
          icon={<Brain className="h-5 w-5" />}
          title="Tradeoff Reasoning"
          description="Explains why one company ranks above another."
        />

        <StarterFeature
          icon={<ShieldCheck className="h-5 w-5" />}
          title="Data Quality"
          description="Shows provider, fallback, and metadata transparency."
        />
      </div>
    </section>
  );
}

function StarterFeature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 text-left dark:border-white/10 dark:bg-slate-950/60">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-cyan-600 shadow-sm dark:bg-white/10 dark:text-cyan-300">
        {icon}
      </div>

      <h3 className="font-black text-slate-950 dark:text-white">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}
