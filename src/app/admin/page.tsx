"use client";

import { useRouter } from "next/navigation";
import { AdminAuditPanel } from "@/components/admin/admin-audit-panel";
import { AdminCleanupPanel } from "@/components/admin/admin-cleanup-panel";
import { AdminExportPanel } from "@/components/admin/admin-export-panel";
import { AdminHealthPanel } from "@/components/admin/admin-health-panel";
import { AdminPromoteCard } from "@/components/admin/admin-promote-card";
import { AdminStatsPanel } from "@/components/admin/admin-stats-panel";
import { AdminUsersPanel } from "@/components/admin/admin-users-panel";
import { NavbarAppShell } from "@/components/research/navbar-app-shell";
import type { AppTab } from "@/lib/frontend/app-tabs";

export default function AdminPage() {
    const router = useRouter();

    function handleTabChange(tab: AppTab) {
        router.push(`/?tab=${tab}`);
    }

    return (
        <NavbarAppShell activeTab="settings" onTabChange={handleTabChange}>
            <div className="mx-auto w-full max-w-7xl space-y-10 px-4 pb-20 pt-28 sm:px-6 lg:px-8">
                <AdminPromoteCard />
                <AdminHealthPanel />
                <AdminStatsPanel />
                <AdminAuditPanel />
                <AdminExportPanel />
                <AdminCleanupPanel />
                <AdminUsersPanel />
            </div>
        </NavbarAppShell>
    );
}