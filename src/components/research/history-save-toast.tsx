"use client";

import { CheckCircle2, Database, HardDrive, Info, XCircle } from "lucide-react";
import type { AutoSaveHistoryResult } from "@/lib/user-data/auto-save-history";

type HistorySaveToastProps = {
    result: AutoSaveHistoryResult | null;
    onClose: () => void;
};

export function HistorySaveToast({ result, onClose }: HistorySaveToastProps) {
    if (!result) return null;

    const Icon =
        result.mode === "database"
            ? Database
            : result.mode === "local"
                ? HardDrive
                : result.saved
                    ? CheckCircle2
                    : Info;

    const isError = Boolean(result.error);

    return (
        <div className="fixed bottom-6 right-6 z-[70] w-[calc(100vw-3rem)] max-w-md">
            <div
                className={`overflow-hidden rounded-[1.75rem] border p-4 shadow-2xl backdrop-blur-xl ${isError
                        ? "border-red-400/20 bg-red-950/90 text-red-50 shadow-red-950/30"
                        : "border-white/10 bg-slate-950/90 text-white shadow-slate-950/30"
                    }`}
            >
                <div className="flex gap-4">
                    <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${isError
                                ? "bg-red-400/15 text-red-200"
                                : result.mode === "database"
                                    ? "bg-emerald-400/15 text-emerald-200"
                                    : result.mode === "local"
                                        ? "bg-cyan-400/15 text-cyan-200"
                                        : "bg-amber-400/15 text-amber-200"
                            }`}
                    >
                        {isError ? (
                            <XCircle className="h-5 w-5" />
                        ) : (
                            <Icon className="h-5 w-5" />
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm font-black">
                                    {result.mode === "database"
                                        ? "Saved to database"
                                        : result.mode === "local"
                                            ? "Saved locally"
                                            : "History not saved"}
                                </p>

                                <p className="mt-1 text-sm leading-6 text-slate-300">
                                    {result.message}
                                </p>

                                {result.error && (
                                    <p className="mt-2 rounded-2xl bg-red-400/10 px-3 py-2 text-xs font-bold leading-5 text-red-100">
                                        {result.error}
                                    </p>
                                )}
                            </div>

                            <button
                                onClick={onClose}
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/70 transition hover:bg-white/15 hover:text-white"
                            >
                                ×
                            </button>
                        </div>

                        <div className="mt-4 flex items-center gap-2">
                            <span
                                className={`h-2 flex-1 rounded-full ${result.mode === "database"
                                        ? "bg-emerald-300"
                                        : result.mode === "local"
                                            ? "bg-cyan-300"
                                            : "bg-amber-300"
                                    }`}
                            />

                            <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                                EquityLens
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}