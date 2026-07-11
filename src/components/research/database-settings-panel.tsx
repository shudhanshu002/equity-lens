"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
    Brain,
    CheckCircle2,
    ChevronDown,
    Database,
    Loader2,
    Lock,
    Moon,
    RefreshCcw,
    Save,
    Settings,
    ShieldCheck,
    Sparkles,
    Sun,
    WandSparkles,
} from "lucide-react";
import {
    applyThemePreference,
    DEFAULT_USER_SETTINGS,
    getLocalThemePreference,
    getUserSettings,
    mergeWithDefaultSettings,
    updateUserSettings,
    type UserFinancialProvider,
    type UserLlmProvider,
    type UserRiskProfile,
    type UserSettings,
    type UserThemeMode,
} from "@/lib/user-data/settings-client";
import { saveLocalSettingsForSync } from "@/lib/user-data/settings-sync-client";
import { SettingsSyncBanner } from "@/components/research/settings-sync-banner";
import { ProfileSettingsCard } from "@/components/auth/profile-settings-card";
import { ChangePasswordCard } from "@/components/auth/change-password-card";
import { AccountDangerZone } from "@/components/auth/account-danger-zone";
import { SetPasswordCard } from "../auth/set-password-card";
import { AuthStatusCard } from "../auth/auth-status-card";
import { CurrentUserCard } from "../auth/current-user-card";

type SettingsState = Omit<
    UserSettings,
    "id" | "userId" | "createdAt" | "updatedAt"
>;

