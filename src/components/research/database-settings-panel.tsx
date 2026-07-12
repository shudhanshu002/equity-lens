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
    SlidersHorizontal,
    ShieldCheck,
    UserRound,
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
    const [section, setSection] = useState<SettingsSection>("profile");

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

    return (
        <div className="space-y-5 pt-3">
            <section className="border-b border-slate-200 pb-5 dark:border-white/10">
                <div>
                    <div>
                        <div className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-violet-600 dark:text-violet-300">
                            <Settings className="h-4 w-4" />
                            Settings
                        </div>

                        <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">
                            Account settings
                        </h2>

                        <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                            Manage your profile, security, and research preferences.
                        </p>

                        {section === "preferences" && <div className="mt-4 flex flex-wrap gap-2">
                            <button
                                onClick={saveSettings}
                                disabled={saving}
                                className="inline-flex h-9 items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-medium text-white disabled:opacity-60 dark:bg-white dark:text-slate-950"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Saving
                                    </>
                                ) : (
                                    <>
                                        Save
                                        <Save className="h-4 w-4" />
                                    </>
                                )}
                            </button>

                            <button
                                onClick={resetSettings}
                                className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 dark:border-white/10 dark:text-slate-200"
                            >
                                Reset
                                <RefreshCcw className="h-4 w-4" />
                            </button>
                        </div>}

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

            </section>

            <nav className="flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-white/10" aria-label="Settings sections">
                {settingsSections.map((item) => {
                    const Icon = item.icon;
                    return <button key={item.id} onClick={() => setSection(item.id)} className={`inline-flex h-10 shrink-0 items-center gap-2 border-b-2 px-3 text-sm font-medium ${section === item.id ? "border-slate-950 text-slate-950 dark:border-white dark:text-white" : "border-transparent text-slate-500 dark:text-slate-400"}`}><Icon className="h-4 w-4" />{item.label}</button>;
                })}
            </nav>

            {section === "profile" && <ProfileSettingsCard />}

            {section === "security" && <ChangePasswordCard />}

            {section === "preferences" && <div className="sr-only"><SettingsSyncBanner onSynced={applySyncedSettings} /></div>}

            {section === "preferences" && <><section className="hidden">
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

            <section className="grid gap-5 xl:grid-cols-[1fr_1fr]">
                <SettingsCard
                    icon={<Sun className="h-5 w-5" />}
                    eyebrow="Appearance"
                    title="Theme"
                    description="Switch between professional light and dark mode."
                >
                    <div className="flex flex-wrap gap-2">
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
                    <div className="divide-y divide-slate-200 border-y border-slate-200 dark:divide-white/10 dark:border-white/10">
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

            <section>
                <SettingsCard
                    icon={<Sparkles className="h-5 w-5" />}
                    eyebrow="Investor profile"
                    title="Risk profile"
                    description="Used to communicate how recommendations should be interpreted."
                >
                    <div className="flex flex-wrap gap-2">
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

            </section>
            </>}

            {section === "account" && <AccountDangerZone />}
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
        <section className="border-b border-slate-200 py-4 dark:border-white/10">
            <div className="mb-3 flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center text-slate-500 dark:text-slate-400">
                    {icon}
                </div>

                <div>
                    <p className="text-xs font-medium text-slate-400">
                        {eyebrow}
                    </p>

                    <h3 className="text-base font-semibold text-slate-950 dark:text-white">
                        {title}
                    </h3>

                    <p className="hidden">
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
            className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-left text-sm font-medium transition ${selected
                    ? "border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950"
                    : "border-slate-200 text-slate-600 dark:border-white/10 dark:text-slate-300"
                }`}
        >
            {icon}
            <span>{title}</span>
            {selected && <CheckCircle2 className="h-3.5 w-3.5" />}
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
        <div className="flex items-center justify-between gap-5 py-3">
            <div>
                <p className="text-sm font-medium text-slate-950 dark:text-white">{title}</p>

                <p className="hidden">{description}</p>
            </div>

            <button
                onClick={onChange}
                aria-label={`Toggle ${title}`}
                className={`relative h-6 w-10 shrink-0 rounded-full transition ${enabled ? "bg-slate-950 dark:bg-white" : "bg-slate-300 dark:bg-white/20"
                    }`}
            >
                <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition dark:bg-slate-950 ${enabled ? "left-5" : "left-1"
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

type SettingsSection = "profile" | "security" | "preferences" | "account";

const settingsSections: { id: SettingsSection; label: string; icon: typeof Settings }[] = [
    { id: "profile", label: "Profile", icon: UserRound },
    { id: "security", label: "Security", icon: ShieldCheck },
    { id: "preferences", label: "Research preferences", icon: SlidersHorizontal },
    { id: "account", label: "Account", icon: Lock },
];
