"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, BarChart3, Download, HeartPulse, Shield, Trash2, Users } from "lucide-react";
import { AdminAuditPanel } from "@/components/admin/admin-audit-panel";
import { AdminCleanupPanel } from "@/components/admin/admin-cleanup-panel";
import { AdminExportPanel } from "@/components/admin/admin-export-panel";
import { AdminHealthPanel } from "@/components/admin/admin-health-panel";
import { AdminStatsPanel } from "@/components/admin/admin-stats-panel";
import { AdminUsersPanel } from "@/components/admin/admin-users-panel";
import { NavbarAppShell } from "@/components/research/navbar-app-shell";
import type { AppTab } from "@/lib/frontend/app-tabs";

export default function AdminPage() {
    const router = useRouter();
    const [view, setView] = useState<AdminView>("overview");

    function handleTabChange(tab: AppTab) {
        router.push(`/?tab=${tab}`);
    }

    return (
        <NavbarAppShell activeTab="settings" onTabChange={handleTabChange}>
            <div className="mx-auto w-full max-w-7xl px-4 pb-20 pt-24 sm:px-6 lg:px-8">
                <header className="border-b border-slate-200 pb-5 dark:border-white/10">
                    <div className="flex items-center gap-2 text-sm font-semibold text-red-600 dark:text-red-300">
                        <Shield className="h-4 w-4" /> Platform administration
                    </div>
                    <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">Admin workspace</h1>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Monitor usage, services, users, and platform operations.</p>
                        </div>
                        <span className="inline-flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Admin access active
                        </span>
                    </div>
                </header>

                <nav className="mt-4 flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-white/10" aria-label="Admin sections">
                    {adminViews.map((item) => {
                        const Icon = item.icon;
                        return <button key={item.id} onClick={() => setView(item.id)} className={`inline-flex h-10 shrink-0 items-center gap-2 border-b-2 px-3 text-sm font-medium transition ${view === item.id ? "border-slate-950 text-slate-950 dark:border-white dark:text-white" : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"}`}><Icon className="h-4 w-4" />{item.label}</button>;
                    })}
                </nav>

                <main className="admin-compact mt-4">
                    {view === "overview" && <AdminStatsPanel />}
                    {view === "health" && <AdminHealthPanel />}
                    {view === "users" && <AdminUsersPanel />}
                    {view === "activity" && <AdminAuditPanel />}
                    {view === "exports" && <AdminExportPanel />}
                    {view === "maintenance" && <AdminCleanupPanel />}
                </main>
            </div>
        </NavbarAppShell>
    );
}

type AdminView = "overview" | "health" | "users" | "activity" | "exports" | "maintenance";

const adminViews: { id: AdminView; label: string; icon: typeof Activity }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "health", label: "Health", icon: HeartPulse },
    { id: "users", label: "Users", icon: Users },
    { id: "activity", label: "Activity", icon: Activity },
    { id: "exports", label: "Exports", icon: Download },
    { id: "maintenance", label: "Maintenance", icon: Trash2 },
];
