"use client";

import { useState } from "react";
import {
  compareCompanies,
  ComparisonApiResponse,
  researchCompany,
} from "@/lib/api-client";
import { InvestmentResearchReport } from "@/lib/types/research";
import {
  AppTab,
  FloatingNavbar,
} from "@/components/research/floating-navbar";
import { LandingPage } from "@/components/research/landing-page";
import { SearchPanel } from "@/components/research/search-panel";
import { WorkspaceOverview } from "@/components/research/workspace-overview";
import { EmptyState } from "@/components/research/empty-state";
import { LoadingAgent } from "@/components/research/loading-agent";
import { SystemStatus } from "@/components/research/system-status";
import { ReportView } from "@/components/research/report-view";
import { CompareView } from "@/components/research/compare-view";
import { AppFooter } from "@/components/research/app-footer";
import { MethodologySection } from "@/components/research/methodology-section";
import { SubmissionSection } from "@/components/research/submission-section";
import { HistoryCenter } from "@/components/research/history-center";
import { RecentHistory } from "@/components/research/recent-history";
import { CommandPalette } from "@/components/research/command-palette";

type SearchMode = "research" | "compare";



export default function Home() {

  async function runDemoResearch() {
  setCompany("Nvidia");
  setError("");
  setLoading(true);
  setComparison(undefined);

  try {
    const response = await researchCompany("Nvidia");

    if (!response.success || !response.data) {
      throw new Error(response.error ?? "Failed to run research.");
    }

    setReport(response.data);
    setActiveTab("research");
  } catch (err) {
    setError(err instanceof Error ? err.message : "Something went wrong.");
  } finally {
    setLoading(false);
  }
}

async function runDemoCompare() {
  setCompanies("Nvidia, Tesla, Netflix");
  setError("");
  setLoading(true);
  setReport(null);

  try {
    const response = await compareCompanies(["Nvidia", "Tesla", "Netflix"]);

    if (!response.success || !response.data) {
      throw new Error(response.error ?? "Failed to compare companies.");
    }

    setComparison(response.data);
    setActiveTab("compare");
  } catch (err) {
    setError(err instanceof Error ? err.message : "Something went wrong.");
  } finally {
    setLoading(false);
  }
}

  const [activeTab, setActiveTab] = useState<AppTab>("home");
  const [mode, setMode] = useState<SearchMode>("research");

  const [company, setCompany] = useState("Apple");
  const [companies, setCompanies] = useState("Nvidia, Tesla, Netflix");

  const [report, setReport] = useState<InvestmentResearchReport | null>(null);
  const [comparison, setComparison] =
    useState<ComparisonApiResponse["data"]>(undefined);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function changeTab(tab: AppTab) {
    setActiveTab(tab);

    if (tab === "research") {
      setMode("research");
    }

    if (tab === "compare") {
      setMode("compare");
    }
  }

  async function handleResearch() {
    setError("");
    setLoading(true);
    setComparison(undefined);

    try {
      const response = await researchCompany(company);

      if (!response.success || !response.data) {
        throw new Error(response.error ?? "Failed to run research.");
      }

      setReport(response.data);
      setActiveTab("research");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCompare() {
    setError("");
    setLoading(true);
    setReport(null);

    try {
      const parsed = companies
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const response = await compareCompanies(parsed);

      if (!response.success || !response.data) {
        throw new Error(response.error ?? "Failed to compare companies.");
      }

      setComparison(response.data);
      setActiveTab("compare");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-slate-50 text-slate-950 transition-colors dark:bg-[#020617] dark:text-white">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-[-10%] top-[-10%] h-[420px] w-[420px] rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-400/10" />
        <div className="absolute right-[-10%] top-[20%] h-[420px] w-[420px] rounded-full bg-violet-400/20 blur-3xl dark:bg-violet-400/10" />
        <div className="absolute bottom-[-20%] left-[30%] h-[420px] w-[420px] rounded-full bg-emerald-400/10 blur-3xl dark:bg-emerald-400/5" />
      </div>

      <FloatingNavbar activeTab={activeTab} onTabChange={changeTab} />

      <CommandPalette
        onTabChange={changeTab}
        onPickResearch={(selectedCompany) => {
          setCompany(selectedCompany);
          setMode("research");
        }}
        onPickCompare={(selectedCompanies) => {
          setCompanies(selectedCompanies);
          setMode("compare");
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-5 pb-8 md:px-10">
        {activeTab === "home" && (
          <LandingPage
            onTabChange={changeTab}
            onPickResearch={(selectedCompany) => {
              setCompany(selectedCompany);
              setMode("research");
            }}
            onPickCompare={(selectedCompanies) => {
              setCompanies(selectedCompanies);
              setMode("compare");
            }}
          />
        )}

        {activeTab === "research" && (
          <section className="pt-32">
            <PageIntro
              eyebrow="Research workspace"
              title="Single Company Research"
              description="Run the LangGraph agent on one company and generate an explainable investment memo."
            />

            <WorkspaceOverview variant="research" />

            <SearchPanel
              variant="research"
              company={company}
              setCompany={setCompany}
              companies={companies}
              setCompanies={setCompanies}
              loading={loading}
              error={error}
              onResearch={handleResearch}
              onCompare={handleCompare}
            />

            <SystemStatus />

            {loading && <LoadingAgent variant="research" />}

            {!loading && !report && (
              <EmptyState
                variant="research"
                onPrimaryAction={runDemoResearch}
              />
            )}

            {!loading && report && <ReportView report={report} />}

            <RecentHistory
              currentReport={report}
              currentComparison={undefined}
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
          </section>
        )}

        {activeTab === "compare" && (
          <section className="pt-32">
            <PageIntro
              eyebrow="Comparison workspace"
              title="Compare Companies"
              description="Compare 2–3 companies side-by-side and generate a ranked AI investment comparison."
            />

            <WorkspaceOverview variant="compare" />

            <SearchPanel
              variant="compare"
              company={company}
              setCompany={setCompany}
              companies={companies}
              setCompanies={setCompanies}
              loading={loading}
              error={error}
              onResearch={handleResearch}
              onCompare={handleCompare}
            />

            <SystemStatus />

            {loading && <LoadingAgent variant="compare" />}

            {!loading && !comparison && (
              <EmptyState
                variant="compare"
                onPrimaryAction={runDemoCompare}
              />
            )}

            {!loading && comparison && (
              <CompareView comparison={comparison} />
            )}

            <RecentHistory
              currentReport={null}
              currentComparison={comparison}
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
          </section>
        )}

        {activeTab === "history" && (
          <HistoryCenter
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

        {activeTab === "home" && <MethodologySection />}

        {activeTab === "home" && <SubmissionSection />}

        <AppFooter />
      </div>
    </main>
  );
}

function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-8">
      <p className="mb-2 text-sm font-black uppercase tracking-[0.3em] text-cyan-500">
        {eyebrow}
      </p>

      <h1 className="text-4xl font-black tracking-tight text-slate-950 dark:text-white md:text-5xl">
        {title}
      </h1>

      <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
        {description}
      </p>
    </div>
  );
}