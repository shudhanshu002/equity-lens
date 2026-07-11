"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
    Activity,
    AlertTriangle,
    Clock,
    Download,
    FileText,
    Loader2,
    RefreshCcw,
    Search,
    ShieldAlert,
    Sparkles,
    Star,
    UserPlus,
} from "lucide-react";
import {
    formatAdminAuditDate,
    getAdminAuditActionLabel,
    getAdminAuditActorName,
    getAdminAuditCategoryLabel,
    getAdminAuditCategoryStyle,
    getAdminAuditEvents,
    sortAdminAuditEvents,
    type AdminAuditCategory,
    type AdminAuditEvent,
} from "@/lib/user-data/admin-audit-client";

export function AdminAuditPanel() {
    const { data: session, status } = useSession();

    const [events, setEvents] = useState<AdminAuditEvent[]>([]);
    const [category, setCategory] = useState<"ALL" | AdminAuditCategory>("ALL");
    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const isAdmin = session?.user?.role === "ADMIN";

    async function loadAuditEvents() {
        if (!isAdmin) {
            setLoading(false);
            setRefreshing(false);
            return;
        }

        setError("");

        try {
            const result = await getAdminAuditEvents(50);
            setEvents(sortAdminAuditEvents(result.events));
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to load audit events."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        if (status !== "loading") {
            void loadAuditEvents();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, isAdmin]);

    async function refreshAuditEvents() {
        setRefreshing(true);
        await loadAuditEvents();
    }

    const filteredEvents = events.filter((event) => {
        const matchesCategory = category === "ALL" || event.category === category;

        const searchText = search.trim().toLowerCase();

        const matchesSearch =
            !searchText ||
            event.title.toLowerCase().includes(searchText) ||
            event.description.toLowerCase().includes(searchText) ||
            event.actor.email.toLowerCase().includes(searchText) ||
            getAdminAuditActorName(event.actor).toLowerCase().includes(searchText);

        return matchesCategory && matchesSearch;
    });

    if (status === "loading" || loading) {
        return (
            <section className="rounded-[2.5rem] border border-slate-200 bg-white p-12 text-center shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04]">
                <Loader2 className="mx-auto h-10 w-10 animate-spin text-slate-400" />

                <h2 className="mt-5 text-3xl font-black text-slate-950 dark:text-white">
                    Loading audit trail
                </h2>

                <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                    Fetching recent platform activity from users, research, exports, and
                    watchlists.
                </p>
            </section>
        );
    }

    if (!isAdmin) {
        return (
            <section className="rounded-[2.75rem] border border-red-400/20 bg-red-400/10 p-8 text-center">
                <ShieldAlert className="mx-auto h-12 w-12 text-red-600 dark:text-red-300" />

                <h2 className="mt-5 text-3xl font-black text-slate-950 dark:text-white">
                    Admin audit requires admin access
                </h2>

                <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-700 dark:text-slate-300">
                    Only users with the ADMIN role can view platform audit activity.
                </p>
            </section>
        );
    }

    return (
        <section className="rounded-[2.75rem] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/30 md:p-8">
            <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-sm font-black text-violet-700 dark:text-violet-300">
                        <Activity className="h-4 w-4" />
                        Audit Trail
                    </div>

                    <h2 className="text-4xl font-black tracking-tight text-slate-950 dark:text-white">
                        Recent platform activity.
                    </h2>

                    <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">
                        Review user registrations, saved research reports, comparison
                        records, export activity, and watchlist additions.
                    </p>
                </div>

                <button
                    onClick={() => void refreshAuditEvents()}
                    disabled={refreshing}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-6 text-sm font-black text-white shadow-xl shadow-slate-900/15 transition hover:-translate-y-0.5 disabled:opacity-60 dark:bg-white dark:text-slate-950"
                >
                    {refreshing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <RefreshCcw className="h-4 w-4" />
                    )}
                    Refresh
                </button>
            </div>

            {error && (
                <p className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-bold text-red-600 dark:text-red-300">
                    <AlertTriangle className="mr-2 inline h-4 w-4" />
                    {error}
                </p>
            )}

            <div className="mb-6 grid gap-3 lg:grid-cols-[1fr_auto]">
                <div className="flex h-14 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 dark:border-white/10 dark:bg-slate-950/60">
                    <Search className="h-5 w-5 text-slate-400" />

                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search audit activity..."
                        className="w-full bg-transparent text-sm font-bold text-slate-950 outline-none placeholder:text-slate-400 dark:text-white"
                    />
                </div>

                <select
                    value={category}
                    onChange={(event) =>
                        setCategory(event.target.value as "ALL" | AdminAuditCategory)
                    }
                    className="h-14 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-black text-slate-950 outline-none dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
                >
                    <option value="ALL">All Activity</option>
                    <option value="USER">Users</option>
                    <option value="HISTORY">Research</option>
                    <option value="EXPORT">Exports</option>
                    <option value="WATCHLIST">Watchlist</option>
                </select>
            </div>

            <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <AuditMetric
                    icon={<UserPlus className="h-5 w-5" />}
                    label="Users"
                    value={String(events.filter((event) => event.category === "USER").length)}
                />

                <AuditMetric
                    icon={<FileText className="h-5 w-5" />}
                    label="Research"
                    value={String(
                        events.filter((event) => event.category === "HISTORY").length
                    )}
                />

                <AuditMetric
                    icon={<Download className="h-5 w-5" />}
                    label="Exports"
                    value={String(events.filter((event) => event.category === "EXPORT").length)}
                />

                <AuditMetric
                    icon={<Star className="h-5 w-5" />}
                    label="Watchlist"
                    value={String(
                        events.filter((event) => event.category === "WATCHLIST").length
                    )}
                />
            </div>

            {filteredEvents.length > 0 ? (
                <div className="space-y-4">
                    {filteredEvents.map((event) => (
                        <AuditEventCard key={event.id} event={event} />
                    ))}
                </div>
            ) : (
                <div className="rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 p-10 text-center dark:border-white/10 dark:bg-slate-950/60">
                    <Sparkles className="mx-auto h-10 w-10 text-slate-400" />

                    <h3 className="mt-4 text-2xl font-black text-slate-950 dark:text-white">
                        No audit events found
                    </h3>

                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        Try changing the search text or category filter.
                    </p>
                </div>
            )}
        </section>
    );
}

