import type React from "react";
import {
    Activity,
    AlertTriangle,
    BarChart3,
    Brain,
    Building2,
    CheckCircle2,
    Database,
    FileText,
    Globe2,
    ExternalLink,
    Newspaper,
    ShieldAlert,
    ShieldCheck,
    TrendingUp,
    XCircle,
} from "lucide-react";
import { ReportExport } from "@/components/research/report-export";
import { formatMetric, formatNumber, formatMarketCap } from "@/lib/frontend/format";
import { InvestmentResearchReport } from "@/lib/types/research";
import { DecisionActionPanel } from "@/components/research/decision-panel";

type ReportViewProps = {
    report: InvestmentResearchReport;
    compact?: boolean;
};

function decisionStyle(decision: string) {
    if (decision === "INVEST") {
        return "border-emerald-400/20 bg-emerald-400/10 text-emerald-600 dark:text-emerald-300";
    }

    if (decision === "PASS") {
        return "border-red-400/20 bg-red-400/10 text-red-600 dark:text-red-300";
    }

    return "border-amber-400/20 bg-amber-400/10 text-amber-600 dark:text-amber-300";
}

function sentimentStyle(sentiment?: string) {
    if (sentiment === "POSITIVE") {
        return "border-emerald-400/20 bg-emerald-400/10 text-emerald-600 dark:text-emerald-300";
    }

    if (sentiment === "NEGATIVE") {
        return "border-red-400/20 bg-red-400/10 text-red-600 dark:text-red-300";
    }

    return "border-slate-200 bg-slate-100 text-slate-600 dark:border-white/10 dark:bg-white/10 dark:text-slate-300";
}

