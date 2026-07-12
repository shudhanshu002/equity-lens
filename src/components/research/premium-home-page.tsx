"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import {
    ArrowRight,
    BarChart3,
    Brain,
    CheckCircle2,
    Database,
    FileText,
    LineChart,
    Newspaper,
    PieChart,
    ShieldCheck,
    Sparkles,
    TrendingUp,
    Zap,
} from "lucide-react";
import { useSession } from "next-auth/react";
import type { AppTab } from "@/lib/frontend/app-tabs";

type PremiumHomePageProps = {
    onTabChange: (tab: AppTab) => void;
    onPickResearch: (company: string) => void;
    onPickCompare: (companies: string) => void;
};

const PRODUCT_BADGES = [
    "Multi Agent Pipeline",
    "Live Financial Data",
    "News Sentiment",
    "Financial Scoring",
    "AI Recommendation",
    "Export Report",
];

const MARQUEE_BADGES = Array.from({ length: 4 }, () => PRODUCT_BADGES).flat();

const WORKFLOW = [
    {
        title: "Company",
        icon: <TrendingUp className="h-5 w-5" />,
    },
    {
        title: "Financial Agent",
        icon: <Database className="h-5 w-5" />,
    },
    {
        title: "News Agent",
        icon: <Newspaper className="h-5 w-5" />,
    },
    {
        title: "Scoring Agent",
        icon: <PieChart className="h-5 w-5" />,
    },
    {
        title: "Reasoning Agent",
        icon: <Brain className="h-5 w-5" />,
    },
    {
        title: "Investment Memo",
        icon: <FileText className="h-5 w-5" />,
    },
];

