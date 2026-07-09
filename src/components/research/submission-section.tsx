import type React from "react";
import {
    Bot,
    CheckCircle2,
    ClipboardCheck,
    Code2,
    FileText,
    Code2Icon,
    Globe2,
    Rocket,
    ShieldCheck,
    Sparkles,
} from "lucide-react";

const COMPLETED_ITEMS = [
    {
        icon: <Bot className="h-5 w-5" />,
        title: "LangGraph Research Agent",
        description:
            "Company resolver, financial fetcher, news fetcher, scoring node, and memo generation node.",
    },
    {
        icon: <ShieldCheck className="h-5 w-5" />,
        title: "Explainable Scoring",
        description:
            "Rule-based score before LLM reasoning, with visible category breakdown.",
    },
    {
        icon: <FileText className="h-5 w-5" />,
        title: "Exportable Reports",
        description:
            "Single-company and comparison reports can be copied or downloaded as Markdown.",
    },
    {
        icon: <Globe2 className="h-5 w-5" />,
        title: "Professional Frontend",
        description:
            "SaaS landing page, floating navbar, theme toggle, research, compare, and history workspaces.",
    },
];

const FINAL_CHECKLIST = [
    "Run one company research demo",
    "Run comparison demo",
    "Show source metadata and warnings",
    "Export Markdown memo",
    "Add AI usage logs",
    "Deploy to Vercel",
];

export function SubmissionSection() {
    return (
        <section className="py-20">
            <div className="overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/30">
                <div className="grid lg:grid-cols-[1fr_0.82fr]">
                    <div className="p-8 md:p-10">
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-600 dark:text-emerald-300">
                            <Rocket className="h-4 w-4" />
                            Submission readiness
                        </div>

                        <h2 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 dark:text-white">
                            Built as a complete product, not just an API demo
                        </h2>

                        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
                            EquityLens AI includes a working agent backend, polished frontend,
                            traceable scoring, comparison mode, local history, provider status,
                            exportable memos, and clear documentation structure for review.
                        </p>

                        <div className="mt-8 grid gap-5 md:grid-cols-2">
                            {COMPLETED_ITEMS.map((item) => (
                                <SubmissionCard
                                    key={item.title}
                                    icon={item.icon}
                                    title={item.title}
                                    description={item.description}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="relative bg-slate-950 p-8 text-white md:p-10">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.25),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(139,92,246,0.22),_transparent_35%)]" />

                        <div className="relative">
                            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/10">
                                <ClipboardCheck className="h-8 w-8 text-emerald-300" />
                            </div>

                            <p className="mb-3 text-sm font-black uppercase tracking-[0.3em] text-emerald-300">
                                Final Checklist
                            </p>

                            <h3 className="text-3xl font-black">
                                What to show during review
                            </h3>

                            <p className="mt-4 text-sm leading-7 text-slate-300">
                                Use this checklist before creating the final ZIP or submitting
                                the deployed link.
                            </p>

                            <div className="mt-7 space-y-3">
                                {FINAL_CHECKLIST.map((item) => (
                                    <div
                                        key={item}
                                        className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                                    >
                                        <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                                        <span className="text-sm font-bold text-slate-200">
                                            {item}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-7 grid gap-3">
                                <SubmissionMeta
                                    icon={<Code2 className="h-4 w-4" />}
                                    label="Build command"
                                    value="npm run build"
                                />

                                <SubmissionMeta
                                    icon={<Code2Icon className="h-4 w-4" />}
                                    label="Repository"
                                    value="Add GitHub link in README"
                                />

                                <SubmissionMeta
                                    icon={<Sparkles className="h-4 w-4" />}
                                    label="Best demo"
                                    value="Nvidia, Tesla, Netflix"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function SubmissionCard({
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

            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                {description}
            </p>
        </div>
    );
}

function SubmissionMeta({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-cyan-300">
                    {icon}
                </div>

                <p className="text-sm font-bold text-slate-300">{label}</p>
            </div>

            <p className="text-right text-xs font-black text-slate-400">{value}</p>
        </div>
    );
}