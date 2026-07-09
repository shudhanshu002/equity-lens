import {
    ArrowUpRight,
    Brain,
    Code2,
    Database,
    FileText,
    GitBranch,
    ShieldAlert,
    Sparkles,
} from "lucide-react";

const FOOTER_STACK = [
    {
        icon: <GitBranch className="h-4 w-4" />,
        label: "Agent",
        value: "LangGraph.js",
    },
    {
        icon: <Brain className="h-4 w-4" />,
        label: "LLM",
        value: "Gemini",
    },
    {
        icon: <Database className="h-4 w-4" />,
        label: "Data",
        value: "Alpha Vantage",
    },
    {
        icon: <FileText className="h-4 w-4" />,
        label: "Output",
        value: "Markdown Memos",
    },
];

export function AppFooter() {
    return (
        <footer className="mt-16 pb-8">
            <div className="overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/30">
                <div className="grid lg:grid-cols-[1fr_0.85fr]">
                    <div className="p-8 md:p-10">
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-600 dark:text-cyan-300">
                            <Sparkles className="h-4 w-4" />
                            EquityLens AI
                        </div>

                        <h2 className="max-w-3xl text-3xl font-black tracking-tight text-slate-950 dark:text-white md:text-4xl">
                            AI investment research built with transparent scoring and
                            inspectable agent workflows.
                        </h2>

                        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">
                            EquityLens AI turns company names into structured investment
                            research reports using financial data, deterministic scoring,
                            source metadata, LLM-generated memos, comparison ranking, and
                            exportable outputs.
                        </p>

                        <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            {FOOTER_STACK.map((item) => (
                                <div
                                    key={item.label}
                                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-950/60"
                                >
                                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-cyan-600 shadow-sm dark:bg-white/10 dark:text-cyan-300">
                                        {item.icon}
                                    </div>

                                    <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                                        {item.label}
                                    </p>

                                    <p className="mt-1 text-sm font-black text-slate-950 dark:text-white">
                                        {item.value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative bg-slate-950 p-8 text-white md:p-10">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.25),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(139,92,246,0.22),_transparent_35%)]" />

                        <div className="relative">
                            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                                <ShieldAlert className="h-7 w-7 text-amber-300" />
                            </div>

                            <p className="mb-2 text-sm font-black uppercase tracking-[0.3em] text-amber-300">
                                Disclaimer
                            </p>

                            <h3 className="text-2xl font-black">
                                Research demo, not financial advice
                            </h3>

                            <p className="mt-4 text-sm leading-7 text-slate-300">
                                This project is built for educational, technical, and product
                                demonstration purposes. It does not provide financial advice.
                                Users should independently verify all results before making
                                investment decisions.
                            </p>

                            <div className="mt-6 grid gap-3">
                                <FooterLink
                                    icon={<Code2 className="h-4 w-4" />}
                                    label="Add GitHub repository link in README"
                                />

                                <FooterLink
                                    icon={<FileText className="h-4 w-4" />}
                                    label="Include example runs and AI usage logs"
                                />

                                <FooterLink
                                    icon={<ArrowUpRight className="h-4 w-4" />}
                                    label="Deploy on Vercel for bonus submission value"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-200 px-8 py-5 dark:border-white/10 md:px-10">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                            Built with Next.js, TypeScript, Tailwind CSS, LangGraph.js,
                            Gemini, Alpha Vantage, and Recharts.
                        </p>

                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                            © 2026 EquityLens AI
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function FooterLink({
    icon,
    label,
}: {
    icon: React.ReactNode;
    label: string;
}) {
    return (
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-cyan-300">
                {icon}
            </div>

            <p className="text-sm font-bold text-slate-300">{label}</p>
        </div>
    );
}