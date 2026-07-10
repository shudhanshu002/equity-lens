"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import {
    ArrowRight,
    ChevronDown,
    Loader2,
    LogIn,
    LogOut,
    Settings,
    ShieldCheck,
    User,
    UserPlus,
} from "lucide-react";
import { AuthModal } from "@/components/auth/auth-modal";
import type { AppTab } from "@/lib/frontend/app-tabs";

type UserMenuProps = {
    onTabChange: (tab: AppTab) => void;
};

export function UserMenu({ onTabChange }: UserMenuProps) {
    const { data: session, status } = useSession();

    const [authOpen, setAuthOpen] = useState(false);
    const [authMode, setAuthMode] = useState<"login" | "signup">("login");
    const [menuOpen, setMenuOpen] = useState(false);

    const loading = status === "loading";
    const loggedIn = status === "authenticated" && session?.user;

    function openLogin() {
        setAuthMode("login");
        setAuthOpen(true);
        setMenuOpen(false);
    }

    function openSignup() {
        setAuthMode("signup");
        setAuthOpen(true);
        setMenuOpen(false);
    }

    if (loading) {
        return (
            <div className="hidden items-center gap-2 lg:flex">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-500 shadow-lg shadow-slate-900/5 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Checking
                </div>
            </div>
        );
    }

    if (!loggedIn) {
        return (
            <>
                <div className="hidden items-center gap-2 lg:flex">
                    <button
                        onClick={openLogin}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 shadow-lg shadow-slate-900/5 transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                    >
                        <LogIn className="h-4 w-4" />
                        Login
                    </button>

                    <button
                        onClick={openSignup}
                        className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-black text-white shadow-xl shadow-slate-900/20 transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950"
                    >
                        Get Started
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex items-center gap-2 lg:hidden">
                    <button
                        onClick={openLogin}
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-lg shadow-slate-900/5 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                    >
                        <LogIn className="h-5 w-5" />
                    </button>
                </div>

                <AuthModal
                    open={authOpen}
                    onClose={() => setAuthOpen(false)}
                    defaultMode={authMode}
                />
            </>
        );
    }

    return (
        <>
            <div className="relative hidden lg:block">
                <button
                    onClick={() => setMenuOpen((current) => !current)}
                    className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-700 shadow-lg shadow-slate-900/5 transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                >
                    <UserAvatar
                        name={session.user.name ?? session.user.email ?? "User"}
                        image={session.user.image ?? undefined}
                    />

                    <span className="max-w-[120px] truncate">
                        {session.user.name ?? session.user.email}
                    </span>

                    <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>

                {menuOpen && (
                    <div className="absolute right-0 top-14 w-80 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-900/15 dark:border-white/10 dark:bg-slate-950 dark:shadow-black/40">
                        <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                            <div className="flex items-center gap-3">
                                <UserAvatar
                                    name={session.user.name ?? session.user.email ?? "User"}
                                    image={session.user.image ?? undefined}
                                    large
                                />

                                <div className="min-w-0">
                                    <p className="truncate font-black text-slate-950 dark:text-white">
                                        {session.user.name ?? "EquityLens User"}
                                    </p>

                                    <p className="truncate text-sm font-bold text-slate-500 dark:text-slate-400">
                                        {session.user.email}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-black text-emerald-600 dark:text-emerald-300">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                Signed in
                            </div>
                        </div>

                        <div className="mt-3 space-y-1.5">
                            <button
                                onClick={() => {
                                    onTabChange("settings");
                                    setMenuOpen(false);
                                }}
                                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-black text-slate-700 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
                            >
                                <Settings className="h-4 w-4" />
                                Settings
                            </button>

                            <button
                                onClick={() => {
                                    setMenuOpen(false);
                                    void signOut({
                                        callbackUrl: "/",
                                    });
                                }}
                                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-black text-red-600 transition hover:bg-red-400/10 dark:text-red-300"
                            >
                                <LogOut className="h-4 w-4" />
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <button
                onClick={() => setMenuOpen((current) => !current)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-lg shadow-slate-900/5 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 lg:hidden"
            >
                <UserAvatar
                    name={session.user.name ?? session.user.email ?? "User"}
                    image={session.user.image ?? undefined}
                />
            </button>

            {menuOpen && (
                <div className="fixed inset-x-4 top-20 z-[70] rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-900/15 dark:border-white/10 dark:bg-slate-950 lg:hidden">
                    <div className="mb-4 flex items-center gap-3">
                        <UserAvatar
                            name={session.user.name ?? session.user.email ?? "User"}
                            image={session.user.image ?? undefined}
                            large
                        />

                        <div className="min-w-0">
                            <p className="truncate font-black text-slate-950 dark:text-white">
                                {session.user.name ?? "EquityLens User"}
                            </p>

                            <p className="truncate text-sm font-bold text-slate-500 dark:text-slate-400">
                                {session.user.email}
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <button
                            onClick={() => {
                                onTabChange("settings");
                                setMenuOpen(false);
                            }}
                            className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-black text-slate-700 dark:bg-white/5 dark:text-slate-300"
                        >
                            <Settings className="h-4 w-4" />
                            Settings
                        </button>

                        <button
                            onClick={() => {
                                setMenuOpen(false);
                                void signOut({
                                    callbackUrl: "/",
                                });
                            }}
                            className="flex items-center gap-3 rounded-2xl bg-red-400/10 px-4 py-3 text-sm font-black text-red-600 dark:text-red-300"
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

function UserAvatar({
    name,
    image,
    large = false,
}: {
    name: string;
    image?: string;
    large?: boolean;
}) {
    const sizeClass = large ? "h-12 w-12" : "h-8 w-8";
    const initial = name.trim().charAt(0).toUpperCase() || "U";

    if (image) {
        return (
            <img
                src={image}
                alt={name}
                className={`${sizeClass} rounded-full object-cover`}
            />
        );
    }

    return (
        <div
            className={`${sizeClass} flex items-center justify-center rounded-full bg-slate-950 text-sm font-black text-white dark:bg-white dark:text-slate-950`}
        >
            {large ? <User className="h-5 w-5" /> : initial}
        </div>
    );
}