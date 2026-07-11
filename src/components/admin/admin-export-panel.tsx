"use client";

import type React from "react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import {
    AlertTriangle,
    CheckCircle2,
    Database,
    Download,
    FileJson,
    FileSpreadsheet,
    Loader2,
    RefreshCcw,
    ShieldAlert,
    Sparkles,
} from "lucide-react";
import {
    downloadAdminExport,
    formatAdminExportDate,
    getAdminExportFormatLabel,
    getAdminExportJson,
    getAdminExportScopeDescription,
    getAdminExportScopeLabel,
    type AdminExportData,
    type AdminExportFormat,
    type AdminExportScope,
} from "@/lib/user-data/admin-export-client";

const EXPORT_SCOPES: AdminExportScope[] = [
    "all",
    "users",
    "history",
    "watchlist",
    "exports",
];

const EXPORT_FORMATS: AdminExportFormat[] = ["json", "csv"];

export function AdminExportPanel() {
    const { data: session, status } = useSession();

    const [scope, setScope] = useState<AdminExportScope>("all");
    const [format, setFormat] = useState<AdminExportFormat>("json");
    const [limit, setLimit] = useState(100);

    const [preview, setPreview] = useState<AdminExportData | null>(null);
    const [working, setWorking] = useState(false);
    const [previewLoading, setPreviewLoading] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const isAdmin = session?.user?.role === "ADMIN";

    async function handlePreview() {
        setPreviewLoading(true);
        setMessage("");
        setError("");

        try {
            const data = await getAdminExportJson({
                scope,
                limit,
            });

            setPreview(data);
            setMessage("Export preview generated.");
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to preview export."
            );
        } finally {
            setPreviewLoading(false);
        }
    }

    async function handleDownload() {
        setWorking(true);
        setMessage("");
        setError("");

        try {
            const result = await downloadAdminExport({
                scope,
                format,
                limit,
            });

            setMessage(
                result.count === null
                    ? `Downloaded ${getAdminExportFormatLabel(format)} export.`
                    : `Downloaded ${result.count} records as ${getAdminExportFormatLabel(
                        format
                    )}.`
            );
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to download export."
            );
        } finally {
            setWorking(false);
        }
    }

    if (status === "loading") {
        return (
            <section className="rounded-[2.5rem] border border-slate-200 bg-white p-12 text-center shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04]">
                <Loader2 className="mx-auto h-10 w-10 animate-spin text-slate-400" />

                <h2 className="mt-5 text-3xl font-black text-slate-950 dark:text-white">
                    Loading export console
                </h2>

                <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                    Checking admin access before enabling exports.
                </p>
            </section>
        );
    }

    if (!isAdmin) {
        return (
            <section className="rounded-[2.75rem] border border-red-400/20 bg-red-400/10 p-8 text-center">
                <ShieldAlert className="mx-auto h-12 w-12 text-red-600 dark:text-red-300" />

                <h2 className="mt-5 text-3xl font-black text-slate-950 dark:text-white">
                    Admin export requires admin access
                </h2>

                <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-700 dark:text-slate-300">
                    Only users with the ADMIN role can export platform data.
                </p>
            </section>
        );
    }

    return (
        <section className="relative overflow-hidden rounded-[2.75rem] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/30 md:p-8">
            <div className="absolute right-[-18%] top-[-42%] h-96 w-96 rounded-full bg-violet-400/20 blur-3xl dark:bg-violet-400/10" />
            <div className="absolute bottom-[-44%] left-[14%] h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-400/10" />

            <div className="relative">
                <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-sm font-black text-violet-700 dark:text-violet-300">
                            <Download className="h-4 w-4" />
                            Admin Export
                        </div>

                        <h2 className="text-4xl font-black tracking-tight text-slate-950 dark:text-white">
                            Export platform data safely.
                        </h2>

                        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">
                            Download users, research history, watchlists, and export records
                            in JSON or CSV format. Password hashes and secrets are never
                            exported.
                        </p>
                    </div>

                    <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-black text-emerald-700 dark:text-emerald-300">
                        <Sparkles className="h-4 w-4" />
                        Secret-safe export
                    </div>
                </div>

                {message && (
                    <p className="mb-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="mr-2 inline h-4 w-4" />
                        {message}
                    </p>
                )}

                {error && (
                    <p className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-bold text-red-600 dark:text-red-300">
                        <AlertTriangle className="mr-2 inline h-4 w-4" />
                        {error}
                    </p>
                )}

                <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                    <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-950/60">
                        <h3 className="mb-5 text-xl font-black text-slate-950 dark:text-white">
                            Export Options
                        </h3>

                        <div className="space-y-5">
                            <div>
                                <label className="mb-2 block text-sm font-black text-slate-950 dark:text-white">
                                    Export scope
                                </label>

                                <div className="grid gap-3">
                                    {EXPORT_SCOPES.map((item) => (
                                        <button
                                            key={item}
                                            onClick={() => setScope(item)}
                                            className={`rounded-2xl border p-4 text-left transition ${scope === item
                                                    ? "border-violet-400/40 bg-violet-400/10"
                                                    : "border-slate-200 bg-white hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                                                }`}
                                        >
                                            <p className="font-black text-slate-950 dark:text-white">
                                                {getAdminExportScopeLabel(item)}
                                            </p>

                                            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                                                {getAdminExportScopeDescription(item)}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-black text-slate-950 dark:text-white">
                                    Export format
                                </label>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    {EXPORT_FORMATS.map((item) => (
                                        <button
                                            key={item}
                                            onClick={() => setFormat(item)}
                                            className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${format === item
                                                    ? "border-cyan-400/40 bg-cyan-400/10"
                                                    : "border-slate-200 bg-white hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                                                }`}
                                        >
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                                                {item === "json" ? (
                                                    <FileJson className="h-5 w-5" />
                                                ) : (
                                                    <FileSpreadsheet className="h-5 w-5" />
                                                )}
                                            </div>

                                            <div>
                                                <p className="font-black text-slate-950 dark:text-white">
                                                    {getAdminExportFormatLabel(item)}
                                                </p>

                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    {item === "json"
                                                        ? "Best for backup/debugging"
                                                        : "Best for spreadsheet review"}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-black text-slate-950 dark:text-white">
                                    Limit per section
                                </label>

                                <input
                                    type="number"
                                    min={1}
                                    max={1000}
                                    value={limit}
                                    onChange={(event) => setLimit(Number(event.target.value))}
                                    className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-950 outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                                />

                                <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                                    Maximum 1000 records per exported section.
                                </p>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <button
                                    onClick={() => void handlePreview()}
                                    disabled={previewLoading || working}
                                    className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
                                >
                                    {previewLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <RefreshCcw className="h-4 w-4" />
                                    )}
                                    Preview
                                </button>

                                <button
                                    onClick={() => void handleDownload()}
                                    disabled={working || previewLoading}
                                    className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white shadow-xl shadow-slate-900/20 transition hover:-translate-y-0.5 disabled:opacity-60 dark:bg-white dark:text-slate-950"
                                >
                                    {working ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Download className="h-4 w-4" />
                                    )}
                                    Download
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-950/60">
                        <h3 className="mb-5 text-xl font-black text-slate-950 dark:text-white">
                            Export Preview
                        </h3>

                        {preview ? (
                            <div className="space-y-5">
                                <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
                                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                                        Last Preview
                                    </p>

                                    <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                                        {getAdminExportScopeLabel(preview.scope)} ·{" "}
                                        {getAdminExportFormatLabel(format)}
                                    </p>

                                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                        Generated {formatAdminExportDate(preview.exportedAt)}
                                    </p>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <ExportCountBox
                                        label="Users"
                                        value={preview.counts.users}
                                        icon={<Database className="h-5 w-5" />}
                                    />

                                    <ExportCountBox
                                        label="History"
                                        value={preview.counts.historyItems}
                                        icon={<FileJson className="h-5 w-5" />}
                                    />

                                    <ExportCountBox
                                        label="Watchlist"
                                        value={preview.counts.watchlistItems}
                                        icon={<Sparkles className="h-5 w-5" />}
                                    />

                                    <ExportCountBox
                                        label="Exports"
                                        value={preview.counts.exportItems}
                                        icon={<Download className="h-5 w-5" />}
                                    />
                                </div>

                                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                                    <CheckCircle2 className="mr-2 inline h-4 w-4" />
                                    {preview.counts.total} records ready for export.
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center dark:border-white/10 dark:bg-white/5">
                                <FileJson className="mx-auto h-10 w-10 text-slate-400" />

                                <h4 className="mt-4 text-2xl font-black text-slate-950 dark:text-white">
                                    No preview yet
                                </h4>

                                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                                    Generate a preview before downloading if you want to inspect
                                    the record counts first.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-xs font-black text-amber-700 dark:text-amber-300">
                    <AlertTriangle className="mr-2 inline h-4 w-4" />
                    Admin exports contain user emails and workspace metadata. Do not commit
                    exported files to GitHub.
                </div>
            </div>
        </section>
    );
}

function ExportCountBox({
    label,
    value,
    icon,
}: {
    label: string;
    value: number;
    icon: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-400/10 text-violet-700 dark:text-violet-300">
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