export function PremiumHomePage({
    onTabChange,
    onPickResearch,
    onPickCompare,
}: PremiumHomePageProps) {
    const { status } = useSession();
    const isLoggedIn = status === "authenticated";

    return (
        <div className="space-y-24">
            <section className="flex min-h-[calc(100vh-12rem)] flex-col items-center gap-16 pt-12 text-center md:gap-20 md:pt-16">
                <div className="mx-auto max-w-5xl">
                    <h1 className="mx-auto max-w-4xl pb-2 text-4xl leading-[1.12] tracking-tight text-slate-950 dark:text-white md:text-6xl md:leading-[1.08]">
                        <span className="font-semibold">Research.</span>{" "}
                        <span className="font-semibold">Compare.</span>{" "}
                        <span className="font-medium italic">Manage.</span>
                        <span className="mt-2 block bg-gradient-to-r from-cyan-500 via-violet-500 to-emerald-500 bg-clip-text font-black text-transparent">
                            With financial agents.
                        </span>
                    </h1>

                    <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-300">
                        EquityLens turns fundamentals, market news, scoring logic, and AI reasoning into structured investment memos.
                    </p>

                    <div className="mt-10 flex flex-wrap justify-center gap-3">
                        <button
                            onClick={() => {
                                onPickResearch("Nvidia");
                                onTabChange("research");
                            }}
                            className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950"
                        >
                            {isLoggedIn ? "Start Research" : "Get Started"}
                            <ArrowRight className="h-4 w-4" />
                        </button>

                        <button
                            onClick={() => document.getElementById("product-demo")?.scrollIntoView({ behavior: "smooth", block: "center" })}
                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-6 py-3.5 text-sm font-black text-slate-700 shadow-md shadow-slate-900/5 backdrop-blur-xl transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
                        >
                            View Demo
                            <BarChart3 className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="marquee-fade mx-auto mt-10 w-full max-w-5xl overflow-hidden border-y border-slate-200 py-3 dark:border-white/10">
                        <div className="flex w-max animate-marquee-x gap-3">
                            {MARQUEE_BADGES.map((badge, index) => (
                                <div
                                    key={`${badge}-${index}`}
                                    className="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white/75 px-4 py-2 text-sm font-bold text-slate-700 shadow-sm shadow-slate-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                                >
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    {badge}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div id="product-demo" className="w-full scroll-mt-28 px-2">
                    <HeroProductVisual />
                </div>
            </section>

            <FilloutStyleWindow
                onTabChange={onTabChange}
                onPickResearch={onPickResearch}
            />

            <HowItWorksSection />
        </div>
    );
}

function HeroProductVisual() {
    const visualRef = useRef<HTMLDivElement | null>(null);
    const [scrollTilt, setScrollTilt] = useState(0);

    useEffect(() => {
        let frameId = 0;

        const updateTilt = () => {
            frameId = 0;

            const element = visualRef.current;

            if (!element) {
                return;
            }

            const rect = element.getBoundingClientRect();
            const viewportCenter = window.innerHeight / 2;
            const elementCenter = rect.top + rect.height / 2;
            const nextTilt = Math.max(
                -1,
                Math.min(1, (viewportCenter - elementCenter) / window.innerHeight),
            );

            setScrollTilt(nextTilt);
        };

        const requestTiltUpdate = () => {
            if (frameId) {
                return;
            }

            frameId = window.requestAnimationFrame(updateTilt);
        };

        updateTilt();
        window.addEventListener("scroll", requestTiltUpdate, { passive: true });
        window.addEventListener("resize", requestTiltUpdate);

        return () => {
            if (frameId) {
                window.cancelAnimationFrame(frameId);
            }

            window.removeEventListener("scroll", requestTiltUpdate);
            window.removeEventListener("resize", requestTiltUpdate);
        };
    }, []);

    return (
        <div
            ref={visualRef}
            className="relative mx-auto w-full max-w-4xl perspective-[1800px] transition-transform duration-300 ease-out will-change-transform"
            style={{
                transform: `translateY(${scrollTilt * -34}px) rotateX(${7 - scrollTilt * 5}deg) rotateY(${-9 + scrollTilt * 9}deg) scale(${1 + Math.abs(scrollTilt) * 0.025})`,
            }}
        >
            <div className="animate-float-slow overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white text-slate-950 shadow-[0_34px_90px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-slate-950 dark:text-white dark:shadow-[0_34px_110px_rgba(0,0,0,0.55)]">
                <div className="flex h-11 items-center justify-between border-b border-slate-200 bg-slate-100 px-4 dark:border-white/10 dark:bg-white/[0.04]">
                    <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    </div>

                    <div className="hidden rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-bold text-slate-500 shadow-sm dark:border-white/10 dark:bg-slate-900 dark:text-slate-400 sm:block">
                        app.equitylens.ai/NVDA
                    </div>

                    <div className="w-14" />
                </div>

                <div className="grid min-h-[420px] grid-cols-[7.5rem_1fr] bg-slate-50 dark:bg-slate-950/70">
                    <aside className="border-r border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.03]">
                        <div className="mb-6 flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                                <Brain className="h-4 w-4" />
                            </div>
                            <span className="text-xs font-black">EquityLens</span>
                        </div>

                        <div className="space-y-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                            <div className="rounded-lg bg-slate-100 px-3 py-2 text-slate-950 dark:bg-white/10 dark:text-white">
                                Research
                            </div>
                            <div className="px-3 py-2">Financials</div>
                            <div className="px-3 py-2">News</div>
                            <div className="px-3 py-2">Memo</div>
                        </div>
                    </aside>

                    <div className="p-5">
                        <div className="mb-5 flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">
                                    Live company analysis
                                </p>
                                <h3 className="mt-2 text-3xl font-black">
                                    NVIDIA Corporation
                                </h3>
                                <p className="mt-1 text-sm font-bold text-slate-500 dark:text-slate-400">
                                    NASDAQ: NVDA
                                </p>
                            </div>

                            <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-black text-emerald-600 dark:text-emerald-300">
                                BUY - 92%
                            </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-3">
                            <MiniStockCard label="Revenue" value="+21%" positive />
                            <MiniStockCard label="ROE" value="25%" positive />
                            <MiniStockCard label="P/E" value="31" />
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_0.8fr]">
                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                                <div className="mb-4 flex items-center justify-between">
                                    <p className="text-sm font-black">Score Trend</p>
                                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-300">
                                        +8.4%
                                    </p>
                                </div>

                                <div className="flex h-32 items-end gap-2">
                                    {[42, 58, 50, 66, 74, 69, 88, 92].map(
                                        (height, index) => (
                                            <div
                                                key={index}
                                                className="flex-1 rounded-t-lg bg-gradient-to-t from-cyan-500 to-emerald-300"
                                                style={{ height: `${height}%` }}
                                            />
                                        )
                                    )}
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                                <p className="text-sm font-black">Quality Score</p>
                                <div className="mt-4 flex items-center gap-4">
                                    <div className="flex h-20 w-20 items-center justify-center rounded-full border-[9px] border-cyan-400 text-lg font-black">
                                        94
                                    </div>
                                    <div className="space-y-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                                        <p>Growth: 89%</p>
                                        <p>Sentiment: 76%</p>
                                        <p>Risk: Medium</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                            <p className="text-sm font-black">Agent Memo</p>
                            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                                Strong revenue growth and AI infrastructure demand support the
                                thesis, with valuation risk flagged for review.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FilloutStyleWindow({
    onTabChange,
    onPickResearch,
}: {
    onTabChange: (tab: AppTab) => void;
    onPickResearch: (company: string) => void;
}) {
    return (
        <section className="grid items-stretch gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20">
                <div className="flex h-full flex-col">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                        <Zap className="h-5 w-5" />
                    </div>

                    <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">
                        Ask EquityLens anything.
                    </h2>

                    <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                        Natural-language research input that feels closer to ChatGPT than
                        a boring search form.
                    </p>

                    <div className="mt-6 flex-1 space-y-3">
                        {[
                            "Analyze Nvidia",
                            "Compare Tesla with Microsoft",
                            "Should I invest in Reliance?",
                        ].map((prompt) => (
                            <button
                                key={prompt}
                                onClick={() => {
                                    onPickResearch(prompt.replace("Analyze ", ""));
                                    onTabChange("research");
                                }}
                                className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-black text-slate-700 transition hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-300 dark:hover:bg-white/10"
                            >
                                {prompt}
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-center shadow-2xl shadow-slate-900/30 dark:border-white/10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_45%)]" />
                
                <div className="relative flex h-full flex-col justify-between">
                    <div>
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-emerald-300 backdrop-blur-md">
                            <Sparkles className="h-4 w-4" />
                            Ready to Research
                        </div>

                        <h2 className="text-3xl font-black tracking-tight text-white">
                            Run your first investment analysis
                        </h2>

                        <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-slate-300">
                            Analyze any public company's financials, health rating, and live news sentiment with our autonomous multi-agent pipeline in seconds.
                        </p>
                    </div>

                    <div className="mt-8">
                        <button
                            onClick={() => onTabChange("research")}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-black text-slate-950 shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:bg-slate-100"
                        >
                            Start Research
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

function HowItWorksSection() {
    return (
        <section className="pb-20">
            <div className="mx-auto mb-12 max-w-3xl text-center">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-sm font-bold text-violet-600 dark:text-violet-300">
                    <Sparkles className="h-4 w-4" />
                    How it works
                </div>

                <h2 className="text-4xl font-black tracking-tight text-slate-950 dark:text-white md:text-5xl">
                    One question becomes a full agent workflow.
                </h2>

            </div>

            <div className="relative mx-auto min-h-[760px] max-w-6xl px-4 py-10 sm:px-8">
                <div className="pointer-events-none absolute inset-x-10 bottom-16 h-px bg-slate-300 dark:bg-white/15" />
                <div className="pointer-events-none absolute right-[12%] top-16 hidden h-[620px] w-24 border-x border-slate-200 opacity-70 dark:border-white/10 lg:block">
                    <div className="h-full w-full bg-[linear-gradient(135deg,transparent_46%,rgba(148,163,184,0.45)_47%,rgba(148,163,184,0.45)_53%,transparent_54%)] bg-[length:42px_42px]" />
                </div>

                <div className="pointer-events-none absolute left-[12%] top-24 hidden h-16 w-32 rounded-full bg-slate-100 blur-sm dark:bg-white/10 md:block" />
                <div className="pointer-events-none absolute right-[18%] top-20 hidden h-10 w-28 rounded-full bg-slate-100 blur-sm dark:bg-white/10 md:block" />

                <div className="relative mx-auto min-h-[680px] max-w-5xl">
                    <LaunchWorkflowRocket />

                    {WORKFLOW.map((step, index) => (
                        <FlightStepCallout
                            key={step.title}
                            step={step}
                            side={index % 2 === 0 ? "left" : "right"}
                            bottom={`${9 + index * 14}%`}
                        />
                    ))}
                </div>

                <MobileWorkflowSteps />
            </div>
        </section>
    );
}

function LaunchWorkflowRocket() {
    return (
        <svg
            className="absolute left-1/2 top-2 z-10 h-[700px] w-[390px] -translate-x-1/2 overflow-visible"
            viewBox="0 0 390 700"
            role="img"
            aria-label="Workflow rocket showing six agent steps"
        >
            <defs>
                <linearGradient id="rocketBody" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="52%" stopColor="#f8fafc" />
                    <stop offset="100%" stopColor="#ffffff" />
                </linearGradient>
                <linearGradient id="rocketGreen" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#00e676" />
                </linearGradient>
                <filter id="rocketShadow" x="-30%" y="-30%" width="160%" height="160%">
                    <feDropShadow dx="0" dy="16" stdDeviation="18" floodColor="#0f172a" floodOpacity="0.14" />
                </filter>
            </defs>

            <g opacity="0.38" stroke="#94a3b8" strokeWidth="1" fill="none">
                <path d="M275 120h68v450" />
                <path d="M303 120v450" />
                <path d="M275 170h68M275 225h68M275 280h68M275 335h68M275 390h68M275 445h68M275 500h68" />
                <path d="M275 120l68 80M343 200l-68 80M275 280l68 80M343 360l-68 80M275 440l68 80" />
            </g>

            <g filter="url(#rocketShadow)">
                <path d="M195 20C166 44 151 76 141 111h108C239 76 224 44 195 20Z" fill="url(#rocketGreen)" stroke="#10b981" strokeWidth="2" />

                <path d="M139 126h112l7 86c-41 5-84 5-126 0l7-86Z" fill="url(#rocketBody)" stroke="#94a3b8" strokeWidth="1" />
                <path d="M132 226h126v89c-42 8-84 8-126 0v-89Z" fill="url(#rocketBody)" stroke="#94a3b8" strokeWidth="1" />
                <path d="M134 328h122l-7 78H141l-7-78Z" fill="url(#rocketBody)" stroke="#94a3b8" strokeWidth="1" />
                <path d="M145 417h100l16 54H129l16-54Z" fill="url(#rocketBody)" stroke="#94a3b8" strokeWidth="1" />
                <path d="M132 485h126l18 58H114l18-58Z" fill="url(#rocketBody)" stroke="#94a3b8" strokeWidth="1" />

                <path d="M132 226C87 246 72 292 72 333l60-18V226Z" fill="url(#rocketGreen)" stroke="#10b981" strokeWidth="1" />
                <path d="M258 226c45 20 60 66 60 107l-60-18V226Z" fill="url(#rocketGreen)" stroke="#10b981" strokeWidth="1" />

                <path d="M133 548 91 634h66l16-86H133Z" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" />
                <path d="M257 548 299 634h-66l-16-86h40Z" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" />
                <path d="M157 548h76v70h-76z" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" />

                <path d="M129 471h132M126 483h138M123 495h144M120 507h150" stroke="#475569" strokeWidth="1" opacity="0.72" />
                <path d="M154 150h54l-12 20h-42" stroke="#e2e8f0" strokeWidth="1" fill="none" />
                <path d="M160 247l20 75M221 342l-12 50" stroke="#e2e8f0" strokeWidth="5" opacity="0.8" />
                <path d="M152 171h16M225 278v22" stroke="#00e676" strokeWidth="4" />
                <path d="M112 574l52 60M278 574l-52 60" stroke="#94a3b8" strokeWidth="1" opacity="0.75" />

                {["6", "5", "4", "3", "2", "1"].map((label, index) => (
                    <text
                        key={label}
                        x="195"
                        y={[84, 180, 280, 377, 454, 527][index]}
                        textAnchor="middle"
                        className="fill-slate-950 text-[26px] font-black"
                    >
                        {label}
                    </text>
                ))}
            </g>

            <g fill="#ffffff" stroke="#94a3b8" strokeWidth="1">
                <path d="M65 675c4-31 27-54 58-50 13-31 55-38 80-13 31-24 80-8 88 32 27-4 48 8 58 31H65Z" />
                <path d="M103 659c9-20 27-31 52-24M187 652c18-21 52-18 70 2M257 675c8-22 27-34 51-30" fill="none" />
            </g>
            <path d="M10 681h370" stroke="#94a3b8" strokeWidth="1" />
        </svg>
    );
}

function FlightStepCallout({
    step,
    side,
    bottom,
}: {
    step: (typeof WORKFLOW)[number];
    side: "left" | "right";
    bottom: string;
}) {
    return (
        <div
            className={`absolute z-20 hidden w-[calc(50%-56px)] items-center lg:flex ${side === "left" ? "left-0 flex-row" : "right-0 flex-row-reverse"
                }`}
            style={{ bottom }}
        >
            <div className="shrink-0 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-lg shadow-slate-900/8 dark:border-white/10 dark:bg-slate-950">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                        {step.icon}
                    </div>

                    <div>
                        <p className="font-semibold text-slate-950 dark:text-white">
                            {step.title}
                        </p>
                    </div>
                </div>
            </div>

            <div className={`flex min-w-0 flex-1 items-center ${side === "left" ? "" : "flex-row-reverse"}`}>
                <span className="h-px flex-1 bg-slate-400 dark:bg-white/30" />
                <span className={`h-0 w-0 border-y-[4px] border-y-transparent ${side === "left" ? "border-l-[7px] border-l-slate-700 dark:border-l-white" : "border-r-[7px] border-r-slate-700 dark:border-r-white"}`} />
            </div>
        </div>
    );
}

function MobileWorkflowSteps() {
    return (
        <div className="mt-8 grid gap-3 lg:hidden">
            {WORKFLOW.map((step) => (
                <div
                    key={step.title}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                        {step.icon}
                    </div>

                    <div>
                        <p className="font-semibold text-slate-950 dark:text-white">
                            {step.title}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}

function MiniStockCard({
    label,
    value,
    positive,
}: {
    label: string;
    value: string;
    positive?: boolean;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <p className="text-xs font-bold text-slate-400">{label}</p>
            <p
                className={`mt-1 text-2xl font-black ${positive ? "text-emerald-600 dark:text-emerald-300" : "text-slate-950 dark:text-white"
                    }`}
            >
                {value}
            </p>
        </div>
    );
}

function ScoreLine({ label, value }: { label: string; value: number }) {
    return (
        <div>
            <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-bold text-slate-300">{label}</span>
                <span className="font-black text-white">{value}%</span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                    className="h-full rounded-full bg-cyan-300"
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    );
}

function SignalCard({
    title,
    tone,
}: {
    title: string;
    tone: "positive" | "warning";
}) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
            <p
                className={`text-sm font-black ${tone === "positive" ? "text-emerald-300" : "text-amber-300"
                    }`}
            >
                {title}
            </p>
        </div>
    );
}

function Metric({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-950/60">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                {label}
            </p>
            <p className="mt-1 text-xl font-black text-slate-950 dark:text-white">
                {value}
            </p>
        </div>
    );
}

function ReasonCard({
    icon,
    title,
    tone,
}: {
    icon: React.ReactNode;
    title: string;
    tone: "positive" | "warning";
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-950/60">
            <div
                className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${tone === "positive"
                    ? "bg-emerald-400/10 text-emerald-500"
                    : "bg-amber-400/10 text-amber-500"
                    }`}
            >
                {icon}
            </div>

            <p className="text-sm font-black text-slate-950 dark:text-white">
                {title}
            </p>
        </div>
    );
}