export function DatabaseSettingsPanel() {
    const { status } = useSession();

    const [settings, setSettings] = useState<SettingsState>({
        ...DEFAULT_USER_SETTINGS,
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const loggedIn = status === "authenticated";

    useEffect(() => {
        async function loadSettings() {
            setLoading(true);
            setError("");

            try {
                if (loggedIn) {
                    const dbSettings = await getUserSettings();
                    const merged = mergeWithDefaultSettings(dbSettings);
                    setSettings(merged);
                    applyThemePreference(merged.theme);
                    return;
                }

                const localTheme = getLocalThemePreference();

                setSettings({
                    ...DEFAULT_USER_SETTINGS,
                    theme: localTheme,
                });

                applyThemePreference(localTheme);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Failed to load settings."
                );
            } finally {
                setLoading(false);
            }
        }

        if (status !== "loading") {
            void loadSettings();
        }
    }, [loggedIn, status]);

    function updateSetting<Key extends keyof SettingsState>(
        key: Key,
        value: SettingsState[Key]
    ) {
        setSettings((current) => ({
            ...current,
            [key]: value,
        }));

        setMessage("");
        setError("");

        if (key === "theme") {
            applyThemePreference(value as UserThemeMode);
        }
    }

    async function saveSettings() {
        setSaving(true);
        setMessage("");
        setError("");

        try {
            applyThemePreference(settings.theme);

            if (!loggedIn) {
                saveLocalSettingsForSync(settings);
                setMessage("Settings saved locally. Login to sync them to your account.");
                return;
            }

            await updateUserSettings(settings);
            setMessage("Settings saved to your account.");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save settings.");
        } finally {
            setSaving(false);
        }
    }

    function resetSettings() {
        const localTheme = getLocalThemePreference();

        const resetValue: SettingsState = {
            ...DEFAULT_USER_SETTINGS,
            theme: localTheme,
        };

        setSettings(resetValue);
        applyThemePreference(resetValue.theme);
        setMessage("Settings reset locally. Click Save to persist.");
        setError("");
    }

    function applySyncedSettings(syncedSettings: UserSettings) {
        const merged = mergeWithDefaultSettings(syncedSettings);

        setSettings(merged);
        applyThemePreference(merged.theme);
        setMessage("Synced settings applied successfully.");
        setError("");
    }

    if (loading) {
        return (
            <section className="rounded-[2.5rem] border border-slate-200 bg-white p-10 text-center shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                    <Loader2 className="h-7 w-7 animate-spin" />
                </div>

                <h2 className="text-3xl font-black text-slate-950 dark:text-white">
                    Loading settings
                </h2>

                <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                    EquityLens is preparing your provider and theme preferences.
                </p>
            </section>
        );
    }

    return (
        <div className="space-y-8">
            <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/30 md:p-8">
                    <div className="absolute right-[-14%] top-[-30%] h-80 w-80 rounded-full bg-violet-400/20 blur-3xl dark:bg-violet-400/10" />
                    <div className="absolute bottom-[-34%] left-[12%] h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-400/10" />

                    <div className="relative">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-sm font-bold text-violet-600 dark:text-violet-300">
                            <Settings className="h-4 w-4" />
                            Account Settings
                        </div>

                        <h2 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 dark:text-white md:text-5xl">
                            Configure EquityLens like a real SaaS platform.
                        </h2>

                        <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300">
                            Save theme, model, provider, risk profile, fallback behavior, and
                            agent visualization preferences. Logged-in users sync settings to
                            PostgreSQL.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <button
                                onClick={saveSettings}
                                disabled={saving}
                                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white shadow-xl shadow-slate-900/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Saving
                                    </>
                                ) : (
                                    <>
                                        Save Settings
                                        <Save className="h-4 w-4" />
                                    </>
                                )}
                            </button>

                            <button
                                onClick={resetSettings}
                                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-black text-slate-700 shadow-lg shadow-slate-900/5 transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
                            >
                                Reset
                                <RefreshCcw className="h-4 w-4" />
                            </button>
                        </div>

                        {message && (
                            <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                                {message}
                            </div>
                        )}

                        {error && (
                            <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-bold text-red-600 dark:text-red-300">
                                {error}
                            </div>
                        )}
                    </div>
                </div>

                <div className="rounded-[2.5rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-2xl shadow-slate-900/20 dark:border-white/10 md:p-8">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                        {loggedIn ? (
                            <ShieldCheck className="h-7 w-7 text-emerald-300" />
                        ) : (
                            <Lock className="h-7 w-7 text-amber-300" />
                        )}
                    </div>

                    <p className="mb-2 text-sm font-black uppercase tracking-[0.3em] text-cyan-300">
                        Storage Mode
                    </p>

                    <h3 className="text-3xl font-black">
                        {loggedIn ? "Database Synced" : "Local Demo Mode"}
                    </h3>

                    <p className="mt-4 text-sm leading-7 text-slate-300">
                        {loggedIn
                            ? "Your settings are saved to PostgreSQL and linked to your user account."
                            : "Login to save settings permanently to your account. Until then, theme preferences are stored locally."}
                    </p>

                    <div className="mt-6 rounded-3xl border border-white/10 bg-white/10 p-5">
                        <div className="mb-3 flex items-center gap-2 text-emerald-300">
                            <Database className="h-5 w-5" />
                            <p className="font-black">Current stack</p>
                        </div>

                        <p className="text-sm leading-6 text-slate-300">
                            Gemini + Alpha Vantage + PostgreSQL + Prisma + NextAuth.
                        </p>
                    </div>
                </div>
            </section>

            <ProfileSettingsCard />

            <CurrentUserCard />

            <AuthStatusCard />

            <SetPasswordCard />

            <ChangePasswordCard />

            <SettingsSyncBanner onSynced={applySyncedSettings} />

            <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                <SettingsCard
                    icon={<Brain className="h-5 w-5" />}
                    eyebrow="LLM provider"
                    title="AI reasoning engine"
                    description="Select the preferred reasoning provider for investment memo generation."
                >
                    <div className="grid gap-4 md:grid-cols-3">
                        {(["Gemini", "OpenAI", "Claude"] as UserLlmProvider[]).map(
                            (provider) => (
                                <SelectableButton
                                    key={provider}
                                    selected={settings.llmProvider === provider}
                                    title={provider}
                                    description={
                                        provider === "Gemini"
                                            ? "Current backend"
                                            : "Future-ready option"
                                    }
                                    onClick={() => {
                                        updateSetting("llmProvider", provider);

                                        if (provider === "Gemini") {
                                            updateSetting("llmModel", "gemini-2.5-flash");
                                        }

                                        if (provider === "OpenAI") {
                                            updateSetting("llmModel", "gpt-4.1-mini");
                                        }

                                        if (provider === "Claude") {
                                            updateSetting("llmModel", "claude-3.5-sonnet");
                                        }
                                    }}
                                />
                            )
                        )}
                    </div>

                    <div className="mt-5">
                        <Label>Model</Label>

                        <div className="relative">
                            <select
                                value={settings.llmModel}
                                onChange={(event) =>
                                    updateSetting("llmModel", event.target.value)
                                }
                                className="h-14 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm font-black text-slate-950 outline-none transition focus:border-cyan-400 dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
                            >
                                <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                                <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                                <option value="gpt-4.1-mini">gpt-4.1-mini</option>
                                <option value="claude-3.5-sonnet">claude-3.5-sonnet</option>
                            </select>

                            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        </div>
                    </div>
                </SettingsCard>

                <SettingsCard
                    icon={<Database className="h-5 w-5" />}
                    eyebrow="Market data"
                    title="Financial data provider"
                    description="Choose the preferred market data source for fundamentals and financial metrics."
                >
                    <div className="grid gap-4 md:grid-cols-3">
                        {(
                            ["Alpha Vantage", "Finnhub", "Yahoo Finance"] as UserFinancialProvider[]
                        ).map((provider) => (
                            <SelectableButton
                                key={provider}
                                selected={settings.financialProvider === provider}
                                title={provider}
                                description={
                                    provider === "Alpha Vantage"
                                        ? "Current backend"
                                        : "Future-ready option"
                                }
                                onClick={() => updateSetting("financialProvider", provider)}
                            />
                        ))}
                    </div>

                    <div className="mt-5 rounded-[1.5rem] border border-amber-400/20 bg-amber-400/10 p-5">
                        <p className="font-black text-amber-700 dark:text-amber-300">
                            Implementation note
                        </p>

                        <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
                            Current backend uses Alpha Vantage for fundamentals and optional
                            Finnhub for news. Other providers are shown as scalable product
                            settings.
                        </p>
                    </div>
                </SettingsCard>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
                <SettingsCard
                    icon={<Sun className="h-5 w-5" />}
                    eyebrow="Appearance"
                    title="Theme"
                    description="Switch between professional light and dark mode."
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <SelectableButton
                            selected={settings.theme === "dark"}
                            title="Dark"
                            description="Premium command-center style."
                            icon={<Moon className="h-5 w-5" />}
                            onClick={() => updateSetting("theme", "dark")}
                        />

                        <SelectableButton
                            selected={settings.theme === "light"}
                            title="Light"
                            description="Clean SaaS dashboard style."
                            icon={<Sun className="h-5 w-5" />}
                            onClick={() => updateSetting("theme", "light")}
                        />
                    </div>
                </SettingsCard>

                <SettingsCard
                    icon={<WandSparkles className="h-5 w-5" />}
                    eyebrow="Research behavior"
                    title="Agent preferences"
                    description="Control how the frontend presents the AI research experience."
                >
                    <div className="space-y-4">
                        <ToggleRow
                            title="Mock fallback safety"
                            description="Use fallback data when optional APIs are unavailable."
                            enabled={settings.enableMockFallbacks}
                            onChange={() =>
                                updateSetting(
                                    "enableMockFallbacks",
                                    !settings.enableMockFallbacks
                                )
                            }
                        />

                        <ToggleRow
                            title="Agent visualization"
                            description="Show LangGraph-style execution graph while analyzing."
                            enabled={settings.enableAgentVisualization}
                            onChange={() =>
                                updateSetting(
                                    "enableAgentVisualization",
                                    !settings.enableAgentVisualization
                                )
                            }
                        />

                        <ToggleRow
                            title="Local history"
                            description="Keep local browser history as fallback."
                            enabled={settings.enableLocalHistory}
                            onChange={() =>
                                updateSetting("enableLocalHistory", !settings.enableLocalHistory)
                            }
                        />
                    </div>
                </SettingsCard>
            </section>

            <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <SettingsCard
                    icon={<Sparkles className="h-5 w-5" />}
                    eyebrow="Investor profile"
                    title="Risk profile"
                    description="Used to communicate how recommendations should be interpreted."
                >
                    <div className="grid gap-4 md:grid-cols-3">
                        {(["Conservative", "Balanced", "Aggressive"] as UserRiskProfile[]).map(
                            (profile) => (
                                <SelectableButton
                                    key={profile}
                                    selected={settings.riskProfile === profile}
                                    title={profile}
                                    description={
                                        profile === "Conservative"
                                            ? "Risk first"
                                            : profile === "Balanced"
                                                ? "Quality + growth"
                                                : "Growth first"
                                    }
                                    onClick={() => updateSetting("riskProfile", profile)}
                                />
                            )
                        )}
                    </div>
                </SettingsCard>

                <section className="rounded-[2.5rem] border border-emerald-400/20 bg-emerald-400/10 p-6 md:p-8">
                    <div className="mb-4 flex items-center gap-2 text-emerald-600 dark:text-emerald-300">
                        <CheckCircle2 className="h-5 w-5" />
                        <p className="font-black">SaaS-ready settings</p>
                    </div>

                    <h3 className="text-3xl font-black text-slate-950 dark:text-white">
                        Preferences are now database-backed.
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-300">
                        This improves your project because logged-in users can have their
                        own settings instead of only using localStorage.
                    </p>
                </section>
            </section>

            <AccountDangerZone />
        </div>
    );
}

