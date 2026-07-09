"use client";

import type React from "react";
import { useEffect, useState } from "react";
import {
  BarChart3,
  History,
  Home,
  Moon,
  Search,
  Sun,
  TrendingUp,
} from "lucide-react";

export type AppTab = "home" | "research" | "compare" | "history";

type FloatingNavbarProps = {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
};

const NAV_ITEMS: {
  id: AppTab;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "home",
    label: "Home",
    icon: <Home className="h-4 w-4" />,
  },
  {
    id: "research",
    label: "Research",
    icon: <Search className="h-4 w-4" />,
  },
  {
    id: "compare",
    label: "Compare",
    icon: <BarChart3 className="h-4 w-4" />,
  },
  {
    id: "history",
    label: "History",
    icon: <History className="h-4 w-4" />,
  },
];

export function FloatingNavbar({
  activeTab,
  onTabChange,
}: FloatingNavbarProps) {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("equitylens-theme");

    const shouldUseDark =
      savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches);

    setDarkMode(shouldUseDark);
    document.documentElement.classList.toggle("dark", shouldUseDark);
  }, []);

  function toggleTheme() {
    const nextTheme = !darkMode;

    setDarkMode(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme);
    window.localStorage.setItem("equitylens-theme", nextTheme ? "dark" : "light");
  }

  return (
    <header className="fixed left-1/2 top-5 z-50 w-[calc(100%-24px)] max-w-5xl -translate-x-1/2">
      <nav className="rounded-full border border-slate-200/70 bg-white/80 px-3 py-3 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/75 dark:shadow-black/30">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => onTabChange("home")}
            className="flex items-center gap-2 rounded-full px-3 py-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950">
              <TrendingUp className="h-4 w-4" />
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-sm font-black tracking-tight text-slate-950 dark:text-white">
                EquityLens
              </p>
              <p className="-mt-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                AI Research Agent
              </p>
            </div>
          </button>

          <div className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const active = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? "bg-slate-950 text-white shadow-lg shadow-slate-900/20 dark:bg-white dark:text-slate-950"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
                  }`}
                >
                  {item.icon}
                  <span className="hidden md:inline">{item.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </nav>
    </header>
  );
}