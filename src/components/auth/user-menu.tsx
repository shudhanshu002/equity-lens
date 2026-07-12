"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
    History,
    Loader2,
    LogIn,
    LogOut,
    Settings,
    ShieldCheck,
    Sparkles,
    UserCircle2,
} from "lucide-react";
import { AuthModal } from "@/components/auth/auth-modal";
import type { AppTab } from "@/lib/frontend/app-tabs";

export function UserMenu({
    onTabChange,
}: {
    onTabChange?: (tab: AppTab) => void;
}) {
    const router = useRouter();
    const { data: session, status } = useSession();

    const [authOpen, setAuthOpen] = useState(false);
    const [authMode, setAuthMode] = useState<"login" | "signup">("login");
    const [menuOpen, setMenuOpen] = useState(false);

    const loading = status === "loading";
    const loggedIn = status === "authenticated";
    const isAdmin = session?.user?.role === "ADMIN";

    function openLogin() {
        setAuthMode("login");
        setAuthOpen(true);
    }

    function openSignup() {
        setAuthMode("signup");
        setAuthOpen(true);
    }

    function openTab(tab: AppTab) {
        setMenuOpen(false);
        onTabChange?.(tab);
    }

    async function handleLogout() {
        setMenuOpen(false);

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
            <>
                <div className="flex items-center gap-2">
                    <button
                        onClick={openLogin}
                        className="hidden h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-black text-slate-700 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-lg hover:shadow-slate-900/10 dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15 sm:inline-flex"
                    >
                        <LogIn className="h-4 w-4" />
                        Login
                    </button>

                    <button
                        onClick={openSignup}
                        className="inline-flex h-11 items-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-black text-white shadow-xl shadow-slate-900/20 transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950"
                    >
                        <Sparkles className="h-4 w-4" />
                        Start
                    </button>
                </div>

                <AuthModal
                    open={authOpen}
                    defaultMode={authMode}
                    onClose={() => setAuthOpen(false)}
                />
            </>
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
                className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 text-sm font-black text-slate-950 shadow-lg shadow-slate-900/5 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-slate-900/10 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
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
                <div className="absolute right-0 z-50 mt-3 w-72 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-900/15 dark:border-white/10 dark:bg-slate-950 dark:shadow-black/30">
                    <div className="border-b border-slate-100 p-4 dark:border-white/10">
                        <p className="text-sm font-black text-slate-950 dark:text-white">
                            {displayName}
                        </p>

                        <p className="mt-1 truncate text-xs font-bold text-slate-500 dark:text-slate-400">
                            {session.user?.email}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                            <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-[11px] font-black text-cyan-700 dark:text-cyan-300">
                                {session.user?.role ?? "USER"}
                            </span>

                            {isAdmin && (
                                <span className="rounded-full bg-red-400/10 px-3 py-1 text-[11px] font-black text-red-700 dark:text-red-300">
                                    ADMIN
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="p-2">
                        {isAdmin && (
                            <MenuButton
                                icon={<ShieldCheck className="h-4 w-4" />}
                                label="Admin Dashboard"
                                description="Users, health, audit, cleanup"
                                onClick={() => {
                                    setMenuOpen(false);
                                    router.push("/admin");
                                }}
                            />
                        )}

                        <MenuButton
                            icon={<History className="h-4 w-4" />}
                            label="History"
                            description="Saved research reports"
                            onClick={() => openTab("history")}
                        />

                        <MenuButton
                            icon={<Settings className="h-4 w-4" />}
                            label="Settings"
                            description="Profile and preferences"
                            onClick={() => openTab("settings")}
                        />

                        <MenuButton
                            icon={<UserCircle2 className="h-4 w-4" />}
                            label="Portfolio"
                            description="Watchlist workspace"
                            onClick={() => openTab("portfolio")}
                        />

                        <button
                            onClick={() => void handleLogout()}
                            className="mt-2 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-black text-red-600 transition hover:bg-red-400/10 dark:text-red-300"
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
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
    description,
    onClick,
}: {
    icon: React.ReactNode;
    label: string;
    description: string;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className="flex w-full items-start gap-3 rounded-2xl px-4 py-3 text-left transition hover:bg-slate-100 dark:hover:bg-white/10"
        >
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200">
                {icon}
            </div>

            <span>
                <span className="block text-sm font-black text-slate-950 dark:text-white">
                    {label}
                </span>

                <span className="mt-0.5 block text-xs leading-5 text-slate-500 dark:text-slate-400">
                    {description}
                </span>
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