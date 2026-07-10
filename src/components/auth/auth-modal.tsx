"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import {
    ArrowLeft,
    CheckCircle2,
    Eye,
    EyeOff,
    Loader2,
    Lock,
    Mail,
    ShieldCheck,
    Sparkles,
    User,
    X,
} from "lucide-react";

type AuthMode = "login" | "signup" | "verify" | "forgot" | "reset";

type AuthModalProps = {
    open: boolean;
    onClose: () => void;
    defaultMode?: AuthMode;
};

type ApiResponse = {
    success: boolean;
    message?: string;
    error?: string;
    email?: string;
    otpDeliveryMode?: "console" | "smtp";
};

export function AuthModal({
    open,
    onClose,
    defaultMode = "login",
}: AuthModalProps) {
    const [mode, setMode] = useState<AuthMode>(defaultMode);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [pendingEmail, setPendingEmail] = useState("");
    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    if (!open) return null;

    function resetFeedback() {
        setMessage("");
        setError("");
    }

    function getActiveEmail() {
        return pendingEmail || email;
    }

    async function handleSignup(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        resetFeedback();
        setLoading(true);

        try {
            const response = await fetch("/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                }),
            });

            const data = (await response.json()) as ApiResponse;

            if (!response.ok || !data.success) {
                throw new Error(data.error ?? "Signup failed.");
            }

            setPendingEmail(data.email ?? email);
            setMessage(
                data.otpDeliveryMode === "console"
                    ? "Account created. OTP is printed in your terminal."
                    : data.message ?? "Account created. Check your email for OTP."
            );
            setMode("verify");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Signup failed.");
        } finally {
            setLoading(false);
        }
    }

    async function handleVerifyOtp(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        resetFeedback();
        setLoading(true);

        try {
            const response = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: getActiveEmail(),
                    otp,
                }),
            });

            const data = (await response.json()) as ApiResponse;

            if (!response.ok || !data.success) {
                throw new Error(data.error ?? "OTP verification failed.");
            }

            setMessage("Email verified successfully. You can login now.");
            setOtp("");
            setMode("login");
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "OTP verification failed."
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleResendOtp() {
        resetFeedback();
        setLoading(true);

        try {
            const response = await fetch("/api/auth/resend-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: getActiveEmail(),
                }),
            });

            const data = (await response.json()) as ApiResponse;

            if (!response.ok || !data.success) {
                throw new Error(data.error ?? "Failed to resend OTP.");
            }

            setMessage(
                data.otpDeliveryMode === "console"
                    ? "New OTP is printed in your terminal."
                    : data.message ?? "New OTP sent successfully."
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to resend OTP.");
        } finally {
            setLoading(false);
        }
    }

    async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        resetFeedback();
        setLoading(true);

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                throw new Error(result.error);
            }

            setMessage("Logged in successfully.");
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed.");
        } finally {
            setLoading(false);
        }
    }

    async function handleGoogleLogin() {
        resetFeedback();
        setGoogleLoading(true);

        await signIn("google", {
            callbackUrl: "/",
        });
    }

    async function handleForgotPassword(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        resetFeedback();
        setLoading(true);

        try {
            const response = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                }),
            });

            const data = (await response.json()) as ApiResponse;

            if (!response.ok || !data.success) {
                throw new Error(data.error ?? "Failed to request password reset.");
            }

            setPendingEmail(data.email ?? email);
            setMessage(
                data.otpDeliveryMode === "console"
                    ? "Password reset OTP is printed in your terminal."
                    : data.message ?? "Password reset OTP sent."
            );
            setMode("reset");
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to request password reset."
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleResetPassword(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        resetFeedback();
        setLoading(true);

        try {
            const response = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: getActiveEmail(),
                    otp,
                    newPassword,
                }),
            });

            const data = (await response.json()) as ApiResponse;

            if (!response.ok || !data.success) {
                throw new Error(data.error ?? "Password reset failed.");
            }

            setMessage("Password reset successfully. You can login now.");
            setPassword("");
            setNewPassword("");
            setOtp("");
            setMode("login");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Password reset failed.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 px-4 py-8 backdrop-blur-xl">
            <div className="relative grid max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-white shadow-2xl shadow-slate-950/30 dark:bg-slate-950 lg:grid-cols-[0.9fr_1.1fr]">
                <button
                    onClick={onClose}
                    className="absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-lg transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/10 dark:text-slate-300"
                >
                    <X className="h-4 w-4" />
                </button>

                <div className="relative hidden overflow-hidden bg-slate-950 p-8 text-white lg:block">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.32),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(139,92,246,0.28),_transparent_35%)]" />

                    <div className="relative flex h-full flex-col justify-between">
                        <div>
                            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                                <Sparkles className="h-7 w-7 text-cyan-300" />
                            </div>

                            <p className="mb-3 text-sm font-black uppercase tracking-[0.3em] text-cyan-300">
                                EquityLens AI
                            </p>

                            <h2 className="text-4xl font-black tracking-tight">
                                Your AI investment research workspace.
                            </h2>

                            <p className="mt-5 text-sm leading-7 text-slate-300">
                                Login to save research history, portfolio watchlists, exports,
                                settings, and personal investment memos.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <AuthFeature text="Save personal research history" />
                            <AuthFeature text="Store watchlist and portfolio ideas" />
                            <AuthFeature text="Export Markdown, JSON, CSV and PDF reports" />
                            <AuthFeature text="Use Google or email/password login" />
                        </div>
                    </div>
                </div>

                <div className="max-h-[92vh] overflow-y-auto p-6 md:p-10">
                    <div className="mb-8 pr-12">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-600 dark:text-cyan-300">
                            <ShieldCheck className="h-4 w-4" />
                            Secure access
                        </div>

                        <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white md:text-4xl">
                            {getTitle(mode)}
                        </h1>

                        <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
                            {getDescription(mode)}
                        </p>
                    </div>

                    {message && (
                        <div className="mb-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="mb-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-bold text-red-600 dark:text-red-300">
                            {error}
                        </div>
                    )}

                    {mode === "login" && (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <InputField
                                icon={<Mail className="h-4 w-4" />}
                                label="Email"
                                type="email"
                                value={email}
                                onChange={setEmail}
                                placeholder="you@example.com"
                            />

                            <PasswordField
                                value={password}
                                onChange={setPassword}
                                showPassword={showPassword}
                                onToggleShow={() => setShowPassword((current) => !current)}
                                placeholder="Enter your password"
                            />

                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white shadow-xl shadow-slate-900/15 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Logging in
                                    </>
                                ) : (
                                    "Login"
                                )}
                            </button>

                            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                                <button
                                    type="button"
                                    onClick={() => {
                                        resetFeedback();
                                        setMode("forgot");
                                    }}
                                    className="font-bold text-cyan-600 dark:text-cyan-300"
                                >
                                    Forgot password?
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        resetFeedback();
                                        setMode("signup");
                                    }}
                                    className="font-bold text-slate-600 dark:text-slate-300"
                                >
                                    Create account
                                </button>
                            </div>
                        </form>
                    )}

                    {mode === "signup" && (
                        <form onSubmit={handleSignup} className="space-y-4">
                            <InputField
                                icon={<User className="h-4 w-4" />}
                                label="Name"
                                type="text"
                                value={name}
                                onChange={setName}
                                placeholder="Your name"
                            />

                            <InputField
                                icon={<Mail className="h-4 w-4" />}
                                label="Email"
                                type="email"
                                value={email}
                                onChange={setEmail}
                                placeholder="you@example.com"
                            />

                            <PasswordField
                                value={password}
                                onChange={setPassword}
                                showPassword={showPassword}
                                onToggleShow={() => setShowPassword((current) => !current)}
                                placeholder="Min 8 chars, uppercase, lowercase, number"
                            />

                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white shadow-xl shadow-slate-900/15 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Creating account
                                    </>
                                ) : (
                                    "Create Account"
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    resetFeedback();
                                    setMode("login");
                                }}
                                className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to login
                            </button>
                        </form>
                    )}

                    {mode === "verify" && (
                        <form onSubmit={handleVerifyOtp} className="space-y-4">
                            <InputField
                                icon={<Mail className="h-4 w-4" />}
                                label="Email"
                                type="email"
                                value={getActiveEmail()}
                                onChange={(value) => {
                                    setPendingEmail(value);
                                    setEmail(value);
                                }}
                                placeholder="you@example.com"
                            />

                            <InputField
                                icon={<Lock className="h-4 w-4" />}
                                label="OTP"
                                type="text"
                                value={otp}
                                onChange={setOtp}
                                placeholder="Enter 6 digit OTP"
                            />

                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white shadow-xl shadow-slate-900/15 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Verifying
                                    </>
                                ) : (
                                    "Verify Email"
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={loading}
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-black text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                            >
                                Resend OTP
                            </button>
                        </form>
                    )}

                    {mode === "forgot" && (
                        <form onSubmit={handleForgotPassword} className="space-y-4">
                            <InputField
                                icon={<Mail className="h-4 w-4" />}
                                label="Email"
                                type="email"
                                value={email}
                                onChange={setEmail}
                                placeholder="you@example.com"
                            />

                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white shadow-xl shadow-slate-900/15 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Sending OTP
                                    </>
                                ) : (
                                    "Send Reset OTP"
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    resetFeedback();
                                    setMode("login");
                                }}
                                className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to login
                            </button>
                        </form>
                    )}

                    {mode === "reset" && (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <InputField
                                icon={<Mail className="h-4 w-4" />}
                                label="Email"
                                type="email"
                                value={getActiveEmail()}
                                onChange={(value) => {
                                    setPendingEmail(value);
                                    setEmail(value);
                                }}
                                placeholder="you@example.com"
                            />

                            <InputField
                                icon={<Lock className="h-4 w-4" />}
                                label="OTP"
                                type="text"
                                value={otp}
                                onChange={setOtp}
                                placeholder="Enter reset OTP"
                            />

                            <PasswordField
                                label="New Password"
                                value={newPassword}
                                onChange={setNewPassword}
                                showPassword={showPassword}
                                onToggleShow={() => setShowPassword((current) => !current)}
                                placeholder="Enter new password"
                            />

                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white shadow-xl shadow-slate-900/15 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Resetting
                                    </>
                                ) : (
                                    "Reset Password"
                                )}
                            </button>
                        </form>
                    )}

                    <div className="my-6 flex items-center gap-3">
                        <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                            or
                        </span>
                        <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        disabled={googleLoading}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-black text-slate-700 shadow-lg shadow-slate-900/5 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                    >
                        {googleLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Redirecting
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                                </svg>
                                Continue with Google
                            </>
                        )}
                    </button>

                    <p className="mt-6 text-center text-xs leading-6 text-slate-500 dark:text-slate-400">
                        By continuing, you agree to use EquityLens AI for educational and
                        research purposes only. This is not financial advice.
                    </p>
                </div>
            </div>
        </div>
    );
}

