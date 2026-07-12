"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
    Loader2,
    LogOut,
    Settings,
    ShieldCheck,
    Sparkles,
} from "lucide-react";
import type { AppTab } from "@/lib/frontend/app-tabs";

export function UserMenu({
    onTabChange,
}: {
    onTabChange?: (tab: AppTab) => void;
}) {
    const router = useRouter();
    const { data: session, status } = useSession();

    const [menuOpen, setMenuOpen] = useState(false);
    const [signingOut, setSigningOut] = useState(false);

    const loading = status === "loading";
    const loggedIn = status === "authenticated";
    const isAdmin = session?.user?.role === "ADMIN";

    function openTab(tab: AppTab) {
        setMenuOpen(false);
        onTabChange?.(tab);
    }

    async function handleLogout() {
        setSigningOut(true);

        await signOut({
            callbackUrl: "/",
        });
    }

    if (loading) {
        return (
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500 dark:border-white/10 dark:bg-white/10 dark:text-slate-300">
                <Loader2 className="h-4 w-4 animate-spin" />
            </div>
        );
    }

    if (!loggedIn) {
        return (
            <button
                onClick={() => router.push("/auth/login")}
                className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-full bg-slate-950 px-3.5 text-xs font-black text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 sm:h-11 sm:px-5 sm:text-sm dark:bg-white dark:text-slate-950"
            >
                <Sparkles className="h-4 w-4" />
                Get Started
            </button>
        );
    }

    const displayName =
        session.user?.name?.trim() ||
        session.user?.email?.split("@")[0] ||
        "Investor";

    const initials = getInitials(displayName);

    return (
        <div className="relative">
            <button
                onClick={() => setMenuOpen((current) => !current)}
                aria-label="Open profile menu"
                aria-expanded={menuOpen}
                className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-800 shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
            >
                {session.user?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={session.user.image}
                        alt={displayName}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    initials
                )}
            </button>

            {menuOpen && (
                <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10 dark:border-white/10 dark:bg-slate-950 dark:shadow-black/30">
                    <div className="border-b border-slate-100 px-3 py-3 dark:border-white/10">
                        <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                            {displayName}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                            {session.user?.email}
                        </p>

                        {isAdmin && <span className="mt-2 inline-flex rounded-md bg-violet-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-700 dark:bg-violet-400/10 dark:text-violet-300">Admin</span>}
                    </div>

                    <div className="py-1">
                        {isAdmin && (
                            <MenuButton
                                icon={<ShieldCheck className="h-4 w-4" />}
                                label="Admin Dashboard"
                                onClick={() => {
                                    setMenuOpen(false);
                                    router.push("/admin");
                                }}
                            />
                        )}

                        <MenuButton
                            icon={<Settings className="h-4 w-4" />}
                            label="Settings"
                            onClick={() => openTab("settings")}
                        />

                        <button
                            onClick={() => void handleLogout()}
                            disabled={signingOut}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-60 dark:text-red-300 dark:hover:bg-red-400/10"
                        >
                            {signingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                            {signingOut ? "Signing out…" : "Sign out"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function MenuButton({
    icon,
    label,
    onClick,
}: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-slate-100 dark:hover:bg-white/10"
        >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300">
                {icon}
            </div>

            <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">
                    {label}
            </span>
        </button>
    );
}

function getInitials(name: string) {
    const parts = name
        .split(" ")
        .map((part) => part.trim())
        .filter(Boolean);

    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }

    return name.slice(0, 2).toUpperCase();
}
