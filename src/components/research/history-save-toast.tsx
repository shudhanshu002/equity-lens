"use client";

import { useEffect } from "react";
import { CheckCircle2, HardDrive, Info, X, XCircle } from "lucide-react";
import type { AutoSaveHistoryResult } from "@/lib/user-data/auto-save-history";

type HistorySaveToastProps = {
    result: AutoSaveHistoryResult | null;
    onClose: () => void;
};

export function HistorySaveToast({ result, onClose }: HistorySaveToastProps) {
    useEffect(() => {
        if (!result) return;
        const timeout = window.setTimeout(onClose, result.error ? 6000 : 3200);
        return () => window.clearTimeout(timeout);
    }, [result, onClose]);

    if (!result) return null;

    const isError = Boolean(result.error);
    const Icon = isError ? XCircle : result.mode === "local" ? HardDrive : result.saved ? CheckCircle2 : Info;
    const title = isError ? "Save failed" : result.mode === "database" ? "Saved" : result.mode === "local" ? "Saved locally" : "Not saved";
    const message = result.mode === "database" && !isError ? "Added to account history" : result.message;

    return (
        <div className="fixed bottom-6 right-6 z-[70] w-[calc(100vw-3rem)] max-w-xs animate-in fade-in slide-in-from-bottom-2">
            <div className={`rounded-xl border p-3 shadow-xl backdrop-blur-xl ${isError ? "border-red-400/20 bg-red-950/90 text-red-50" : "border-white/10 bg-slate-950/90 text-white"}`}>
                <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${isError ? "bg-red-400/15 text-red-200" : "bg-emerald-400/15 text-emerald-200"}`}>
                        <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">{title}</p>
                        <p className="mt-0.5 truncate text-xs text-slate-300">{message}</p>
                    </div>
                    <button onClick={onClose} aria-label="Dismiss notification" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-white/60 transition hover:bg-white/10 hover:text-white">
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