function AuditEventCard({ event }: { event: AdminAuditEvent }) {
    return (
        <article className="rounded-[2rem] border border-slate-200 bg-slate-50 p-5 transition hover:bg-white hover:shadow-xl hover:shadow-slate-900/5 dark:border-white/10 dark:bg-slate-950/60 dark:hover:bg-white/[0.06]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span
                            className={`rounded-full border px-3 py-1 text-xs font-black ${getAdminAuditCategoryStyle(
                                event.category
                            )}`}
                        >
                            {getAdminAuditCategoryLabel(event.category)}
                        </span>

                        <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-black text-slate-600 dark:bg-white/10 dark:text-slate-300">
                            {getAdminAuditActionLabel(event.action)}
                        </span>
                    </div>

                    <h3 className="text-xl font-black text-slate-950 dark:text-white">
                        {event.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                        {event.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-3 text-xs font-bold text-slate-500 dark:text-slate-400">
                        <span>Actor: {getAdminAuditActorName(event.actor)}</span>
                        <span>·</span>
                        <span>{event.actor.email}</span>
                    </div>
                </div>

                <div className="shrink-0 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-black text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                    <Clock className="mr-2 inline h-4 w-4" />
                    {formatAdminAuditDate(event.createdAt)}
                </div>
            </div>

            {Object.keys(event.metadata).length > 0 && (
                <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                    {Object.entries(event.metadata)
                        .filter(([, value]) => value !== null && value !== undefined)
                        .slice(0, 4)
                        .map(([key, value]) => (
                            <div
                                key={key}
                                className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-white/5"
                            >
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                    {formatMetadataKey(key)}
                                </p>

                                <p className="mt-1 truncate text-sm font-black text-slate-950 dark:text-white">
                                    {String(value)}
                                </p>
                            </div>
                        ))}
                </div>
            )}
        </article>
    );
}

function AuditMetric({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-950/60">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-violet-600 shadow-sm dark:bg-white/10 dark:text-violet-300">
                {icon}
            </div>

            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                {label}
            </p>

            <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">
                {value}
            </p>
        </div>
    );
}

function formatMetadataKey(key: string) {
    return key
        .replace(/([A-Z])/g, " $1")
        .replace(/_/g, " ")
        .trim();
}