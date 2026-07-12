"use client";

import {
    ArrowRight,
    BarChart3,
    Brain,
    Database,
    Download,
    GitBranch,
    History,
    LineChart,
    Mail,
    Newspaper,
    Search,
    Settings,
    ShieldCheck,
    Sparkles,
} from "lucide-react";
import type { AppTab } from "@/lib/frontend/app-tabs";

export function HomeFooter({
    onTabChange,
    onPickResearch,
    onPickCompare,
}: {
    onTabChange: (tab: AppTab) => void;
    onPickResearch: (company: string) => void;
    onPickCompare: (companies: string) => void;
}) {
    const year = new Date().getFullYear();

    return (
        <footer className="border-t border-slate-200 py-5 dark:border-white/10">
            <div className="flex flex-col gap-2 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">EquityLens</span>
                    <span>AI investment research workspace</span>
                </div>
                <span>© {year} EquityLens</span>
            </div>
        </footer>
    );

    /* Legacy footer retained below while the compact footer is active. */
    return (
        <footer className="relative overflow-hidden rounded-[3rem] border border-slate-200 bg-slate-950 text-white shadow-2xl shadow-slate-900/20 dark:border-white/10 dark:shadow-black/40">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.22),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.18),_transparent_32%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,_transparent_1px),linear-gradient(90deg,_rgba(255,255,255,0.04)_1px,_transparent_1px)] bg-[size:42px_42px]" />

            <div className="relative px-6 py-10 md:px-10 md:py-12 xl:px-12">
                <div className="grid gap-8 border-b border-white/10 pb-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                    <div>
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-100">
                            <Sparkles className="h-4 w-4" />
                            Investment research command center
                        </div>

                        <h2 className="max-w-3xl text-4xl font-black tracking-tight md:text-5xl">
                            Turn market noise into structured investment decisions.
                        </h2>

                        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
                            EquityLens combines company fundamentals, market news, scoring,
                            comparison logic, and AI reasoning into a clean research workflow.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3 lg:justify-end">
                        <button
                            onClick={() => {
                                onPickResearch("Nvidia");
                                onTabChange("research");
                            }}
                            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-black text-slate-950 shadow-xl shadow-black/20 transition hover:-translate-y-0.5"
                        >
                            Start Research
                            <ArrowRight className="h-4 w-4" />
                        </button>

                        <button
                            onClick={() => {
                                onPickCompare("Nvidia, Microsoft, Tesla");
                                onTabChange("compare");
                            }}
                            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-6 py-3 text-sm font-black text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/15"
                        >
                            Compare Companies
                            <BarChart3 className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div className="grid gap-8 py-10 md:grid-cols-2 xl:grid-cols-[1.15fr_0.85fr_0.85fr_0.85fr]">
                    <div>
                        <button
                            onClick={() => onTabChange("home")}
                            className="mb-5 flex items-center gap-3"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-950">
                                <Brain className="h-6 w-6" />
                            </div>

                            <div className="text-left">
                                <p className="text-lg font-black">EquityLens AI</p>
                                <p className="text-xs font-bold text-slate-400">
                                    AI equity research workspace
                                </p>
                            </div>
                        </button>

                        <p className="max-w-sm text-sm leading-7 text-slate-400">
                            Built for researching companies, comparing stocks, tracking
                            watchlists, saving history, and exporting investment memos from
                            one workspace.
                        </p>

                        <div className="mt-6 grid max-w-md gap-3 sm:grid-cols-2">
                            <FooterStatus
                                icon={<Database className="h-4 w-4" />}
                                label="Financial Data"
                                value="Alpha Vantage"
                            />

                            <FooterStatus
                                icon={<Brain className="h-4 w-4" />}
                                label="AI Reasoning"
                                value="Gemini"
                            />

                            <FooterStatus
                                icon={<Newspaper className="h-4 w-4" />}
                                label="Market News"
                                value="Finnhub / fallback"
                            />

                            <FooterStatus
                                icon={<ShieldCheck className="h-4 w-4" />}
                                label="Auth"
                                value="Secure workspace"
                            />
                        </div>
                    </div>

                    <FooterColumn
                        title="Workspace"
                        links={[
                            {
                                label: "Research",
                                icon: <Search className="h-4 w-4" />,
                                onClick: () => onTabChange("research"),
                            },
                            {
                                label: "Compare",
                                icon: <BarChart3 className="h-4 w-4" />,
                                onClick: () => onTabChange("compare"),
                            },
                            {
                                label: "History",
                                icon: <History className="h-4 w-4" />,
                                onClick: () => onTabChange("history"),
                            },
                            {
                                label: "Portfolio",
                                icon: <LineChart className="h-4 w-4" />,
                                onClick: () => onTabChange("portfolio"),
                            },
                        ]}
                    />

                    <FooterColumn
                        title="Product"
                        links={[
                            {
                                label: "Exports",
                                icon: <Download className="h-4 w-4" />,
                                onClick: () => onTabChange("exports"),
                            },
                            {
                                label: "Settings",
                                icon: <Settings className="h-4 w-4" />,
                                onClick: () => onTabChange("settings"),
                            },
                            {
                                label: "Analyze Apple",
                                icon: <Search className="h-4 w-4" />,
                                onClick: () => {
                                    onPickResearch("Apple");
                                    onTabChange("research");
                                },
                            },
                            {
                                label: "Compare Tech Stocks",
                                icon: <BarChart3 className="h-4 w-4" />,
                                onClick: () => {
                                    onPickCompare("Apple, Microsoft, Nvidia");
                                    onTabChange("compare");
                                },
                            },
                        ]}
                    />

                    <div>
                        <h3 className="mb-4 text-sm font-black uppercase tracking-[0.22em] text-slate-400">
                            Project
                        </h3>

                        <div className="space-y-3">
                            <FooterStaticItem
                                icon={<GitBranch className="h-4 w-4" />}
                                label="GitHub-ready"
                            />

                            <FooterStaticItem
                                icon={<Mail className="h-4 w-4" />}
                                label="OTP auth ready"
                            />

                            <FooterStaticItem
                                icon={<Sparkles className="h-4 w-4" />}
                                label="AI agent workflow"
                            />

                            <FooterStaticItem
                                icon={<ShieldCheck className="h-4 w-4" />}
                                label="Admin dashboard"
                            />
                        </div>
                    </div>
                </div>

                <div className="rounded-[2rem] border border-amber-300/20 bg-amber-300/10 p-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                            <p className="font-black text-amber-200">
                                Investment disclaimer
                            </p>

                            <p className="mt-2 max-w-4xl text-xs leading-6 text-amber-100/80">
                                EquityLens AI is a research assistant for educational and
                                analytical use. It does not provide financial advice, brokerage
                                services, or guaranteed investment outcomes. Always verify data
                                and consult a qualified financial professional before investing.
                            </p>
                        </div>

                        <div className="shrink-0 rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-xs font-black text-amber-100">
                            Not financial advice
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs font-bold text-slate-500 md:flex-row md:items-center md:justify-between">
                    <p>© {year} EquityLens AI. Built as an AI investment research agent.</p>

                    <div className="flex flex-wrap gap-4">
                        <span>Next.js</span>
                        <span>LangGraph</span>
                        <span>Prisma</span>
                        <span>PostgreSQL</span>
                        <span>Gemini</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function FooterColumn({
    title,
    links,
}: {
    title: string;
    links: {
        label: string;
        icon: React.ReactNode;
        onClick: () => void;
    }[];
}) {
    return (
        <div>
            <h3 className="mb-4 text-sm font-black uppercase tracking-[0.22em] text-slate-400">
                {title}
            </h3>

            <div className="space-y-2">
                {links.map((link) => (
                    <button
                        key={link.label}
                        onClick={link.onClick}
                        className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
                    >
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-cyan-200">
                            {link.icon}
                        </span>
                        {link.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

function FooterStatus({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-cyan-200">
                {icon}
            </div>

            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                {label}
            </p>

            <p className="mt-1 text-sm font-black text-white">{value}</p>
        </div>
    );
}

function FooterStaticItem({
    icon,
    label,
}: {
    icon: React.ReactNode;
    label: string;
}) {
    return (
        <div className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold text-slate-300">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-emerald-200">
                {icon}
            </span>
            {label}
        </div>
    );
}
