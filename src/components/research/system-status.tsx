"use client";

import { useEffect, useState } from "react";
import {
    Activity,
    AlertTriangle,
    Brain,
    CheckCircle2,
    Database,
    Newspaper,
    RefreshCw,
    Server,
    XCircle,
} from "lucide-react";

type HealthResponse = {
    success: boolean;
    status: string;
    service: string;
    version: string;
    environment: string;
    services: {
        alphaVantage: {
            configured: boolean;
            purpose: string;
        };
        finnhub: {
            configured: boolean;
            purpose: string;
        };
        gemini: {
            configured: boolean;
            model: string;
            purpose: string;
        };
    };
    warnings: string[];
    endpoints: {
        research: string;
        compare: string;
        health: string;
    };
    timestamp: string;
};

export function SystemStatus() {
    const [health, setHealth] = useState<HealthResponse | null>(null);
    const [failed, setFailed] = useState(false);
    const [loading, setLoading] = useState(true);

    async function loadHealth() {
        setLoading(true);
        setFailed(false);

        try {
            const response = await fetch("/api/health", {
                method: "GET",
            });

            const data = (await response.json()) as HealthResponse;

            setHealth(data);
        } catch {
            setFailed(true);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadHealth();
    }, []);

    if (failed) {
        return (
            <section className="mb-8 rounded-[2rem] border border-red-400/20 bg-red-400/10 p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-red-600 dark:text-red-300">
                        <XCircle className="h-6 w-6" />

                        <div>
                            <h3 className="font-black">Backend status unavailable</h3>
                            <p className="mt-1 text-sm opacity-80">
                                The health endpoint could not be reached.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={loadHealth}
                        className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-white/60 px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-white dark:bg-white/10 dark:text-red-300 dark:hover:bg-white/15"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Retry
                    </button>
                </div>
            </section>
        );
    }

    if (loading || !health) {
        return (
            <section className="mb-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20">
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                    <Activity className="h-5 w-5 animate-pulse text-cyan-500" />
                    <p className="font-bold">Checking backend services...</p>
                </div>
            </section>
        );
    }

    return (
        <section className="mb-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20">
            <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
                <div className="relative bg-slate-950 p-6 text-white md:p-7">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.25),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(139,92,246,0.22),_transparent_35%)]" />

                    <div className="relative">
                        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                            <Server className="h-7 w-7 text-cyan-300" />
                        </div>

                        <p className="mb-2 text-sm font-black uppercase tracking-[0.3em] text-cyan-300">
                            System Status
                        </p>

                        <h3 className="text-2xl font-black">{health.service}</h3>

                        <p className="mt-2 text-sm text-slate-300">
                            Version {health.version} · {health.environment}
                        </p>

                        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-black text-emerald-300">
                            <CheckCircle2 className="h-4 w-4" />
                            {health.status.toUpperCase()}
                        </div>
                    </div>
                </div>

                <div className="p-6 md:p-7">
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h3 className="text-xl font-black text-slate-950 dark:text-white">
                                Provider readiness
                            </h3>

                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                Shows which services are real API-backed and which may use safe
                                fallback behavior.
                            </p>
                        </div>

                        <button
                            onClick={loadHealth}
                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <ProviderCard
                            icon={<Database className="h-5 w-5" />}
                            name="Alpha Vantage"
                            role="Financial data"
                            configured={health.services.alphaVantage.configured}
                            detail={health.services.alphaVantage.purpose}
                        />

                        <ProviderCard
                            icon={<Brain className="h-5 w-5" />}
                            name="Gemini"
                            role={health.services.gemini.model}
                            configured={health.services.gemini.configured}
                            detail={health.services.gemini.purpose}
                        />

                        <ProviderCard
                            icon={<Newspaper className="h-5 w-5" />}
                            name="Finnhub"
                            role="News data"
                            configured={health.services.finnhub.configured}
                            detail={health.services.finnhub.purpose}
                        />
                    </div>

                    {health.warnings.length > 0 && (
                        <div className="mt-5 rounded-[1.5rem] border border-amber-400/20 bg-amber-400/10 p-5">
                            <div className="mb-3 flex items-center gap-2 text-amber-600 dark:text-amber-300">
                                <AlertTriangle className="h-5 w-5" />
                                <p className="font-black">Service notes</p>
                            </div>

                            <ul className="space-y-2">
                                {health.warnings.map((warning, index) => (
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
                </div>
            </div>
        </section>
    );
}

function ProviderCard({
    icon,
    name,
    role,
    configured,
    detail,
}: {
    icon: React.ReactNode;
    name: string;
    role: string;
    configured: boolean;
    detail: string;
}) {
    return (
        <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-950/60">
            <div className="mb-4 flex items-start justify-between gap-3">
                <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-white/10 ${configured
                            ? "text-emerald-600 dark:text-emerald-300"
                            : "text-amber-600 dark:text-amber-300"
                        }`}
                >
                    {icon}
                </div>

                <span
                    className={`rounded-full border px-3 py-1 text-xs font-black ${configured
                            ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-600 dark:text-emerald-300"
                            : "border-amber-400/20 bg-amber-400/10 text-amber-600 dark:text-amber-300"
                        }`}
                >
                    {configured ? "LIVE" : "FALLBACK"}
                </span>
            </div>

            <h4 className="font-black text-slate-950 dark:text-white">{name}</h4>

            <p className="mt-1 text-sm font-bold text-slate-500 dark:text-slate-400">
                {role}
            </p>

            <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                {detail}
            </p>
        </div>
    );
}