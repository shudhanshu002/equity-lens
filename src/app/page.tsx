"use client";

import { useEffect, useRef, useState } from "react";
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
import { SectorResearchView } from "@/components/research/sector-research-view";
import { AppFooter } from "@/components/research/app-footer";
import {
  BarChart3,
  Brain,
  Database,
  FileText,
  GitBranch,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
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

  const [company, setCompany] = useState("");
  const [researchQuery, setResearchQuery] = useState("");
  const [researchDuration, setResearchDuration] = useState(0);
  const [companies, setCompanies] = useState("");
  const [compareQuery, setCompareQuery] = useState("");
  const [compareDuration, setCompareDuration] = useState(0);

  const [report, setReport] = useState<InvestmentResearchReport | null>(null);
  const [comparison, setComparison] =
    useState<ComparisonApiResponse["data"]>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [turns, setTurns] = useState<Array<{
    query: string;
    report?: InvestmentResearchReport;
    sectorResult?: any;
    followUpResult?: any;
    duration?: number;
  }>>([]);

  async function runUniversalQuery(query: string, startedAt: number) {
    const response = await fetch("/api/intelligence", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        currentReport: report ?? undefined,
        currentCompare: comparison ?? undefined,
      }),
    });

    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.error ?? "Request failed.");
    }

    if (json.intent === "SINGLE_COMPANY_RESEARCH") {
      setReport(json.data);
      setComparison(undefined);
      setActiveTab("research");
      setTurns((current) => [
        ...current.filter((turn) => !turn.sectorResult && !turn.followUpResult),
        {
          query,
          report: json.data,
          duration: Math.max(1, Math.round((Date.now() - startedAt) / 1000)),
        },
      ]);

      const saveResult = await autoSaveResearchHistory(json.data, {
        loggedIn,
        enableLocalFallback: true,
      });
      setHistorySaveResult(saveResult);
      return;
    }

    if (json.intent === "COMPANY_COMPARISON") {
      setComparison(json.data);
      setReport(null);
      setActiveTab("compare");

      const saveResult = await autoSaveComparisonHistory(json.data, {
        loggedIn,
        enableLocalFallback: true,
      });
      setHistorySaveResult(saveResult);
      return;
    }

    if (json.intent === "SECTOR_RESEARCH") {
      setReport(null);
      setComparison(undefined);
      setActiveTab("research");
      setTurns((current) => [
        ...current.filter((turn) => !turn.report),
        {
          query,
          sectorResult: json.data,
        },
      ]);
      return;
    }

    if (json.intent === "FOLLOW_COMPANY") {
      if (json.data?.company) {
        const target = json.data.company;
        const syncResponse = await fetch("/api/user/watchlist/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: [{
              company: target.name,
              symbol: target.symbol,
              thesis: `Followed from EquityLens research commands.`,
              status: "Watchlist",
              score: 50,
              risk: "Medium",
            }],
          }),
        }).catch(() => null);

        if (!syncResponse?.ok && typeof window !== "undefined") {
          const key = "equitylens_followed_companies";
          let existing: any[] = [];
          try { existing = JSON.parse(localStorage.getItem(key) ?? "[]"); } catch { existing = []; }
          const item = { ...target, followedAt: new Date().toISOString() };
          localStorage.setItem(key, JSON.stringify([item, ...existing.filter((old) => old.symbol !== target.symbol)]));
        }
      }
      setActiveTab("portfolio");
      return;
    }

    // follow-up response
    setTurns((current) => [
      ...current,
      {
        query,
        followUpResult: json.data,
      },
    ]);
  }

  async function handleResearch(customCompany?: string) {
    const cleanedCompany = (customCompany ?? company).trim();
    const startedAt = Date.now();

    if (!cleanedCompany || loading) return;

    setError("");
    setLoading(true);
    setResearchQuery(cleanedCompany);
    setResearchDuration(0);
    setCompany("");

    try {
      await runUniversalQuery(cleanedCompany, startedAt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setResearchDuration(Math.max(1, Math.round((Date.now() - startedAt) / 1000)));
      setLoading(false);
    }
  }

  async function handleCompare(customCompanies?: string) {
    const startedAt = Date.now();
    if (loading) return;

    const cleanedCompare = (customCompanies ?? companies).trim();
    if (!cleanedCompare) return;

    setError("");
    setLoading(true);
    setCompareQuery(cleanedCompare);
    setCompareDuration(0);
    setCompanies("");

    try {
      // The compare workspace accepts a bare comma-separated list. Make the
      // intent explicit so it can never fall through to company research.
      await runUniversalQuery(`Compare ${cleanedCompare}`, startedAt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setCompareDuration(Math.max(1, Math.round((Date.now() - startedAt) / 1000)));
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
        <div className="space-y-8">
          <PremiumHomePage
            onTabChange={setActiveTab}
            onPickResearch={pickResearch}
            onPickCompare={pickCompare}
          />
        </div>
      )}

      {activeTab === "research" && (
        <div className="space-y-8">
          <ResearchWorkspace
            company={company}
            researchQuery={researchQuery}
            researchDuration={researchDuration}
            setCompany={setCompany}
            companies={companies}
            setCompanies={setCompanies}
            loading={loading}
            error={error}
            report={report}
            comparison={comparison}
            onResearch={handleResearch}
            onCompare={handleCompare}
            onNewChat={() => {
              setCompany("");
              setReport(null);
              setComparison(undefined);
              setError("");
            }}
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
            turns={turns}
            setTurns={setTurns}
          />
        </div>
      )}

      {activeTab === "compare" && (
        <div className="space-y-8">
          <CompareWorkspace
            company={company}
            setCompany={setCompany}
            companies={companies}
            compareQuery={compareQuery}
            compareDuration={compareDuration}
            setCompanies={setCompanies}
            loading={loading}
            error={error}
            report={report}
            comparison={comparison}
            onResearch={handleResearch}
            onCompare={handleCompare}
            onNewChat={() => {
              setCompanies("");
              setComparison(undefined);
              setReport(null);
              setError("");
            }}
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
        </div>
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

      {activeTab !== "research" &&
        activeTab !== "compare" &&
        activeTab !== "portfolio" &&
        activeTab !== "exports" &&
        activeTab !== "settings" && <AppFooter />}

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
  researchQuery,
  researchDuration,
  setCompany,
  companies,
  setCompanies,
  loading,
  error,
  report,
  comparison,
  onResearch,
  onCompare,
  onNewChat,
  onOpenReport,
  onOpenComparison,
  turns,
  setTurns,
}: {
  company: string;
  researchQuery: string;
  researchDuration: number;
  setCompany: React.Dispatch<React.SetStateAction<string>>;
  companies: string;
  setCompanies: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  error: string;
  report: InvestmentResearchReport | null;
  comparison: ComparisonApiResponse["data"] | undefined;
  onResearch: (customCompany?: string) => void;
  onCompare: () => void;
  onNewChat: () => void;
  onOpenReport: (report: InvestmentResearchReport) => void;
  onOpenComparison: (comparison: NonNullable<ComparisonApiResponse["data"]>) => void;
  turns: Array<{
    query: string;
    report?: InvestmentResearchReport;
    sectorResult?: any;
    followUpResult?: any;
    duration?: number;
  }>;
  setTurns: React.Dispatch<React.SetStateAction<Array<{
    query: string;
    report?: InvestmentResearchReport;
    sectorResult?: any;
    followUpResult?: any;
    duration?: number;
  }>>>;
}) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [conversationId, setConversationId] = useState(() => createConversationId());
  const chatViewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const selector = loading ? "[data-pending-turn]" : "[data-chat-turn]";
    const frame = window.requestAnimationFrame(() => {
      const nodes = chatViewportRef.current?.querySelectorAll<HTMLElement>(selector);
      nodes?.[nodes.length - 1]?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [loading, turns.length]);

  return (
    <div className="relative -mt-1">
      <button
        type="button"
        onClick={() => setHistoryOpen((open) => !open)}
        className="absolute -left-2 top-14 z-20 inline-flex h-9 items-center gap-2 rounded-lg px-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-white/10 dark:hover:text-white sm:-left-4 lg:-left-6"
      >
        {historyOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
        {historyOpen ? "Close history" : "Open history"}
      </button>

      <div
        className={`fixed inset-0 z-[60] transition ${historyOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!historyOpen}
      >
        <button
          type="button"
          aria-label="Close history"
          onClick={() => setHistoryOpen(false)}
          className={`absolute inset-0 bg-slate-950/25 backdrop-blur-[1px] transition-opacity duration-300 lg:bg-transparent lg:backdrop-blur-none ${historyOpen ? "opacity-100" : "opacity-0"}`}
        />
        <div className={`absolute left-0 top-0 h-full w-[290px] border-r border-slate-200 bg-slate-50 p-3 shadow-2xl transition-transform duration-300 ease-out dark:border-white/10 dark:bg-slate-950 ${historyOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="mb-3 flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setConversationId(createConversationId());
                setTurns([]);
                onNewChat();
                setHistoryOpen(false);
              }}
              className="inline-flex h-10 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              <Plus className="h-4 w-4" />
              New chat
            </button>
            <button
              type="button"
              onClick={() => setHistoryOpen(false)}
              aria-label="Close history"
              title="Close history"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-200 dark:hover:bg-white/10"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </div>
          <RecentHistory
            compact
            conversationId={conversationId}
            onConversationSelect={setConversationId}
            currentReport={report}
            currentComparison={comparison}
            onOpenReport={(savedReport) => {
              setTurns([{ query: savedReport.company.name, report: savedReport, duration: 0 }]);
              onOpenReport(savedReport);
              setHistoryOpen(false);
            }}
            onOpenComparison={(savedComparison) => {
              onOpenComparison(savedComparison);
              setHistoryOpen(false);
            }}
          />
        </div>
      </div>

      <div className="min-w-0">
        {!loading && turns.length === 0 && !report && (
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
          </div>
        )}

        {(loading || turns.length > 0 || report) && (
          <div ref={chatViewportRef} className="mx-auto max-w-5xl pb-8">
            {turns.map((turn, index) => {
              if (turn.report) {
                return (
                  <ResearchChatTurn
                    key={`report-${index}`}
                    query={turn.query}
                    report={turn.report}
                    duration={turn.duration ?? 0}
                  />
                );
              }
              if (turn.sectorResult) {
                return (
                  <div key={`sector-${index}`} data-chat-turn className="mb-12 scroll-mt-24">
                    <div className="mb-8 flex justify-end">
                      <div className="max-w-[80%] rounded-2xl rounded-br-md bg-slate-200 px-4 py-3 text-sm font-medium text-slate-900 dark:bg-white/10 dark:text-white">
                        Analyze {turn.query}
                      </div>
                    </div>
                    <div className="grid grid-cols-[32px_minmax(0,1fr)] gap-3 sm:grid-cols-[40px_minmax(0,1fr)] sm:gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-xs font-bold text-white dark:bg-white dark:text-slate-950 sm:h-10 sm:w-10">EL</div>
                      <div className="chat-response-reveal min-w-0 space-y-7">
                        <div>
                          <p className="text-sm font-semibold text-slate-950 dark:text-white">EquityLens</p>
                          <p className="text-xs text-slate-500">Sector analysis ready.</p>
                        </div>
                        <SectorResearchView
                          query={turn.query}
                          result={turn.sectorResult}
                          onSelectCompany={(selected) => {
                            onResearch(selected);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              }
              if (turn.followUpResult) {
                const followUp = turn.followUpResult;
                return (
                  <div key={`follow-${index}`} data-chat-turn className="mb-12 scroll-mt-24">
                    <div className="mb-8 flex justify-end">
                      <div className="max-w-[80%] rounded-2xl rounded-br-md bg-slate-200 px-4 py-3 text-sm font-medium text-slate-900 dark:bg-white/10 dark:text-white">
                        {turn.query}
                      </div>
                    </div>
                    <div className="grid grid-cols-[32px_minmax(0,1fr)] gap-3 sm:grid-cols-[40px_minmax(0,1fr)] sm:gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-xs font-bold text-white dark:bg-white dark:text-slate-950 sm:h-10 sm:w-10">EL</div>
                      <div className="chat-response-reveal min-w-0 space-y-7">
                        <div>
                          <p className="text-sm font-semibold text-slate-950 dark:text-white">EquityLens</p>
                          <p className="text-xs text-slate-500">Follow-up response generated.</p>
                        </div>
                        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.02]">
                          <div className="flex flex-wrap gap-2">
                            <FollowUpBadge label={followUp.intent} />
                            <FollowUpBadge label={followUp.answer.sentiment} />
                            <FollowUpBadge label={formatFollowUpImpact(followUp.answer.decisionImpact)} />
                          </div>
                          <p className="mt-5 whitespace-pre-line text-sm leading-7 text-slate-700 dark:text-slate-200">
                            {followUp.answer.answer}
                          </p>
                          {followUp.answer.keyPoints?.length ? (
                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/10">
                              <p className="text-sm font-black text-slate-950 dark:text-white">Key Points</p>
                              <ul className="mt-2 space-y-2">
                                {followUp.answer.keyPoints.map((point: string) => (
                                  <li key={point} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                                    <span>{point}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : null}
                          {followUp.sources?.length ? (
                            <div className="mt-5 border-t border-slate-100 pt-5 dark:border-white/10">
                              <p className="text-sm font-black text-slate-950 dark:text-white">Sources</p>
                              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                {followUp.sources.slice(0, 4).map((source: any, sourceIndex: number) => (
                                  <a key={`${source.title}-${sourceIndex}`} href={source.url || undefined} target={source.url ? "_blank" : undefined} rel={source.url ? "noreferrer" : undefined} className={`rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/5 ${source.url ? "transition hover:border-emerald-300" : "pointer-events-none"}`}>
                                    <p className="line-clamp-2 text-xs font-bold text-slate-800 dark:text-slate-100">{source.title}</p>
                                    <p className="mt-1 text-[11px] text-slate-500">{source.source}{source.publishedAt ? ` · ${source.publishedAt}` : ""}</p>
                                  </a>
                                ))}
                              </div>
                            </div>
                          ) : null}
                          {followUp.answer.followUpQuestions?.length ? (
                            <div className="mt-5 border-t border-slate-100 pt-5 dark:border-white/10">
                              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Good questions to ask next</p>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {followUp.answer.followUpQuestions.map((question: string) => (
                                  <button key={question} type="button" onClick={() => setCompany(question)} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-emerald-300 hover:text-slate-950 dark:border-white/10 dark:text-slate-300 dark:hover:text-white">
                                    {question}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            })}

            {loading && (
              <div data-pending-turn className="mb-10 scroll-mt-24">
                <div className="mb-8 flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-br-md bg-slate-200 px-4 py-3 text-sm font-medium text-slate-900 dark:bg-white/10 dark:text-white">
                    Analyze {researchQuery}
                  </div>
                </div>
                <div className="grid grid-cols-[32px_minmax(0,1fr)] gap-3 sm:grid-cols-[40px_minmax(0,1fr)] sm:gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-xs font-bold text-white dark:bg-white dark:text-slate-950 sm:h-10 sm:w-10">EL</div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-950 dark:text-white">EquityLens</p>
                    <AgentProgressTimeline loading={loading} variant="research" />
                  </div>
                </div>
              </div>
            )}

            <div className="sticky bottom-4 z-20 bg-slate-50/90 py-2 backdrop-blur-xl dark:bg-slate-950/90">
              <ConversationalResearchPanel
                variant="research"
                conversationActive
                contextCompany={report?.company.name}
                company={company}
                setCompany={setCompany}
                companies={companies}
                setCompanies={setCompanies}
                loading={loading}
                error={error}
                onResearch={onResearch}
                onCompare={onCompare}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ResearchChatTurn({ query, report, duration }: { query: string; report: InvestmentResearchReport; duration: number }) {
  return (
    <div data-chat-turn className="mb-12 scroll-mt-24">
      <div className="mb-8 flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-md bg-slate-200 px-4 py-3 text-sm font-medium text-slate-900 dark:bg-white/10 dark:text-white">
          Analyze {query}
        </div>
      </div>
      <div className="grid grid-cols-[32px_minmax(0,1fr)] gap-3 sm:grid-cols-[40px_minmax(0,1fr)] sm:gap-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-xs font-bold text-white dark:bg-white dark:text-slate-950 sm:h-10 sm:w-10">EL</div>
        <div className="chat-response-reveal min-w-0 space-y-7">
          <div>
            <p className="text-sm font-semibold text-slate-950 dark:text-white">EquityLens</p>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
              <span>Research completed for {report.company.name}.</span>
              {duration > 0 && <span className="font-mono text-xs">Worked for {formatResearchDuration(duration)}</span>}
            </div>
          </div>
          <AgentGraphVisualization mode="research" company={report.company.name} trace={report.metadata.trace ?? []} isRunning={false} />
          <AuthRequiredInline title="Login to save this report." description="You can still run research, but saving to database requires login." />
          <ReportView report={report} compact />
        </div>
      </div>
    </div>
  );
}

function FollowUpBadge({ label }: { label?: string }) {
  if (!label) return null;
  return <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">{label.replaceAll("_", " ")}</span>;
}

function formatFollowUpImpact(value?: string) {
  if (value === "IMPROVES_CASE") return "Improves case";
  if (value === "WEAKENS_CASE") return "Weakens case";
  if (value === "NO_MAJOR_CHANGE") return "No major change";
  return "Insufficient data";
}

function formatResearchDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function createConversationId() {
  return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function CompareWorkspace({
  company,
  setCompany,
  companies,
  compareQuery,
  compareDuration,
  setCompanies,
  loading,
  error,
  report,
  comparison,
  onResearch,
  onCompare,
  onNewChat,
  onOpenReport,
  onOpenComparison,
}: {
  company: string;
  setCompany: React.Dispatch<React.SetStateAction<string>>;
  companies: string;
  compareQuery: string;
  compareDuration: number;
  setCompanies: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  error: string;
  report: InvestmentResearchReport | null;
  comparison: ComparisonApiResponse["data"] | undefined;
  onResearch: () => void;
  onCompare: () => void;
  onNewChat: () => void;
  onOpenReport: (report: InvestmentResearchReport) => void;
  onOpenComparison: (comparison: NonNullable<ComparisonApiResponse["data"]>) => void;
}) {
  type ComparisonData = NonNullable<ComparisonApiResponse["data"]>;
  const [historyOpen, setHistoryOpen] = useState(false);
  const [conversationId, setConversationId] = useState(() => createConversationId());
  const [turns, setTurns] = useState<Array<{ query: string; comparison: ComparisonData; duration: number }>>([]);
  const chatViewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!comparison || loading) return;
    setTurns((current) => {
      if (current.some((turn) => turn.comparison.metadata.generatedAt === comparison.metadata.generatedAt)) return current;
      return [...current, { query: compareQuery || comparison.companies.map((item) => item.company.name).join(", "), comparison, duration: compareDuration }];
    });
  }, [compareDuration, compareQuery, comparison, loading]);

  useEffect(() => {
    const selector = loading ? "[data-pending-turn]" : "[data-chat-turn]";
    const frame = window.requestAnimationFrame(() => {
      const nodes = chatViewportRef.current?.querySelectorAll<HTMLElement>(selector);
      nodes?.[nodes.length - 1]?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [loading, turns.length]);

  return (
    <div className="relative -mt-1">
      <button type="button" onClick={() => setHistoryOpen((open) => !open)} className="absolute -left-2 top-14 z-20 inline-flex h-9 items-center gap-2 rounded-lg px-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-white/10 dark:hover:text-white sm:-left-4 lg:-left-6">
        {historyOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
        {historyOpen ? "Close history" : "Open history"}
      </button>

      <div className={`fixed inset-0 z-[60] transition ${historyOpen ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!historyOpen}>
        <button type="button" aria-label="Close history" onClick={() => setHistoryOpen(false)} className={`absolute inset-0 bg-slate-950/25 backdrop-blur-[1px] transition-opacity duration-300 lg:bg-transparent lg:backdrop-blur-none ${historyOpen ? "opacity-100" : "opacity-0"}`} />
        <div className={`absolute left-0 top-0 h-full w-[290px] border-r border-slate-200 bg-slate-50 p-3 shadow-2xl transition-transform duration-300 ease-out dark:border-white/10 dark:bg-slate-950 ${historyOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="mb-3 flex items-center gap-2 pt-1">
            <button type="button" onClick={() => { setConversationId(createConversationId()); setTurns([]); onNewChat(); setHistoryOpen(false); }} className="inline-flex h-10 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10">
              <Plus className="h-4 w-4" /> New chat
            </button>
            <button type="button" onClick={() => setHistoryOpen(false)} aria-label="Close history" className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-200 dark:hover:bg-white/10"><PanelLeftClose className="h-4 w-4" /></button>
          </div>
          <RecentHistory compact conversationId={conversationId} onConversationSelect={setConversationId} currentReport={report} currentComparison={comparison} onOpenReport={onOpenReport} onOpenComparison={(savedComparison) => { setTurns([{ query: savedComparison.companies.map((item) => item.company.name).join(", "), comparison: savedComparison, duration: 0 }]); onOpenComparison(savedComparison); setHistoryOpen(false); }} />
        </div>
      </div>

      {!loading && turns.length === 0 && !comparison && (
        <div className="space-y-8">
          <ConversationalResearchPanel variant="compare" company={company} setCompany={setCompany} companies={companies} setCompanies={setCompanies} loading={loading} error={error} onResearch={onResearch} onCompare={onCompare} />
        </div>
      )}

      {(loading || turns.length > 0 || comparison) && (
        <div ref={chatViewportRef} className="mx-auto max-w-5xl pb-8">
          {turns.map((turn) => <CompareChatTurn key={turn.comparison.metadata.generatedAt} query={turn.query} comparison={turn.comparison} duration={turn.duration} />)}
          {loading && (
            <div data-pending-turn className="mb-10 scroll-mt-24">
              <div className="mb-8 flex justify-end"><div className="max-w-[80%] rounded-2xl rounded-br-md bg-slate-200 px-4 py-3 text-sm font-medium text-slate-900 dark:bg-white/10 dark:text-white">Compare {compareQuery}</div></div>
              <div className="grid grid-cols-[32px_minmax(0,1fr)] gap-3 sm:grid-cols-[40px_minmax(0,1fr)] sm:gap-4"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-xs font-bold text-white dark:bg-white dark:text-slate-950 sm:h-10 sm:w-10">EL</div><div className="min-w-0"><p className="text-sm font-semibold text-slate-950 dark:text-white">EquityLens</p><AgentProgressTimeline loading={loading} variant="compare" /></div></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CompareChatTurn({ query, comparison, duration }: { query: string; comparison: NonNullable<ComparisonApiResponse["data"]>; duration: number }) {
  return (
    <div data-chat-turn className="mb-12 scroll-mt-24">
      <div className="mb-8 flex justify-end"><div className="max-w-[80%] rounded-2xl rounded-br-md bg-slate-200 px-4 py-3 text-sm font-medium text-slate-900 dark:bg-white/10 dark:text-white">Compare {query}</div></div>
      <div className="grid grid-cols-[32px_minmax(0,1fr)] gap-3 sm:grid-cols-[40px_minmax(0,1fr)] sm:gap-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-xs font-bold text-white dark:bg-white dark:text-slate-950 sm:h-10 sm:w-10">EL</div>
        <div className="chat-response-reveal min-w-0 space-y-7">
          <div><p className="text-sm font-semibold text-slate-950 dark:text-white">EquityLens</p><div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500 dark:text-slate-400"><span>Comparison completed.</span>{duration > 0 && <span className="font-mono text-xs">Worked for {formatResearchDuration(duration)}</span>}</div></div>
          <AuthRequiredInline title="Login to save this comparison." description="You can still compare companies, but saving to database requires login." />
          <CompareView comparison={comparison} compact />
        </div>
      </div>
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
