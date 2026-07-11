"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
    CheckCircle2,
    Eye,
    EyeOff,
    KeyRound,
    Loader2,
    Lock,
    Save,
    ShieldCheck,
} from "lucide-react";
import {
    getUserAccountDetails,
    hasPasswordProvider,
    type UserAccountDetails,
} from "@/lib/user-data/account-client";
import {
    getPasswordStrengthLabel,
    getPasswordStrengthPercentage,
    passwordsMatch,
    validatePasswordStrength,
} from "@/lib/user-data/password-client";
import { canSetPassword, setUserPassword } from "@/lib/user-data/set-password-client";

export function SetPasswordCard() {
    const { status } = useSession();

    const [account, setAccount] = useState<UserAccountDetails | null>(null);

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const loggedIn = status === "authenticated";
    const alreadyHasPassword = hasPasswordProvider(account);

    const strength = validatePasswordStrength(newPassword);
    const strengthLabel = getPasswordStrengthLabel(newPassword);
    const strengthPercentage = getPasswordStrengthPercentage(newPassword);

    const matched = passwordsMatch(newPassword, confirmPassword);

    const canSubmit =
        canSetPassword({
            newPassword,
            confirmPassword,
        }) && !saving;

    useEffect(() => {
        async function loadAccount() {
            setLoading(true);
            setError("");

            try {
                if (!loggedIn) {
                    setAccount(null);
                    return;
                }

                const accountDetails = await getUserAccountDetails();
                setAccount(accountDetails);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Failed to load account details."
                );
            } finally {
                setLoading(false);
            }
        }

        if (status !== "loading") {
            void loadAccount();
        }
    }, [loggedIn, status]);

    async function handleSetPassword() {
        if (!canSubmit) return;

        setSaving(true);
        setMessage("");
        setError("");

        try {
            const result = await setUserPassword({
                newPassword,
                confirmPassword,
            });

            setMessage(result);
            setNewPassword("");
            setConfirmPassword("");

            const updatedAccount = await getUserAccountDetails();
            setAccount(updatedAccount);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to set password.");
        } finally {
            setSaving(false);
        }
    }

    if (!loggedIn) {
        return null;
    }

    if (loading) {
        return (
            <section className="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20 md:p-8">
                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </div>

                    <div>
                        <h3 className="text-2xl font-black text-slate-950 dark:text-white">
                            Checking password status
                        </h3>

                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            Fetching account security details.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    if (alreadyHasPassword) {
        return null;
    }

    return (
        <section className="rounded-[2.5rem] border border-cyan-400/20 bg-cyan-400/10 p-6 shadow-xl shadow-cyan-500/5 md:p-8">
            <div className="mb-7 flex gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cyan-500 text-white shadow-xl shadow-cyan-500/20">
                    <KeyRound className="h-7 w-7" />
                </div>

                <div>
                    <p className="mb-2 text-sm font-black uppercase tracking-[0.25em] text-cyan-700 dark:text-cyan-300">
                        Add Password Login
                    </p>

                    <h3 className="text-3xl font-black text-slate-950 dark:text-white">
                        Set a password for this account
                    </h3>

                    <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-700 dark:text-slate-300">
                        Your account currently does not have password login enabled. Set a
                        password to use both Google login and email-password login.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
                <div className="space-y-5">
                    <PasswordInput
                        label="New Password"
                        value={newPassword}
                        onChange={(value) => {
                            setNewPassword(value);
                            setMessage("");
                            setError("");
                        }}
                        visible={showNewPassword}
                        onToggleVisible={() => setShowNewPassword((current) => !current)}
                        placeholder="Enter new password"
                    />

                    <PasswordInput
                        label="Confirm Password"
                        value={confirmPassword}
                        onChange={(value) => {
                            setConfirmPassword(value);
                            setMessage("");
                            setError("");
                        }}
                        visible={showConfirmPassword}
                        onToggleVisible={() =>
                            setShowConfirmPassword((current) => !current)
                        }
                        placeholder="Re-enter new password"
                    />

                    {message && (
                        <p className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                            {message}
                        </p>
                    )}

                    {error && (
                        <p className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-bold text-red-600 dark:text-red-300">
                            {error}
                        </p>
                    )}

                    <button
                        onClick={() => void handleSetPassword()}
                        disabled={!canSubmit}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white shadow-xl shadow-slate-900/15 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Setting Password
                            </>
                        ) : (
                            <>
                                Set Password
                                <Save className="h-4 w-4" />
                            </>
                        )}
                    </button>
                </div>

                <div className="rounded-[2rem] border border-cyan-400/20 bg-white/70 p-5 dark:bg-slate-950/40">
                    <div className="mb-5 flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-600 dark:text-cyan-300">
                            <ShieldCheck className="h-5 w-5" />
                        </div>

                        <div>
                            <p className="font-black text-slate-950 dark:text-white">
                                Password Strength
                            </p>

                            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                                {strengthLabel}
                            </p>
                        </div>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                        <div
                            className="h-full rounded-full bg-slate-950 transition-all dark:bg-cyan-300"
                            style={{ width: `${strengthPercentage}%` }}
                        />
                    </div>

                    <div className="mt-6 space-y-3">
                        <PasswordRule
                            label="At least 8 characters"
                            valid={strength.checks.minLength}
                        />

                        <PasswordRule
                            label="One uppercase letter"
                            valid={strength.checks.uppercase}
                        />

                        <PasswordRule
                            label="One lowercase letter"
                            valid={strength.checks.lowercase}
                        />

                        <PasswordRule label="One number" valid={strength.checks.number} />

                        <PasswordRule label="Passwords match" valid={matched} />
                    </div>

                    <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-xs font-bold leading-6 text-cyan-700 dark:text-cyan-300">
                        After this, you can login using your email and password from the
                        normal login screen.
                    </div>
                </div>
            </div>
        </section>
    );
}

function PasswordInput({
    label,
    value,
    onChange,
    visible,
    onToggleVisible,
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    visible: boolean;
    onToggleVisible: () => void;
    placeholder: string;
}) {
    return (
        <div>
            <label className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-300">
                {label}
            </label>

            <div className="flex h-14 items-center gap-3 rounded-2xl border border-cyan-400/20 bg-white px-4 transition focus-within:border-cyan-400 dark:bg-slate-950/60">
                <Lock className="h-5 w-5 text-slate-400" />

                <input
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    type={visible ? "text" : "password"}
                    placeholder={placeholder}
                    className="w-full bg-transparent text-sm font-bold text-slate-950 outline-none placeholder:text-slate-400 dark:text-white"
                />

                <button
                    type="button"
                    onClick={onToggleVisible}
                    className="text-slate-400 transition hover:text-slate-700 dark:hover:text-white"
                >
                    {visible ? (
                        <EyeOff className="h-5 w-5" />
                    ) : (
                        <Eye className="h-5 w-5" />
                    )}
                </button>
            </div>
        </div>
    );
}

function PasswordRule({
    label,
    valid,
}: {
    label: string;
    valid: boolean;
}) {
    return (
        <div className="flex items-center gap-3 text-sm font-bold">
            <div
                className={`flex h-7 w-7 items-center justify-center rounded-full ${valid
                        ? "bg-emerald-400/10 text-emerald-600 dark:text-emerald-300"
                        : "bg-slate-200 text-slate-400 dark:bg-white/10"
                    }`}
            >
                <CheckCircle2 className="h-4 w-4" />
            </div>

            <span
                className={
                    valid
                        ? "text-slate-950 dark:text-white"
                        : "text-slate-500 dark:text-slate-400"
                }
            >
                {label}
            </span>
        </div>
    );
}