export function ReportView({ report, compact = false }: ReportViewProps) {
    const isGeneralCompany = report.company.coverageMode === "GENERAL_COMPANY";
    const isPublicEquity = report.company.coverageMode === "PUBLIC_EQUITY";
    const isStale = report.metadata.staleAfter ? new Date(report.metadata.staleAfter).getTime() < Date.now() : false;

    if (compact) return <CompactResearchReport report={report} isStale={isStale} />;

    const scoreRows = [
        {
            label: "Growth",
            value: report.score.growth,
        },
        {
            label: "Profitability",
            value: report.score.profitability,
        },
        {
            label: "Balance Sheet",
            value: report.score.balanceSheet,
        },
        {
            label: "Valuation",
            value: report.score.valuation,
        },
        {
            label: "Sentiment",
            value: report.score.sentiment,
        },
    ];

    const financialRows = [
        {
            label: "Revenue Growth YoY",
            value: formatMetric(report.financials.revenueGrowthYoY, "%"),
        },
        {
            label: "Profit Margin",
            value: formatMetric(report.financials.profitMargin, "%"),
        },
        {
            label: "Operating Margin",
            value: formatMetric(report.financials.operatingMargin, "%"),
        },
        {
            label: "Return on Equity",
            value: formatMetric(report.financials.returnOnEquity, "%"),
        },
        {
            label: "Debt to Equity",
            value: formatMetric(report.financials.debtToEquity),
        },
        {
            label: "Current Ratio",
            value: formatMetric(report.financials.currentRatio),
        },
        {
            label: "P/E Ratio",
            value: formatMetric(report.financials.peRatio),
        },
        {
            label: "Forward P/E",
            value: formatMetric(report.financials.forwardPe),
        },
        {
            label: "PEG Ratio",
            value: formatMetric(report.financials.pegRatio),
        },
        {
            label: "Price to Sales",
            value: formatMetric(report.financials.priceToSales),
        },
        {
            label: "EPS",
            value: formatMetric(report.financials.eps),
        },
        {
            label: "Beta",
            value: formatMetric(report.financials.beta),
        },
    ];

    return (
        <section className="space-y-8">
            {isStale ? (
                <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-5 py-4 text-sm font-bold text-amber-700 dark:text-amber-300">
                    This report is stale. Rerun company research before relying on its recommendation or market context.
                </div>
            ) : null}
            <div className="overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/30">
                <div className="grid lg:grid-cols-[1fr_0.45fr]">
                    <div className="p-8 md:p-10">
                        <div className="mb-6 flex flex-wrap items-start justify-between gap-5">
                            <div>
                                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-600 dark:text-cyan-300">
                                    <Building2 className="h-4 w-4" />
                                    {isGeneralCompany ? "N/A" : report.company.symbol}
                                </div>

                                <h2 className="text-4xl font-black tracking-tight text-slate-950 dark:text-white md:text-5xl">
                                    {report.company.name}
                                </h2>

                                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                                    {isPublicEquity
                                      ? `${report.company.sector ?? "UNKNOWN"} · ${report.company.industry ?? "UNKNOWN"} · ${report.company.exchange}`
                                      : "GENERAL COMPANY RESEARCH · NO PUBLIC TICKER RESOLVED"}
                                </p>
                            </div>

                            <div className="flex flex-col items-start gap-3 sm:items-end">
                                <span
                                    className={`rounded-full border px-5 py-2 text-sm font-black ${decisionStyle(
                                        report.decision
                                    )}`}
                                >
                                    {report.decision}
                                </span>

                                <ReportExport report={report} />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-4">
                            <HeroMetric
                                icon={<TrendingUp className="h-5 w-5" />}
                                label="Total Score"
                                value={`${report.score.total}/100`}
                            />

                            <HeroMetric
                                icon={<ShieldCheck className="h-5 w-5" />}
                                label="Confidence"
                                value={`${report.confidence}/100`}
                            />

                            <HeroMetric
                                icon={<Database className="h-5 w-5" />}
                                label="Financial Source"
                                value={report.metadata.financialDataSource ?? "Unknown"}
                            />

                            <HeroMetric
                                icon={<Brain className="h-5 w-5" />}
                                label="Memo Provider"
                                value={report.metadata.memoProvider ?? "Unknown"}
                            />
                        </div>

                        <div className="mt-8 rounded-[2rem] border border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-slate-950/60">
                            <div className="mb-4 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-violet-500" />
                                <h3 className="text-xl font-black text-slate-950 dark:text-white">
                                    Investment Thesis
                                </h3>
                            </div>

                            <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                                {report.thesis}
                            </p>
                        </div>
                    </div>

                    <div className="relative bg-slate-950 p-8 text-white md:p-10">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.26),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(139,92,246,0.24),_transparent_35%)]" />

                        <div className="relative">
                            <p className="mb-3 text-sm font-black uppercase tracking-[0.3em] text-cyan-300">
                                Decision Card
                            </p>

                            <div className="flex h-32 w-32 items-center justify-center rounded-[2rem] border border-white/10 bg-white/10 text-5xl font-black">
                                {report.score.total}
                            </div>

                            <h3 className="mt-6 text-3xl font-black">{report.decision}</h3>

                            <p className="mt-3 text-sm leading-7 text-slate-300">
                                The score is calculated deterministically from financial,
                                valuation, balance sheet, and sentiment signals.
                            </p>

                            <div className="mt-6 space-y-3">
                                <DarkInfoRow
                                    label="Market Cap"
                                    value={formatMarketCap(report.company.marketCap, report.company.currency)}
                                />

                                <DarkInfoRow
                                    label="Currency"
                                    value={report.company.currency ?? "N/A"}
                                />

                                <DarkInfoRow
                                    label="Country"
                                    value={report.company.country ?? "N/A"}
                                />
                            </div>

                            <DecisionActionPanel report={report} />
                        </div>
                    </div>
                </div>
            </div>

            {report.metadata.warnings.length > 0 && (
                <div className="rounded-[2rem] border border-amber-400/20 bg-amber-400/10 p-6">
                    <div className="mb-4 flex items-center gap-2 text-amber-600 dark:text-amber-300">
                        <AlertTriangle className="h-5 w-5" />
                        <h3 className="font-black">Data Quality Warnings</h3>
                    </div>

                    <ul className="space-y-2">
                        {report.metadata.warnings.map((warning, index) => (
                            <li
                                key={index}
                                className="text-sm leading-6 text-slate-700 dark:text-slate-300"
                            >
                                {warning}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {report.metadata.evidenceQuality ? (
                <div className="rounded-[2rem] border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.04] md:p-8">
                    <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.22em] text-violet-600 dark:text-violet-300">Evidence quality</p>
                            <h3 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{report.metadata.evidenceQuality.level}</h3>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{report.metadata.evidenceQuality.financialCompleteness}% financial-field completeness · {report.metadata.evidenceQuality.hasRealNews ? "Current research available" : "News fallback used"}</p>
                        </div>
                        <div className="max-w-2xl space-y-2">
                            {report.metadata.evidenceQuality.reasons.map((reason) => <p key={reason} className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600 dark:bg-slate-950/60 dark:text-slate-300">{reason}</p>)}
                        </div>
                    </div>
                </div>
            ) : null}

            {report.financials.history?.length ? (
                <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.04] md:p-8">
                    <h3 className="text-2xl font-black text-slate-950 dark:text-white">Filing-backed financial history</h3>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Annual figures extracted from reported company filings. Values are shown in the company&apos;s reporting currency.</p>
                    <div className="mt-5 overflow-x-auto">
                        <table className="w-full min-w-[680px] text-left text-sm">
                            <thead className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 dark:border-white/10"><tr><th className="py-3">Year</th><th>Revenue</th><th>Net income</th><th>Operating income</th><th>Free cash flow</th></tr></thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-white/10">{report.financials.history.map((period) => <tr key={period.fiscalYear}><td className="py-4 font-black text-slate-950 dark:text-white">{period.fiscalYear}</td><td>{formatFinancialAmount(period.revenue, report.company.currency)}</td><td>{formatFinancialAmount(period.netIncome, report.company.currency)}</td><td>{formatFinancialAmount(period.operatingIncome, report.company.currency)}</td><td>{formatFinancialAmount(period.freeCashFlow, report.company.currency)}</td></tr>)}</tbody>
                        </table>
                    </div>
                </div>
            ) : null}

            {report.valuationAssessment ? (
                <div className="rounded-[2rem] border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.04] md:p-8">
                    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-600 dark:text-cyan-300">Valuation assessment</p><h3 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{report.valuationAssessment.status}</h3></div></div>
                    <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">{report.valuationAssessment.summary}</p>
                    <div className="mt-5 grid gap-4 md:grid-cols-3">{report.valuationAssessment.scenarios.map((scenario) => <div key={scenario.name} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-950/60"><p className="text-xs font-black tracking-wider text-slate-500">{scenario.name} CASE</p><ul className="mt-3 space-y-2">{scenario.assumptions.map((item) => <li key={item} className="text-sm text-slate-700 dark:text-slate-300">• {item}</li>)}</ul><p className="mt-4 border-t border-slate-200 pt-4 text-xs leading-5 text-slate-500 dark:border-white/10">{scenario.signal}</p></div>)}</div>
                </div>
            ) : null}

            <div className="grid gap-8 lg:grid-cols-[1fr_0.82fr]">
                <div className="space-y-8">
                    <div className="grid gap-5 md:grid-cols-2">
                        <InsightCard
                            icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                            title="Bull Case"
                            items={report.bullCase}
                        />

                        <InsightCard
                            icon={<XCircle className="h-5 w-5 text-red-500" />}
                            title="Bear Case"
                            items={report.bearCase}
                        />
                    </div>

                    <InsightCard
                        icon={<Activity className="h-5 w-5 text-violet-500" />}
                        title="What Would Change The Decision?"
                        items={report.whatWouldChangeDecision}
                    />

                    {report.catalysts?.length ? <InsightCard icon={<TrendingUp className="h-5 w-5 text-emerald-500" />} title="Upcoming Catalysts" items={report.catalysts} /> : null}

                    {report.monitoringTriggers?.length ? <InsightCard icon={<Activity className="h-5 w-5 text-cyan-500" />} title="Monitoring Checklist" items={report.monitoringTriggers} /> : null}

                    <InsightCard
                        icon={<ShieldAlert className="h-5 w-5 text-amber-500" />}
                        title="Key Risks"
                        items={report.risks}
                    />

                    <div className="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20 md:p-8">
                        <div className="mb-6 flex items-center gap-2">
                            <Newspaper className="h-5 w-5 text-cyan-500" />
                            <h3 className="text-2xl font-black text-slate-950 dark:text-white">
                                News & Sentiment
                            </h3>
                        </div>

                        {report.news.length === 0 ? (
                            <p className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-300">
                                No news items were available for this company.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {report.news.map((item, index) => (
                                    <article
                                        key={`${item.headline}-${index}`}
                                        className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-950/60"
                                    >
                                        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                                {item.url ? (
                                                    <a href={item.url} target="_blank" rel="noreferrer" className="inline-flex items-start gap-2 font-black text-slate-950 transition hover:text-cyan-600 dark:text-white dark:hover:text-cyan-300">
                                                        <span className="text-cyan-600 dark:text-cyan-300">[N{index + 1}]</span> {item.headline}
                                                        <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                                    </a>
                                                ) : (
                                                    <h4 className="font-black text-slate-950 dark:text-white">{item.headline}</h4>
                                                )}

                                                <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                                    {item.source}
                                                    {item.publishedAt ? ` · ${item.publishedAt}` : ""}
                                                </p>
                                            </div>

                                            <span
                                                className={`rounded-full border px-3 py-1 text-xs font-black ${sentimentStyle(
                                                    item.sentiment
                                                )}`}
                                            >
                                                {item.sentiment ?? "NEUTRAL"}
                                            </span>
                                        </div>

                                        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                                            {item.summary}
                                        </p>
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>

                </div>

                <aside className="space-y-8">
                    <div className="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20 md:p-8">
                        <div className="mb-5 flex items-center gap-2">
                            <Globe2 className="h-5 w-5 text-emerald-500" />
                            <h3 className="text-2xl font-black text-slate-950 dark:text-white">Sources & synthesis</h3>
                        </div>
                        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                            EquityLens combines structured market data, current news, deterministic scoring, and an AI-written investment memo. The recommendation is agent judgment—not a claim made by any single source.
                        </p>
                        <div className="mt-5 space-y-3">
                            <SourceMethodRow label="Financial data" value={formatProvider(report.metadata.financialDataSource)} />
                            <SourceMethodRow label="News research" value={formatProvider(report.metadata.newsDataSource)} />
                            <SourceMethodRow label="AI synthesis" value={formatProvider(report.metadata.memoProvider)} />
                            <SourceMethodRow label="Linked articles" value={`${report.news.filter((item) => item.url).length} available`} />
                            <SourceMethodRow label="Retrieved" value={report.metadata.dataRetrievedAt ? new Date(report.metadata.dataRetrievedAt).toLocaleString() : "Unknown"} />
                            <SourceMethodRow label="Scoring model" value={report.metadata.scoringModelVersion ?? "Legacy"} />
                            <SourceMethodRow label="Citation check" value={report.metadata.citationValidation?.valid === false ? "Review required" : "Passed"} />
                        </div>
                        {report.sources?.length ? (
                            <div className="mt-5 border-t border-slate-200 pt-5 dark:border-white/10">
                                <p className="text-xs font-black uppercase tracking-wider text-slate-500">Evidence index</p>
                                <div className="mt-3 space-y-2">{report.sources.slice(0, 10).map((source) => source.url ? <a key={source.id} href={source.url} target="_blank" rel="noreferrer" className="flex items-start justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 text-xs transition hover:text-cyan-600 dark:bg-slate-950/60 dark:hover:text-cyan-300"><span>{source.category === "NEWS" ? `[N${Number(source.id.replace("news-", "")) + 1}]` : "[F1]"} {source.title}</span><ExternalLink className="h-3.5 w-3.5 shrink-0" /></a> : <div key={source.id} className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500 dark:bg-slate-950/60">{source.title} · {source.provider}</div>)}</div>
                            </div>
                        ) : null}
                    </div>

                    <div className="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20 md:p-8">
                        <div className="mb-6 flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-cyan-500" />
                            <h3 className="text-2xl font-black text-slate-950 dark:text-white">
                                Score Breakdown
                            </h3>
                        </div>

                        <div className="space-y-5">
                            {scoreRows.map((row) => (
                                <ScoreRow key={row.label} label={row.label} value={row.value} />
                            ))}
                        </div>
                    </div>

                    <div className="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20 md:p-8">
                        <div className="mb-6 flex items-center gap-2">
                            <Database className="h-5 w-5 text-emerald-500" />
                            <h3 className="text-2xl font-black text-slate-950 dark:text-white">
                                {isPublicEquity ? "Public equity coverage" : "General company coverage"}
                            </h3>
                        </div>

                        <div className="grid gap-3">
                            {financialRows.map((row) => (
                                <FinancialRow key={row.label} label={row.label} value={row.value} />
                            ))}
                        </div>
                    </div>

                    <div className="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20 md:p-8">
                        <div className="mb-6 flex items-center gap-2">
                            <Globe2 className="h-5 w-5 text-violet-500" />
                            <h3 className="text-2xl font-black text-slate-950 dark:text-white">
                                Agent Trace
                            </h3>
                        </div>

                        <div className="space-y-3">
                            {report.metadata.trace.map((step, index) => (
                                <div
                                    key={`${step.step}-${index}`}
                                    className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-950/60"
                                >
                                    <div className="mb-2 flex items-center justify-between gap-3">
                                        <p className="font-black text-slate-950 dark:text-white">
                                            {step.step}
                                        </p>

                                        <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-black text-cyan-600 dark:text-cyan-300">
                                            {step.status}
                                        </span>
                                    </div>

                                    <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                                        {step.message}
                                    </p>

                                    {step.provider && (
                                        <p className="mt-2 text-xs font-bold text-slate-500">
                                            Provider: {step.provider}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </section>
    );
}

function HeroMetric({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-950/60">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-cyan-600 shadow-sm dark:bg-white/10 dark:text-cyan-300">
                {icon}
            </div>

            <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                {label}
            </p>

            <p className="mt-2 break-words text-sm font-black text-slate-950 dark:text-white">
                {value}
            </p>
        </div>
    );
}

function DarkInfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="text-sm font-bold text-slate-300">{label}</span>
            <span className="text-sm font-black text-white">{value}</span>
        </div>
    );
}

function InsightCard({
    icon,
    title,
    items,
}: {
    icon: React.ReactNode;
    title: string;
    items: string[];
}) {
    return (
        <div className="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20 md:p-8">
            <div className="mb-5 flex items-center gap-2">
                {icon}
                <h3 className="text-xl font-black text-slate-950 dark:text-white">
                    {title}
                </h3>
            </div>

            <div className="space-y-3">
                {items.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                        <div className="mt-2 h-1.5 w-1.5 rounded-full bg-cyan-400" />
                        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                            {item}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ScoreRow({ label, value }: { label: string; value: number }) {
    return (
        <div>
            <div className="mb-2 flex items-center justify-between gap-4">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {label}
                </p>

                <p className="text-sm font-black text-slate-950 dark:text-white">
                    {value}
                </p>
            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                <div
                    className="h-full rounded-full bg-cyan-400"
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    );
}

function FinancialRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-slate-950/60">
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                {label}
            </span>

            <span className="text-sm font-black text-slate-950 dark:text-white">
                {value}
            </span>
        </div>
    );
}

function CompactResearchReport({ report, isStale }: { report: InvestmentResearchReport; isStale: boolean }) {
    const scoreRows = [
        ["Growth", report.score.growth], ["Profitability", report.score.profitability],
        ["Balance Sheet", report.score.balanceSheet], ["Valuation", report.score.valuation],
        ["Sentiment", report.score.sentiment],
    ] as const;
    const financialRows = [
        ["Revenue Growth YoY", formatMetric(report.financials.revenueGrowthYoY, "%")],
        ["Profit Margin", formatMetric(report.financials.profitMargin, "%")],
        ["Operating Margin", formatMetric(report.financials.operatingMargin, "%")],
        ["Return on Equity", formatMetric(report.financials.returnOnEquity, "%")],
        ["Debt to Equity", formatMetric(report.financials.debtToEquity)],
        ["Current Ratio", formatMetric(report.financials.currentRatio)],
        ["P/E Ratio", formatMetric(report.financials.peRatio)], ["Forward P/E", formatMetric(report.financials.forwardPe)],
        ["PEG Ratio", formatMetric(report.financials.pegRatio)], ["Price to Sales", formatMetric(report.financials.priceToSales)],
        ["EPS", formatMetric(report.financials.eps)], ["Beta", formatMetric(report.financials.beta)],
    ] as const;
    const warnings = summarizeReportWarnings(report.metadata.warnings);

    return (
        <section className="space-y-9">
            {isStale && <div className="border-y border-amber-300/30 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-400/10 dark:text-amber-300">This report is stale. Rerun research before relying on current market context.</div>}

            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <div className="flex flex-wrap items-center gap-2"><span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{report.company.symbol || "N/A"}</span><span className={`rounded-md border px-2 py-1 text-xs font-semibold ${decisionStyle(report.decision)}`}>{report.decision}</span></div>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{report.company.name}</h2>
                    <p className="mt-1 text-xs text-slate-400">{report.company.sector ?? "Unknown sector"} · {report.company.industry ?? "Unknown industry"} · {report.company.exchange ?? "No exchange"}</p>
                </div>
                <ReportExport report={report} />
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-4 border-y border-slate-200 py-5 sm:grid-cols-4 dark:border-white/10">
                <CompactMetric label="Score" value={`${report.score.total}/100`} /><CompactMetric label="Confidence" value={`${report.confidence}/100`} /><CompactMetric label="Market cap" value={formatMarketCap(report.company.marketCap, report.company.currency)} /><CompactMetric label="Evidence" value={report.metadata.evidenceQuality?.level ?? "Available"} />
            </div>

            <div><h3 className="text-sm font-semibold text-slate-950 dark:text-white">Investment thesis</h3><p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{report.thesis}</p></div>
            <DecisionActionPanel report={report} />

            {(warnings.length > 0 || report.metadata.evidenceQuality) && (
                <CompactSection title="Data coverage">
                    {report.metadata.evidenceQuality && <div className="mb-4 flex flex-wrap items-center gap-3"><span className="text-sm font-semibold text-slate-950 dark:text-white">{report.metadata.evidenceQuality.financialCompleteness}% financial completeness</span><span className="text-xs text-slate-400">{report.metadata.evidenceQuality.hasRealNews ? "Current research available" : "News fallback used"}</span></div>}
                    <ul className="space-y-2">{[...(report.metadata.evidenceQuality?.reasons ?? []), ...warnings].filter((value, index, all) => all.indexOf(value) === index).map((item) => <li key={item} className="flex gap-2 text-sm leading-6 text-slate-500 dark:text-slate-400"><CheckCircle2 className="mt-1 h-3.5 w-3.5 shrink-0 text-emerald-500" />{item}</li>)}</ul>
                </CompactSection>
            )}

            {report.valuationAssessment && <CompactSection title="Valuation assessment"><div className="mb-4 flex items-center gap-2"><span className="text-sm font-semibold text-slate-950 dark:text-white">{report.valuationAssessment.status}</span></div><p className="text-sm leading-7 text-slate-600 dark:text-slate-300">{report.valuationAssessment.summary}</p><div className="mt-5 grid gap-5 sm:grid-cols-3">{report.valuationAssessment.scenarios.map((scenario) => <div key={scenario.name}><p className="text-xs font-semibold text-slate-400">{scenario.name} case</p><ul className="mt-2 space-y-1">{scenario.assumptions.map((item) => <li key={item} className="text-sm text-slate-600 dark:text-slate-300">• {item}</li>)}</ul><p className="mt-3 text-xs leading-5 text-slate-400">{scenario.signal}</p></div>)}</div></CompactSection>}

            <CompactInsight title="Bull case" items={report.bullCase} tone="positive" />
            <CompactInsight title="Bear case" items={report.bearCase} tone="negative" />
            <CompactSection title="Score breakdown"><div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">{scoreRows.map(([label, value]) => <ScoreRow key={label} label={label} value={value} />)}</div></CompactSection>
            <CompactSection title={report.company.coverageMode === "PUBLIC_EQUITY" ? "Financial snapshot" : "Company coverage"}><div className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">{financialRows.map(([label, value]) => <div key={label} className="border-b border-slate-100 pb-3 dark:border-white/10"><p className="text-xs text-slate-400">{label}</p><p className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">{value}</p></div>)}</div></CompactSection>
            <CompactInsight title="What would change the decision?" items={report.whatWouldChangeDecision} tone="neutral" />
            {report.catalysts?.length ? <CompactInsight title="Upcoming catalysts" items={report.catalysts} tone="positive" /> : null}
            {report.monitoringTriggers?.length ? <CompactInsight title="Monitoring checklist" items={report.monitoringTriggers} tone="neutral" /> : null}
            <CompactInsight title="Key risks" items={report.risks} tone="warning" />

            <CompactSection title="News & sentiment">{report.news.length === 0 ? <p className="text-sm text-slate-500">No relevant news was available.</p> : <div className="divide-y divide-slate-100 dark:divide-white/10">{report.news.map((item, index) => <article key={`${item.headline}-${index}`} className="py-4 first:pt-0"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0 flex-1">{item.url ? <a href={item.url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-slate-950 hover:text-cyan-600 dark:text-white">[N{index + 1}] {item.headline}</a> : <h4 className="text-sm font-semibold text-slate-950 dark:text-white">{item.headline}</h4>}<p className="mt-1 text-xs text-slate-400">{item.source}{item.publishedAt ? ` · ${item.publishedAt}` : ""}</p></div><span className={`rounded-md border px-2 py-1 text-[11px] font-semibold ${sentimentStyle(item.sentiment)}`}>{item.sentiment ?? "NEUTRAL"}</span></div><p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.summary}</p></article>)}</div>}</CompactSection>

            <CompactSection title="Sources & synthesis"><div className="grid gap-4 sm:grid-cols-3"><CompactMetric label="Financial" value={formatProvider(report.metadata.financialDataSource)} /><CompactMetric label="News" value={formatProvider(report.metadata.newsDataSource)} /><CompactMetric label="Memo" value={formatProvider(report.metadata.memoProvider)} /></div></CompactSection>

            <CompactSection title="Agent trace"><ol>{report.metadata.trace.map((step, index) => { const success = step.status === "SUCCESS"; const fallback = step.status === "FALLBACK"; const skipped = step.status === "SKIPPED"; return <li key={`${step.step}-${index}`} className="relative grid grid-cols-[18px_minmax(0,1fr)] gap-3 pb-5 last:pb-0">{index < report.metadata.trace.length - 1 && <span className="absolute left-[8px] top-4 h-full w-px bg-slate-200 dark:bg-white/10" />}<span className={`relative z-10 mt-1 h-4 w-4 rounded-full border-4 border-slate-50 dark:border-slate-950 ${success ? "bg-emerald-500" : fallback ? "bg-amber-500" : skipped ? "bg-slate-400" : "bg-red-500"}`} /><div><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-semibold text-slate-950 dark:text-white">{formatTraceName(step.step)}</p><span className="text-[11px] font-semibold text-slate-400">{step.status}</span></div><p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{step.message}</p>{step.provider && <p className="mt-1 text-[11px] text-slate-400">Provider: {formatProvider(step.provider)}</p>}</div></li>; })}</ol></CompactSection>
        </section>
    );
}

function CompactSection({ title, children }: { title: string; children: React.ReactNode }) { return <section className="border-t border-slate-200 pt-6 dark:border-white/10"><h3 className="mb-5 text-lg font-semibold text-slate-950 dark:text-white">{title}</h3>{children}</section>; }
function CompactMetric({ label, value }: { label: string; value: string }) { return <div><p className="text-xs text-slate-400">{label}</p><p className="mt-1 break-words text-sm font-semibold text-slate-950 dark:text-white">{value}</p></div>; }
function CompactInsight({ title, items, tone }: { title: string; items: string[]; tone: "positive" | "negative" | "neutral" | "warning" }) { const color = tone === "positive" ? "bg-emerald-500" : tone === "negative" ? "bg-red-500" : tone === "warning" ? "bg-amber-500" : "bg-violet-500"; return <CompactSection title={title}><ul className="space-y-3">{items.map((item, index) => <li key={index} className="flex items-start gap-3"><span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${color}`} /><p className="text-sm leading-7 text-slate-600 dark:text-slate-300">{item}</p></li>)}</ul></CompactSection>; }
function summarizeReportWarnings(warnings: string[]) { return [...new Set(warnings.map((warning) => /quota|429 Too Many Requests|Gemini failed/i.test(warning) ? "Gemini was unavailable, so fallback memo reasoning was used." : /Alpha Vantage|rate limit/i.test(warning) ? "Detailed fundamentals were unavailable from the primary financial provider." : warning))]; }
function formatTraceName(value: string) { return value.split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" "); }

function SourceMethodRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-950/60">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</span>
            <span className="text-right text-xs font-black text-slate-900 dark:text-white">{value}</span>
        </div>
    );
}

function formatProvider(value?: string) {
    if (!value) return "Not available";
    return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatFinancialAmount(value?: number, currency = "USD") {
    if (value === undefined) return "N/A";
    return new Intl.NumberFormat("en", { style: "currency", currency: currency || "USD", notation: "compact", maximumFractionDigits: 1 }).format(value);
}
