import Link from "next/link";
import {
    ArrowLeft,
    BarChart3,
    FileSearch,
    Home,
    SearchX,
    ShieldCheck,
} from "lucide-react";

export default function NotFound() {
    return (
        <main className="min-h-screen overflow-hidden bg-slate-50 text-slate-950 dark:bg-[#020617] dark:text-white">
            <div className="pointer-events-none fixed inset-0">
                <div className="absolute left-[-10%] top-[-10%] h-[420px] w-[420px] rounded-full bg-violet-400/20 blur-3xl dark:bg-violet-400/10" />
                <div className="absolute right-[-10%] top-[20%] h-[420px] w-[420px] rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-400/10" />
                <div className="absolute bottom-[-20%] left-[30%] h-[420px] w-[420px] rounded-full bg-emerald-400/10 blur-3xl dark:bg-emerald-400/5" />
            </div>

            <section className="relative z-10 flex min-h-screen items-center justify-center px-5 py-10">
                <div className="w-full max-w-5xl overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/30">
                    <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
                        <div className="relative bg-slate-950 p-8 text-white md:p-10">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(139,92,246,0.26),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(34,211,238,0.24),_transparent_35%)]" />

                            <div className="relative">
                                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/10">
                                    <SearchX className="h-8 w-8 text-violet-300" />
                                </div>

                                <p className="mb-3 text-sm font-black uppercase tracking-[0.3em] text-violet-300">
                                    404 Not Found
                                </p>

                                <h1 className="text-4xl font-black tracking-tight md:text-5xl">
                                    This research route does not exist
                                </h1>

                                <p className="mt-5 text-sm leading-7 text-slate-300">
                                    The page you opened is not available inside EquityLens AI.
                                    Return to the research command center to run company analysis,
                                    compare stocks, or reopen saved history.
                                </p>

                                <div className="mt-8 rounded-3xl border border-white/10 bg-white/10 p-5">
                                    <div className="mb-3 flex items-center gap-2 text-emerald-300">
                                        <ShieldCheck className="h-5 w-5" />
                                        <p className="font-black">Available workspaces</p>
                                    </div>

                                    <p className="text-sm leading-6 text-slate-300">
                                        Home, Research, Compare, and History are available from the
                                        main EquityLens interface.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 md:p-10">
                            <div className="mb-8">
                                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-600 dark:text-cyan-300">
                                    <FileSearch className="h-4 w-4" />
                                    Route unavailable
                                </div>

                                <h2 className="text-3xl font-black text-slate-950 dark:text-white">
                                    Go back to the product workspace
                                </h2>

                                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                                    Use the main app to access the landing page, research agent,
                                    comparison engine, and local history.
                                </p>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <InfoCard
                                    icon={<Home className="h-5 w-5" />}
                                    title="Home"
                                    description="View product overview and demo scenarios."
                                />

                                <InfoCard
                                    icon={<FileSearch className="h-5 w-5" />}
                                    title="Research"
                                    description="Run single-company investment analysis."
                                />

                                <InfoCard
                                    icon={<BarChart3 className="h-5 w-5" />}
                                    title="Compare"
                                    description="Compare 2–3 companies side-by-side."
                                />
                            </div>

                            <div className="mt-8 flex flex-wrap gap-3">
                                <Link
                                    href="/"
                                    className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-xl shadow-slate-900/20 transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to EquityLens
                                </Link>
                            </div>

                            <div className="mt-8 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-950/60">
                                <p className="font-black text-slate-950 dark:text-white">
                                    Tip
                                </p>

                                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                                    Since this app uses tab-based navigation inside the home page,
                                    most product areas are accessed from the floating navbar
                                    instead of separate URL routes.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

function InfoCard({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-950/60">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-cyan-600 shadow-sm dark:bg-white/10 dark:text-cyan-300">
                {icon}
            </div>

            <h3 className="font-black text-slate-950 dark:text-white">{title}</h3>

            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                {description}
            </p>
        </div>
    );
}