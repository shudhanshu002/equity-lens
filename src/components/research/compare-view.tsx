import type React from "react";
import {
    AlertTriangle,
    BarChart3,
    Brain,
    CheckCircle2,
    Crown,
    Database,
    FileText,
    GitCompare,
    Layers3,
    ShieldCheck,
    Sparkles,
    Trophy,
} from "lucide-react";
import { ComparisonExport } from "@/components/research/comparison-export";
import { ComparisonApiResponse } from "@/lib/api-client";
import { formatNumber } from "@/lib/frontend/format";

type ComparisonData = NonNullable<ComparisonApiResponse["data"]>;

type CompareViewProps = {
    comparison: ComparisonData;
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

function clampScore(value: number) {
    return Math.max(0, Math.min(100, value));
}

export function CompareView({
    comparison,
}: CompareViewProps) {
    const memo = comparison.comparison;
    const winner = comparison.companies.find(
        (item) => item.company.symbol === memo.winnerSymbol
    );

    return (
        <section className="space-y-8">
            <div className="overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/30">
                <div className="grid lg:grid-cols-[1fr_0.45fr]">
                    <div className="p-8 md:p-10">
                        <div className="mb-6 flex flex-wrap items-start justify-between gap-5">
                            <div>
                                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-600 dark:text-emerald-300">
                                    <Trophy className="h-4 w-4" />
                                    Comparison Winner
                                </div>

                                <h2 className="text-4xl font-black tracking-tight text-slate-950 dark:text-white md:text-5xl">
                                    {memo.winnerName}
                                </h2>

                                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                                    {memo.summary}
                                </p>
                            </div>

                            <div className="flex flex-col items-start gap-3 sm:items-end">
                                <span
                                    className={`rounded-full border px-5 py-2 text-sm font-black ${decisionStyle(
                                        memo.winnerDecision
                                    )}`}
                                >
                                    {memo.winnerDecision}
                                </span>

                                <ComparisonExport comparison={comparison} />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-4">
                            <HeroMetric
                                icon={<Crown className="h-5 w-5" />}
                                label="Winner"
                                value={memo.winnerSymbol}
                            />

                            <HeroMetric
                                icon={<BarChart3 className="h-5 w-5" />}
                                label="Winner Score"
                                value={`${memo.winnerScore}/100`}
                            />

                            <HeroMetric
                                icon={<Layers3 className="h-5 w-5" />}
                                label="Companies"
                                value={`${comparison.companies.length}`}
                            />

                            <HeroMetric
                                icon={<Brain className="h-5 w-5" />}
                                label="Provider"
                                value={comparison.metadata.comparisonProvider}
                            />
                        </div>
                    </div>

                    <div className="relative bg-slate-950 p-8 text-white md:p-10">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.26),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(139,92,246,0.24),_transparent_35%)]" />

                        <div className="relative">
                            <p className="mb-3 text-sm font-black uppercase tracking-[0.3em] text-cyan-300">
                                Winner Card
                            </p>

                            <div className="flex h-32 w-32 items-center justify-center rounded-[2rem] border border-white/10 bg-white/10 text-5xl font-black">
                                {memo.winnerScore}
                            </div>

                            <h3 className="mt-6 text-3xl font-black">{memo.winnerSymbol}</h3>

                            <p className="mt-3 text-sm leading-7 text-slate-300">
                                The winner is selected from deterministic research scores. The
                                AI memo explains why the ranking makes sense.
                            </p>

                            {winner && (
                                <div className="mt-6 space-y-3">
                                    <DarkInfoRow
                                        label="Market Cap"
                                        value={formatNumber(winner.company.marketCap)}
                                    />

                                    <DarkInfoRow
                                        label="Sector"
                                        value={winner.company.sector ?? "N/A"}
                                    />

                                    <DarkInfoRow
                                        label="Financial Source"
                                        value={winner.metadata.financialDataSource ?? "Unknown"}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {comparison.metadata.warnings.length > 0 && (
                <div className="rounded-[2rem] border border-amber-400/20 bg-amber-400/10 p-6">
                    <div className="mb-4 flex items-center gap-2 text-amber-600 dark:text-amber-300">
                        <AlertTriangle className="h-5 w-5" />
                        <h3 className="font-black">Comparison Warnings</h3>
                    </div>

                    <ul className="space-y-2">
                        {comparison.metadata.warnings.map((warning, index) => (
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

            <div className="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20 md:p-8">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-600 dark:text-cyan-300">
                            <BarChart3 className="h-4 w-4" />
                            Score Comparison
                        </div>

                        <h3 className="text-3xl font-black text-slate-950 dark:text-white">
                            Side-by-side company scores
                        </h3>
                    </div>

                    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-black text-emerald-600 dark:text-emerald-300">
                        Deterministic winner
                    </span>
                </div>

                <div className="grid gap-5 lg:grid-cols-3">
                    {comparison.companies.map((report) => (
                        <CompanyScoreCard
                            key={report.company.symbol}
                            symbol={report.company.symbol}
                            name={report.company.name}
                            decision={report.decision}
                            score={report.score.total}
                            rows={[
                                ["Growth", report.score.growth],
                                ["Profitability", report.score.profitability],
                                ["Balance Sheet", report.score.balanceSheet],
                                ["Valuation", report.score.valuation],
                                ["Sentiment", report.score.sentiment],
                            ]}
                            isWinner={report.company.symbol === memo.winnerSymbol}
                        />
                    ))}
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1fr_0.82fr]">
                <div className="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20 md:p-8">
                    <div className="mb-6 flex items-center gap-2">
                        <GitCompare className="h-5 w-5 text-violet-500" />
                        <h3 className="text-2xl font-black text-slate-950 dark:text-white">
                            Ranking Reasoning
                        </h3>
                    </div>

                    <div className="space-y-4">
                        {memo.ranking.map((item) => (
                            <div
                                key={`${item.rank}-${item.symbol}`}
                                className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-950/60"
                            >
                                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">
                                            Rank {item.rank}
                                        </p>

                                        <h4 className="mt-1 text-xl font-black text-slate-950 dark:text-white">
                                            {item.name} ({item.symbol})
                                        </h4>
                                    </div>

                                    {item.symbol === memo.winnerSymbol && (
                                        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-600 dark:text-emerald-300">
                                            Winner
                                        </span>
                                    )}
                                </div>

                                <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                                    {item.reason}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <aside className="space-y-8">
                    <InsightPanel
                        icon={<Sparkles className="h-5 w-5 text-cyan-500" />}
                        title="Key Tradeoffs"
                        items={memo.keyTradeoffs}
                    />

                    <div className="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20 md:p-8">
                        <div className="mb-6 flex items-center gap-2">
                            <Database className="h-5 w-5 text-emerald-500" />
                            <h3 className="text-2xl font-black text-slate-950 dark:text-white">
                                Data Quality
                            </h3>
                        </div>

                        <div className="space-y-4">
                            <DataQualityRow
                                label="Financial Sources"
                                value={comparison.metadata.dataQuality.financialSources.join(
                                    ", "
                                )}
                            />

                            <DataQualityRow
                                label="News Sources"
                                value={comparison.metadata.dataQuality.newsSources.join(", ")}
                            />

                            <DataQualityRow
                                label="Memo Providers"
                                value={comparison.metadata.dataQuality.memoProviders.join(", ")}
                            />

                            <DataQualityRow
                                label="Mock News"
                                value={
                                    comparison.metadata.dataQuality.hasMockNews ? "Used" : "No"
                                }
                            />

                            <DataQualityRow
                                label="Mock Financials"
                                value={
                                    comparison.metadata.dataQuality.hasMockFinancials
                                        ? "Used"
                                        : "No"
                                }
                            />

                            <DataQualityRow
                                label="Fallback Memo"
                                value={
                                    comparison.metadata.dataQuality.hasFallbackMemo ? "Used" : "No"
                                }
                            />
                        </div>
                    </div>

                    <div className="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20 md:p-8">
                        <div className="mb-6 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-amber-500" />
                            <h3 className="text-2xl font-black text-slate-950 dark:text-white">
                                Compared Companies
                            </h3>
                        </div>

                        <div className="space-y-3">
                            {comparison.companies.map((report) => (
                                <div
                                    key={report.company.symbol}
                                    className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-950/60"
                                >
                                    <div className="mb-2 flex items-center justify-between gap-3">
                                        <p className="font-black text-slate-950 dark:text-white">
                                            {report.company.symbol}
                                        </p>

                                        <span
                                            className={`rounded-full border px-3 py-1 text-xs font-black ${decisionStyle(
                                                report.decision
                                            )}`}
                                        >
                                            {report.decision}
                                        </span>
                                    </div>

                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {report.company.name}
                                    </p>

                                    <p className="mt-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                                        Score: {report.score.total}/100
                                    </p>
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

function CompanyScoreCard({
    symbol,
    name,
    decision,
    score,
    rows,
    isWinner,
}: {
    symbol: string;
    name: string;
    decision: string;
    score: number;
    rows: [string, number][];
    isWinner: boolean;
}) {
    return (
        <div
            className={`rounded-[2rem] border p-6 ${isWinner
                    ? "border-emerald-400/30 bg-emerald-400/10"
                    : "border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-950/60"
                }`}
        >
            <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">
                        {isWinner ? "Winner" : "Candidate"}
                    </p>

                    <h4 className="mt-1 text-2xl font-black text-slate-950 dark:text-white">
                        {symbol}
                    </h4>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {name}
                    </p>
                </div>

                <span
                    className={`rounded-full border px-3 py-1 text-xs font-black ${decisionStyle(
                        decision
                    )}`}
                >
                    {decision}
                </span>
            </div>

            <div className="mb-6 flex items-end justify-between">
                <div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                        Total Score
                    </p>

                    <p className="mt-1 text-5xl font-black text-slate-950 dark:text-white">
                        {score}
                    </p>
                </div>

                {isWinner && (
                    <CheckCircle2 className="h-8 w-8 text-emerald-500 dark:text-emerald-300" />
                )}
            </div>

            <div className="space-y-4">
                {rows.map(([label, value]) => (
                    <ScoreRow key={label} label={label} value={value} />
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
                    style={{ width: `${clampScore(value)}%` }}
                />
            </div>
        </div>
    );
}

function InsightPanel({
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

function DataQualityRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-slate-950/60">
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                {label}
            </span>

            <span className="text-right text-sm font-black text-slate-950 dark:text-white">
                {value}
            </span>
        </div>
    );
}