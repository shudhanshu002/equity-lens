import {
    Brain,
    Database,
    ExternalLink,
    GitBranch,
    ShieldAlert,
    Sparkles,
    Zap,
} from "lucide-react";
import Link from "next/link";

const STACK = [
    { name: "Next.js", icon: Zap },
    { name: "TypeScript", icon: Zap },
    { name: "LangGraph.js", icon: GitBranch },
    { name: "Gemini", icon: Brain },
    { name: "PostgreSQL", icon: Database },
    { name: "Alpha Vantage", icon: Database },
];

const WORKSPACE_LINKS = [
    { label: "Home Workspace", href: "/" },
    { label: "Analyze Stocks", href: "/?tab=research" },
    { label: "Compare Markets", href: "/?tab=compare" },
];

const DATA_LINKS = [
    { label: "Portfolio Watchlist", href: "/portfolio" },
    { label: "Research History", href: "/history" },
    { label: "Watchlist Sync", href: "/watchlist" },
];

export function AppFooter() {
    const year = new Date().getFullYear();

    return (
        <footer className="mt-16 border-t border-slate-200 py-6 dark:border-white/10">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <Link href="/" className="inline-flex items-center gap-3" aria-label="EquityLens home">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                        <Brain className="h-4 w-4" />
                    </span>
                    <span>
                        <span className="block text-sm font-semibold text-slate-950 dark:text-white">EquityLens</span>
                        <span className="block text-xs text-slate-400">AI investment research workspace</span>
                    </span>
                </Link>

                <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-slate-500 dark:text-slate-400" aria-label="Footer navigation">
                    <Link href="/?tab=research" className="hover:text-slate-950 dark:hover:text-white">Research</Link>
                    <Link href="/?tab=compare" className="hover:text-slate-950 dark:hover:text-white">Compare</Link>
                    <Link href="/?tab=portfolio" className="hover:text-slate-950 dark:hover:text-white">Portfolio</Link>
                    <Link href="/?tab=exports" className="hover:text-slate-950 dark:hover:text-white">Exports</Link>
                </nav>
            </div>

            <div className="mt-5 flex flex-col gap-2 border-t border-slate-200 pt-4 text-xs text-slate-400 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
                <span>© {year} EquityLens</span>
                <span>Designed and developed by Shudhanshu Kumar Singh</span>
            </div>
        </footer>
    );

    /* Legacy footer retained below while the compact footer is active. */
    return (
        <footer className="mt-20 pb-8">
            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 text-white shadow-xl shadow-slate-950/10 dark:border-white/10 dark:shadow-black/30">
                <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.12),_transparent_32%)]"
                />

                <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,_transparent_1px),linear-gradient(90deg,_rgba(255,255,255,0.025)_1px,_transparent_1px)] bg-[size:42px_42px]"
                />

                <div className="relative px-6 py-10 md:px-10 lg:px-12">
                    <div className="grid gap-10 lg:grid-cols-[1.4fr_0.7fr_0.7fr]">
                        <div>
                            <Link
                                href="/"
                                aria-label="EquityLens AI home"
                                className="inline-flex items-center gap-3"
                            >
                                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-950 shadow-lg shadow-black/20">
                                    <Brain className="h-5 w-5" />
                                </span>

                                <span>
                                    <span className="block text-lg font-black tracking-tight">
                                        EquityLens AI
                                    </span>

                                    <span className="block text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">
                                        Investment Research Agent
                                    </span>
                                </span>
                            </Link>

                            <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300">
                                Research public companies, evaluate financial health, track
                                recent news, compare opportunities, and generate explainable
                                investment memos using an inspectable multi-agent workflow.
                            </p>

                            <div className="mt-6 inline-flex items-start gap-3 rounded-2xl border border-amber-300/15 bg-amber-300/[0.07] px-4 py-3">
                                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />

                                <p className="max-w-xl text-xs leading-6 text-amber-100/75">
                                    EquityLens is an educational research tool and does not
                                    provide financial advice, brokerage services, or guaranteed
                                    investment outcomes.
                                </p>
                            </div>
                        </div>

                        <FooterColumn title="Workspace" links={WORKSPACE_LINKS} />

                        <FooterColumn title="User Data" links={DATA_LINKS} />
                    </div>

                    <div className="mt-10 border-t border-white/10 pt-7">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    Built with
                                </div>

                                <div className="mt-3 flex flex-wrap gap-2">
                                    {STACK.map(({ name, icon: Icon }) => (
                                        <span
                                            key={name}
                                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold text-slate-300 transition-colors hover:border-white/20 hover:bg-white/[0.08]"
                                        >
                                            <Icon className="h-3.5 w-3.5 text-cyan-300" />
                                            {name}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <a
                                    href="#"
                                    aria-label="View EquityLens source code on GitHub"
                                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-xs font-black text-slate-200 transition hover:border-white/20 hover:bg-white/10"
                                >
                                    <GitBranch className="h-4 w-4" />
                                    GitHub
                                    <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
                                </a>

                                <Link
                                    href="/?tab=research"
                                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-black text-slate-950 transition hover:bg-cyan-100"
                                >
                                    Start research
                                    <ExternalLink className="h-3.5 w-3.5" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="mt-7 flex flex-col gap-3 border-t border-white/10 pt-5 text-xs font-semibold text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                        <p>© {year} EquityLens AI. All rights reserved.</p>

                        <p>
                            Designed and developed by{" "}
                            <span className="font-black text-slate-200">
                                Shudhanshu Kumar Singh
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

type FooterColumnProps = {
    title: string;
    links: Array<{
        label: string;
        href: string;
    }>;
};

function FooterColumn({ title, links }: FooterColumnProps) {
    return (
        <nav aria-label={`${title} links`}>
            <h3 className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                {title}
            </h3>

            <ul className="mt-4 space-y-3">
                {links.map((link) => (
                    <li key={link.label}>
                        <Link
                            href={link.href}
                            className="text-sm font-semibold text-slate-300 transition-colors hover:text-cyan-300"
                        >
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
