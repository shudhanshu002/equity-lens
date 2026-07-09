import {
    Command,
    Keyboard,
    MousePointerClick,
    Navigation,
    Sparkles,
} from "lucide-react";

const SHORTCUTS = [
    {
        keys: ["Ctrl", "K"],
        title: "Open Command Palette",
        description: "Quickly jump to Home, Research, Compare, History, or demo examples.",
    },
    {
        keys: ["Esc"],
        title: "Close Command Palette",
        description: "Close the command menu when it is open.",
    },
    {
        keys: ["Click"],
        title: "Navigate Workspaces",
        description: "Use the floating navbar to switch between product areas.",
    },
];

export function KeyboardShortcutsCard() {
    return (
        <section className="py-20">
            <div className="overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/30">
                <div className="grid lg:grid-cols-[0.82fr_1.18fr]">
                    <div className="relative bg-slate-950 p-8 text-white md:p-10">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.25),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(139,92,246,0.22),_transparent_35%)]" />

                        <div className="relative">
                            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/10">
                                <Keyboard className="h-8 w-8 text-cyan-300" />
                            </div>

                            <p className="mb-3 text-sm font-black uppercase tracking-[0.3em] text-cyan-300">
                                Power User UX
                            </p>

                            <h2 className="text-4xl font-black tracking-tight">
                                Navigate like a professional SaaS product
                            </h2>

                            <p className="mt-5 text-sm leading-7 text-slate-300">
                                EquityLens includes a command palette so reviewers can quickly
                                open pages, prefill demo examples, and toggle the theme.
                            </p>

                            <div className="mt-8 rounded-3xl border border-white/10 bg-white/10 p-5">
                                <div className="mb-3 flex items-center gap-2 text-emerald-300">
                                    <Sparkles className="h-5 w-5" />
                                    <p className="font-black">Reviewer friendly</p>
                                </div>

                                <p className="text-sm leading-6 text-slate-300">
                                    Press Ctrl + K and search for Nvidia, Compare, History, Theme,
                                    or Research.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 md:p-10">
                        <div className="mb-8">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-sm font-bold text-violet-600 dark:text-violet-300">
                                <Command className="h-4 w-4" />
                                Shortcuts
                            </div>

                            <h3 className="text-3xl font-black text-slate-950 dark:text-white">
                                Faster product navigation
                            </h3>

                            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                                These shortcuts improve the product feel without adding
                                unnecessary complexity.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {SHORTCUTS.map((shortcut) => (
                                <div
                                    key={shortcut.title}
                                    className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-950/60"
                                >
                                    <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-cyan-600 shadow-sm dark:bg-white/10 dark:text-cyan-300">
                                                {shortcut.title.includes("Navigate") ? (
                                                    <Navigation className="h-5 w-5" />
                                                ) : shortcut.title.includes("Click") ? (
                                                    <MousePointerClick className="h-5 w-5" />
                                                ) : (
                                                    <Keyboard className="h-5 w-5" />
                                                )}
                                            </div>

                                            <div>
                                                <h4 className="font-black text-slate-950 dark:text-white">
                                                    {shortcut.title}
                                                </h4>

                                                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                                                    {shortcut.description}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {shortcut.keys.map((key) => (
                                                <kbd
                                                    key={key}
                                                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-mono text-xs font-black text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
                                                >
                                                    {key}
                                                </kbd>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 rounded-[1.5rem] border border-cyan-400/20 bg-cyan-400/10 p-5">
                            <p className="font-black text-cyan-600 dark:text-cyan-300">
                                Suggested demo
                            </p>

                            <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
                                During review, press Ctrl + K, select “Prefill Nvidia, Tesla,
                                Netflix”, then run the comparison.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}