function AuthFeature({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-4">
            <CheckCircle2 className="h-5 w-5 text-emerald-300" />
            <p className="text-sm font-bold text-slate-200">{text}</p>
        </div>
    );
}

function InputField({
    icon,
    label,
    type,
    value,
    onChange,
    placeholder,
}: {
    icon: React.ReactNode;
    label: string;
    type: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-300">
                {label}
            </span>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-cyan-400 dark:border-white/10 dark:bg-slate-900">
                <span className="text-slate-400">{icon}</span>

                <input
                    type={type}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder={placeholder}
                    className="min-h-8 flex-1 bg-transparent text-sm font-bold text-slate-950 outline-none placeholder:text-slate-400 dark:text-white"
                />
            </div>
        </label>
    );
}

function PasswordField({
    label = "Password",
    value,
    onChange,
    showPassword,
    onToggleShow,
    placeholder,
}: {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    showPassword: boolean;
    onToggleShow: () => void;
    placeholder: string;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-300">
                {label}
            </span>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-cyan-400 dark:border-white/10 dark:bg-slate-900">
                <Lock className="h-4 w-4 text-slate-400" />

                <input
                    type={showPassword ? "text" : "password"}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder={placeholder}
                    className="min-h-8 flex-1 bg-transparent text-sm font-bold text-slate-950 outline-none placeholder:text-slate-400 dark:text-white"
                />

                <button
                    type="button"
                    onClick={onToggleShow}
                    className="text-slate-400 transition hover:text-slate-700 dark:hover:text-slate-200"
                >
                    {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                    ) : (
                        <Eye className="h-4 w-4" />
                    )}
                </button>
            </div>
        </label>
    );
}

function getTitle(mode: AuthMode) {
    if (mode === "signup") return "Create your account";
    if (mode === "verify") return "Verify your email";
    if (mode === "forgot") return "Reset your password";
    if (mode === "reset") return "Create a new password";
    return "Welcome back";
}

function getDescription(mode: AuthMode) {
    if (mode === "signup") {
        return "Create an account to save research history, portfolio ideas, and exports.";
    }

    if (mode === "verify") {
        return "Enter the 6-digit OTP sent to your email. During local testing, it appears in the terminal if SMTP is not configured.";
    }

    if (mode === "forgot") {
        return "Enter your email and we will send a password reset OTP.";
    }

    if (mode === "reset") {
        return "Use your OTP to create a new password.";
    }

    return "Login to continue your investment research workflow.";
}