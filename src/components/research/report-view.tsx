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
    Newspaper,
    ShieldAlert,
    ShieldCheck,
    TrendingUp,
    XCircle,
} from "lucide-react";
import { ReportExport } from "@/components/research/report-export";
import { formatMetric, formatNumber } from "@/lib/frontend/format";
import { InvestmentResearchReport } from "@/lib/types/research";

type ReportViewProps = {
    report: InvestmentResearchReport;
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

export function ReportView({ report }: ReportViewProps) {
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
            <div className="overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/30">
                <div className="grid lg:grid-cols-[1fr_0.45fr]">
                    <div className="p-8 md:p-10">
                        <div className="mb-6 flex flex-wrap items-start justify-between gap-5">
                            <div>
                                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-600 dark:text-cyan-300">
                                    <Building2 className="h-4 w-4" />
                                    {report.company.symbol}
                                </div>

                                <h2 className="text-4xl font-black tracking-tight text-slate-950 dark:text-white md:text-5xl">
                                    {report.company.name}
                                </h2>

                                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                                    {report.company.sector ?? "Unknown sector"} ·{" "}
                                    {report.company.industry ?? "Unknown industry"} ·{" "}
                                    {report.company.exchange ?? "Unknown exchange"}
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
                                    value={formatNumber(report.company.marketCap)}
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
                                                <h4 className="font-black text-slate-950 dark:text-white">
                                                    {item.headline}
                                                </h4>

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
                                Financial Snapshot
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