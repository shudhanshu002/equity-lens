"use client";

import type React from "react";
import { useEffect, useState } from "react";
import {
    ArrowRight,
    Command,
    LogIn,
    Menu,
    Moon,
    Settings,
    Sparkles,
    Sun,
    TrendingUp,
    UserPlus,
    X,
} from "lucide-react";
import { APP_NAV_ITEMS, AppTab } from "@/lib/frontend/app-tabs";
import { UserMenu } from "../auth/user-menu";

type NavbarAppShellProps = {
    activeTab: AppTab;
    onTabChange: (tab: AppTab) => void;
    children: React.ReactNode;
};

export function NavbarAppShell({
    activeTab,
    onTabChange,
    children,
}: NavbarAppShellProps) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(true);

    useEffect(() => {
        const savedTheme = window.localStorage.getItem("equitylens-theme");

        const shouldUseDark =
            savedTheme === "dark" ||
            (!savedTheme &&
                window.matchMedia("(prefers-color-scheme: dark)").matches);

        setDarkMode(shouldUseDark);
        document.documentElement.classList.toggle("dark", shouldUseDark);
    }, []);

    function changeTab(tab: AppTab) {
        onTabChange(tab);
        setMobileOpen(false);
    }

    function toggleTheme() {
        const nextTheme = !darkMode;

        setDarkMode(nextTheme);
        document.documentElement.classList.toggle("dark", nextTheme);
        window.localStorage.setItem(
            "equitylens-theme",
            nextTheme ? "dark" : "light"
        );
    }

    return (
        <main className="min-h-screen overflow-hidden bg-[#f7f8fb] text-slate-950 transition-colors dark:bg-[#030712] dark:text-white">
            <div className="pointer-events-none fixed inset-0 z-0">
                <div className="absolute left-[-14%] top-[-18%] h-[520px] w-[520px] rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-400/10" />
                <div className="absolute right-[-18%] top-[10%] h-[520px] w-[520px] rounded-full bg-violet-400/20 blur-3xl dark:bg-violet-400/10" />
                <div className="absolute bottom-[-25%] left-[28%] h-[520px] w-[520px] rounded-full bg-emerald-400/10 blur-3xl dark:bg-emerald-400/5" />
            </div>

            <header className="fixed left-0 right-0 top-0 z-50 px-4 pt-4 md:px-8">
                <div className="mx-auto flex max-w-7xl items-center justify-between rounded-[1.75rem] border border-slate-200 bg-white/80 px-4 py-3 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/75 dark:shadow-black/30">
                    <button
                        onClick={() => changeTab("home")}
                        className="flex items-center gap-3"
                    >
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-xl shadow-slate-900/20 dark:bg-white dark:text-slate-950">
                            <TrendingUp className="h-5 w-5" />
                        </div>

                        <div className="hidden text-left sm:block">
                            <p className="text-lg font-black tracking-tight">EquityLens AI</p>
                            <p className="-mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
                                Autonomous financial agents
                            </p>
                        </div>
                    </button>

                    <nav className="hidden items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1 dark:border-white/10 dark:bg-white/5 lg:flex">
                        {APP_NAV_ITEMS.map((item) => {
                            const active = activeTab === item.id;

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => changeTab(item.id)}
                                    className={`rounded-full px-4 py-2 text-sm font-black transition ${active
                                            ? "bg-slate-950 text-white shadow-lg shadow-slate-900/15 dark:bg-white dark:text-slate-950"
                                            : "text-slate-600 hover:bg-white hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                                        }`}
                                >
                                    {item.label}
                                </button>
                            );
                        })}
                    </nav>

                    <div className="hidden items-center gap-2 lg:flex">
                        <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-600 shadow-lg shadow-slate-900/5 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                            <Command className="h-4 w-4" />
                            Ctrl K
                        </button>

                        <button
                            onClick={() => changeTab("settings")}
                            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-lg shadow-slate-900/5 transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                        >
                            <Settings className="h-5 w-5" />
                        </button>

                        <button
                            onClick={toggleTheme}
                            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-lg shadow-slate-900/5 transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                        >
                            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </button>

                        <UserMenu onTabChange={changeTab} />
                    </div>

                    <button
                        onClick={() => setMobileOpen(true)}
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-lg shadow-slate-900/5 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 lg:hidden"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                </div>
            </header>

            {mobileOpen && (
                <div className="fixed inset-0 z-[60] bg-slate-950/50 px-4 pt-4 backdrop-blur-sm lg:hidden">
                    <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-2xl dark:border-white/10 dark:bg-slate-950">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                                    <TrendingUp className="h-5 w-5" />
                                </div>

                                <div>
                                    <p className="font-black">EquityLens AI</p>
                                    <p className="text-xs font-bold text-slate-500">
                                        Financial agents
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setMobileOpen(false)}
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="space-y-2">
                            {APP_NAV_ITEMS.map((item) => {
                                const Icon = item.icon;
                                const active = activeTab === item.id;

                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => changeTab(item.id)}
                                        className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${active
                                                ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                                                : "bg-slate-50 text-slate-700 dark:bg-white/5 dark:text-slate-300"
                                            }`}
                                    >
                                        <Icon className="h-5 w-5" />
                                        <div>
                                            <p className="font-black">{item.label}</p>
                                            <p
                                                className={`text-xs ${active
                                                        ? "text-white/70 dark:text-slate-600"
                                                        : "text-slate-500"
                                                    }`}
                                            >
                                                {item.description}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2">
                            <button
                                onClick={toggleTheme}
                                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black dark:border-white/10 dark:bg-white/5"
                            >
                                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                                Theme
                            </button>

                            <UserMenu onTabChange={changeTab} />
                        </div>
                    </div>
                </div>
            )}

            <div className="relative z-10 mx-auto max-w-7xl px-4 pb-8 pt-28 md:px-8 md:pt-32">
                {children}
            </div>
        </main>
    );
}