"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
    ArrowRight,
    Lock,
    ShieldCheck,
    Sparkles,
} from "lucide-react";
import { AuthModal } from "@/components/auth/auth-modal";

type AuthRequiredInlineProps = {
    title?: string;
    description?: string;
    mode?: "login" | "signup";
};

export function AuthRequiredInline({
    title = "Login required",
    description = "Login to save this action to your EquityLens account.",
    mode = "login",
}: AuthRequiredInlineProps) {
    const { status } = useSession();

    const [authOpen, setAuthOpen] = useState(false);
    const [authMode, setAuthMode] = useState<"login" | "signup">(mode);

    if (status === "authenticated") {
        return null;
    }

    return (
        <>
            <div className="rounded-[1.75rem] border border-amber-400/20 bg-amber-400/10 p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/20">
                            <Lock className="h-5 w-5" />
                        </div>

                        <div>
                            <h3 className="font-black text-slate-950 dark:text-white">
                                {title}
                            </h3>

                            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-700 dark:text-slate-300">
                                {description}
                            </p>
                        </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                        <button
                            onClick={() => {
                                setAuthMode("login");
                                setAuthOpen(true);
                            }}
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-xl shadow-slate-900/15 transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950"
                        >
                            Login
                            <ArrowRight className="h-4 w-4" />
                        </button>

                        <button
                            onClick={() => {
                                setAuthMode("signup");
                                setAuthOpen(true);
                            }}
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-lg shadow-slate-900/5 transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
                        >
                            Sign Up
                            <Sparkles className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-2xl border border-amber-400/20 bg-white/50 px-4 py-3 text-xs font-black text-amber-700 dark:bg-white/10 dark:text-amber-300">
                    <ShieldCheck className="h-4 w-4" />
                    Database-backed features are protected by NextAuth session.
                </div>
            </div>

            <AuthModal
                open={authOpen}
                onClose={() => setAuthOpen(false)}
                defaultMode={authMode}
            />
        </>
    );
}