function SettingsCard({
    icon,
    eyebrow,
    title,
    description,
    children,
}: {
    icon: React.ReactNode;
    eyebrow: string;
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20 md:p-8">
            <div className="mb-6 flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-cyan-600 dark:bg-white/10 dark:text-cyan-300">
                    {icon}
                </div>

                <div>
                    <p className="mb-1 text-xs font-black uppercase tracking-[0.25em] text-cyan-600 dark:text-cyan-300">
                        {eyebrow}
                    </p>

                    <h3 className="text-2xl font-black text-slate-950 dark:text-white">
                        {title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                        {description}
                    </p>
                </div>
            </div>

            {children}
        </section>
    );
}

function SelectableButton({
    selected,
    title,
    description,
    icon,
    onClick,
}: {
    selected: boolean;
    title: string;
    description: string;
    icon?: React.ReactNode;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`rounded-[1.5rem] border p-5 text-left transition hover:-translate-y-0.5 ${selected
                    ? "border-cyan-400/40 bg-cyan-400/10 shadow-xl shadow-cyan-500/10"
                    : "border-slate-200 bg-slate-50 hover:bg-white dark:border-white/10 dark:bg-slate-950/60 dark:hover:bg-white/10"
                }`}
        >
            <div className="mb-4 flex items-center justify-between gap-3">
                <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl ${selected
                            ? "bg-cyan-500 text-white"
                            : "bg-white text-slate-500 shadow-sm dark:bg-white/10 dark:text-slate-300"
                        }`}
                >
                    {icon ?? <Sparkles className="h-5 w-5" />}
                </div>

                {selected && (
                    <CheckCircle2 className="h-5 w-5 text-cyan-600 dark:text-cyan-300" />
                )}
            </div>

            <p className="font-black text-slate-950 dark:text-white">{title}</p>

            <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                {description}
            </p>
        </button>
    );
}

function ToggleRow({
    title,
    description,
    enabled,
    onChange,
}: {
    title: string;
    description: string;
    enabled: boolean;
    onChange: () => void;
}) {
    return (
        <div className="flex items-center justify-between gap-5 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-950/60">
            <div>
                <p className="font-black text-slate-950 dark:text-white">{title}</p>

                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    {description}
                </p>
            </div>

            <button
                onClick={onChange}
                className={`relative h-8 w-14 shrink-0 rounded-full transition ${enabled ? "bg-cyan-500" : "bg-slate-300 dark:bg-white/20"
                    }`}
            >
                <span
                    className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition ${enabled ? "left-7" : "left-1"
                        }`}
                />
            </button>
        </div>
    );
}

function Label({ children }: { children: React.ReactNode }) {
    return (
        <p className="mb-2 text-sm font-black text-slate-700 dark:text-slate-300">
            {children}
        </p>
    );
}