"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import {
    BarChart3,
    Home,
    Keyboard,
    Moon,
    Search,
    Sparkles,
    Sun,
    X,
} from "lucide-react";
import { AppTab } from "@/components/research/floating-navbar";

type CommandPaletteProps = {
    onTabChange: (tab: AppTab) => void;
    onPickResearch: (company: string) => void;
    onPickCompare: (companies: string) => void;
};

type CommandItem = {
    id: string;
    title: string;
    description: string;
    keywords: string;
    icon: React.ReactNode;
    action: () => void;
};

export function CommandPalette({
    onTabChange,
    onPickResearch,
    onPickCompare,
}: CommandPaletteProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");

    function closePalette() {
        setOpen(false);
        setQuery("");
    }

    function toggleTheme() {
        const isDark = document.documentElement.classList.contains("dark");
        const nextTheme = !isDark;

        document.documentElement.classList.toggle("dark", nextTheme);
        window.localStorage.setItem("equitylens-theme", nextTheme ? "dark" : "light");
    }

    const commands = useMemo<CommandItem[]>(
        () => [
            {
                id: "home",
                title: "Go to Home",
                description: "Open the SaaS landing page.",
                keywords: "home landing overview product",
                icon: <Home className="h-4 w-4" />,
                action: () => {
                    onTabChange("home");
                    closePalette();
                },
            },
            {
                id: "research",
                title: "Open Research Workspace",
                description: "Run single-company investment research.",
                keywords: "research company memo stock analysis",
                icon: <Search className="h-4 w-4" />,
                action: () => {
                    onTabChange("research");
                    closePalette();
                },
            },
            {
                id: "compare",
                title: "Open Compare Workspace",
                description: "Compare 2–3 companies side-by-side.",
                keywords: "compare comparison ranking winner",
                icon: <BarChart3 className="h-4 w-4" />,
                action: () => {
                    onTabChange("compare");
                    closePalette();
                },
            },
            {
                id: "history",
                title: "Open History",
                description: "Reopen locally saved research outputs.",
                keywords: "history saved local reports archive",
                icon: <Keyboard className="h-4 w-4" />,
                action: () => {
                    onTabChange("history");
                    closePalette();
                },
            },
            {
                id: "demo-nvidia",
                title: "Prefill Nvidia Research",
                description: "Best single-company demo for a strong INVEST case.",
                keywords: "nvidia nvda demo invest research",
                icon: <Sparkles className="h-4 w-4" />,
                action: () => {
                    onPickResearch("Nvidia");
                    onTabChange("research");
                    closePalette();
                },
            },
            {
                id: "demo-apple",
                title: "Prefill Apple Research",
                description: "Good WATCHLIST-style single-company demo.",
                keywords: "apple aapl demo watchlist research",
                icon: <Sparkles className="h-4 w-4" />,
                action: () => {
                    onPickResearch("Apple");
                    onTabChange("research");
                    closePalette();
                },
            },
            {
                id: "demo-compare",
                title: "Prefill Nvidia, Tesla, Netflix",
                description: "Best comparison demo showing different decisions.",
                keywords: "nvidia tesla netflix compare demo winner",
                icon: <BarChart3 className="h-4 w-4" />,
                action: () => {
                    onPickCompare("Nvidia, Tesla, Netflix");
                    onTabChange("compare");
                    closePalette();
                },
            },
            {
                id: "theme",
                title: "Toggle Theme",
                description: "Switch between light and dark mode.",
                keywords: "theme dark light mode",
                icon: (
                    <span className="flex items-center gap-1">
                        <Sun className="h-4 w-4" />
                        <Moon className="h-4 w-4" />
                    </span>
                ),
                action: () => {
                    toggleTheme();
                    closePalette();
                },
            },
        ],
        [onPickCompare, onPickResearch, onTabChange]
    );

    const filteredCommands = commands.filter((command) => {
        const searchText = `${command.title} ${command.description} ${command.keywords}`;
        return searchText.toLowerCase().includes(query.toLowerCase());
    });

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            const isCommandShortcut =
                (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";

            if (isCommandShortcut) {
                event.preventDefault();
                setOpen((current) => !current);
            }

            if (event.key === "Escape") {
                closePalette();
            }
        }

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="fixed bottom-5 right-5 z-50 hidden items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-3 text-sm font-black text-slate-700 shadow-2xl shadow-slate-900/15 backdrop-blur-xl transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-slate-950/90 dark:text-slate-200 md:inline-flex"
            >
                <Keyboard className="h-4 w-4" />
                Ctrl K
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-slate-950/40 px-4 pt-24 backdrop-blur-sm">
            <div className="w-full max-w-2xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-900/30 dark:border-white/10 dark:bg-slate-950">
                <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4 dark:border-white/10">
                    <Search className="h-5 w-5 text-slate-400" />

                    <input
                        autoFocus
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search commands, demos, pages..."
                        className="min-h-10 flex-1 bg-transparent text-base font-semibold text-slate-950 outline-none placeholder:text-slate-400 dark:text-white"
                    />

                    <button
                        onClick={closePalette}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-3">
                    {filteredCommands.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-white/10">
                                <Search className="h-6 w-6" />
                            </div>

                            <p className="font-black text-slate-950 dark:text-white">
                                No command found
                            </p>

                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                Try searching for research, compare, history, Nvidia, or theme.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredCommands.map((command) => (
                                <button
                                    key={command.id}
                                    onClick={command.action}
                                    className="group flex w-full items-center gap-4 rounded-[1.25rem] px-4 py-4 text-left transition hover:bg-slate-100 dark:hover:bg-white/10"
                                >
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-cyan-600 transition group-hover:bg-cyan-400/10 dark:bg-white/10 dark:text-cyan-300">
                                        {command.icon}
                                    </div>

                                    <div className="flex-1">
                                        <p className="font-black text-slate-950 dark:text-white">
                                            {command.title}
                                        </p>

                                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                            {command.description}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-4 text-xs font-bold text-slate-500 dark:border-white/10 dark:text-slate-400">
                    <span>Press Enter by clicking a command</span>
                    <span>Esc to close · Ctrl K to toggle</span>
                </div>
            </div>
        </div>
    );
}