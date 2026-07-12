"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import {
    BrainCircuit,
    Check,
    Command,
    Moon,
    Search,
    Sun,
    X,
} from "lucide-react";
import { UserMenu } from "@/components/auth/user-menu";
import { APP_NAV_ITEMS, type AppTab } from "@/lib/frontend/app-tabs";

const NAVBAR_TABS: AppTab[] = [
    "home",
    "research",
    "compare",
    "history",
    "portfolio",
    "exports",
];

export function NavbarAppShell({
    activeTab,
    onTabChange,
    children,
}: {
    activeTab: AppTab;
    onTabChange: (tab: AppTab) => void;
    children: React.ReactNode;
}) {
    const [darkMode, setDarkMode] = useState(true);
    const [commandOpen, setCommandOpen] = useState(false);

    const navItems = useMemo(
        () => APP_NAV_ITEMS.filter((item) => NAVBAR_TABS.includes(item.id)),
        []
    );

    useEffect(() => {
        const savedTheme =
            typeof window !== "undefined" ? localStorage.getItem("theme") : null;

        const shouldUseDark = savedTheme ? savedTheme === "dark" : true;

        setDarkMode(shouldUseDark);
        document.documentElement.classList.toggle("dark", shouldUseDark);
    }, []);

    useEffect(() => {
        function handleShortcut(event: KeyboardEvent) {
            const isCommandShortcut =
                (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";

            if (!isCommandShortcut) return;

            event.preventDefault();
            setCommandOpen((current) => !current);
        }

        window.addEventListener("keydown", handleShortcut);

        return () => {
            window.removeEventListener("keydown", handleShortcut);
        };
    }, []);

    function toggleTheme() {
        const nextDarkMode = !darkMode;

        setDarkMode(nextDarkMode);
        document.documentElement.classList.toggle("dark", nextDarkMode);
        localStorage.setItem("theme", nextDarkMode ? "dark" : "light");
    }

    function changeTab(tab: AppTab) {
        onTabChange(tab);
        setCommandOpen(false);
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
            <header className="fixed left-0 right-0 top-0 z-50 px-3 pt-3 sm:px-5">
                <nav className="mx-auto flex h-16 max-w-7xl items-center gap-2 rounded-[1.5rem] border border-slate-200/80 bg-white/90 px-3 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/85 dark:shadow-black/30">
                    <button
                        onClick={() => changeTab("home")}
                        aria-label="EquityLens Home"
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950"
                    >
                        <BrainCircuit className="h-6 w-6" />
                    </button>

                    <div className="mx-1 h-8 w-px shrink-0 bg-slate-200 dark:bg-white/10" />

                    <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto scrollbar-none">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const selected = activeTab === item.id;

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => changeTab(item.id)}
                                    className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-2xl px-3 text-sm font-black transition md:px-4 ${selected
                                            ? "bg-slate-950 text-white shadow-lg shadow-slate-900/15 dark:bg-white dark:text-slate-950"
                                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="ml-auto flex shrink-0 items-center gap-2">
                        <button
                            onClick={toggleTheme}
                            aria-label="Toggle theme"
                            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-lg hover:shadow-slate-900/10 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
                        >
                            {darkMode ? (
                                <Sun className="h-5 w-5" />
                            ) : (
                                <Moon className="h-5 w-5" />
                            )}
                        </button>

                        <UserMenu onTabChange={changeTab} />
                    </div>
                </nav>
            </header>

            <main className="pt-20">{children}</main>

            <button
                onClick={() => setCommandOpen(true)}
                className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800 shadow-2xl shadow-slate-900/20 transition hover:-translate-y-1 dark:border-white/10 dark:bg-slate-900 dark:text-white dark:shadow-black/40"
            >
                <Command className="h-4 w-4" />
                <span>Ctrl K</span>
            </button>

            {commandOpen && (
                <FloatingCommandPanel
                    activeTab={activeTab}
                    onClose={() => setCommandOpen(false)}
                    onTabChange={changeTab}
                />
            )}
        </div>
    );
}

function FloatingCommandPanel({
    activeTab,
    onClose,
    onTabChange,
}: {
    activeTab: AppTab;
    onClose: () => void;
    onTabChange: (tab: AppTab) => void;
}) {
    const items = APP_NAV_ITEMS.filter((item) => NAVBAR_TABS.includes(item.id));

    return (
        <div className="fixed inset-0 z-[60] bg-slate-950/40 p-4 backdrop-blur-sm dark:bg-black/60">
            <div className="absolute bottom-20 right-5 w-[calc(100vw-2.5rem)] max-w-md overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-900/25 dark:border-white/10 dark:bg-slate-950 dark:shadow-black/50">
                <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                            <Search className="h-5 w-5" />
                        </div>

                        <div>
                            <p className="text-sm font-black text-slate-950 dark:text-white">
                                Quick Switch
                            </p>

                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                Jump to any workspace page
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/15"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="p-2">
                    {items.map((item) => {
                        const Icon = item.icon;
                        const selected = activeTab === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => onTabChange(item.id)}
                                className="flex w-full items-center justify-between gap-4 rounded-2xl px-4 py-3 text-left transition hover:bg-slate-100 dark:hover:bg-white/10"
                            >
                                <span className="flex items-center gap-3">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200">
                                        <Icon className="h-5 w-5" />
                                    </span>

                                    <span>
                                        <span className="block text-sm font-black text-slate-950 dark:text-white">
                                            {item.label}
                                        </span>

                                        <span className="block text-xs font-bold text-slate-500 dark:text-slate-400">
                                            {item.description}
                                        </span>
                                    </span>
                                </span>

                                {selected && (
                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-600 dark:text-emerald-300">
                                        <Check className="h-4 w-4" />
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}