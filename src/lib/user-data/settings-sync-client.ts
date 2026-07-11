import {
  DEFAULT_USER_SETTINGS,
  type UpdateUserSettingsInput,
  type UserSettings,
} from "@/lib/user-data/settings-client";

const LOCAL_SETTINGS_KEY = "equitylens-settings";

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
};

export type SyncSettingsResult = UserSettings;

export async function syncUserSettings(settings: UpdateUserSettingsInput) {
  const response = await fetch("/api/user/settings/sync", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      settings,
    }),
  });

  const data = (await response.json()) as ApiResponse<SyncSettingsResult>;

  if (!response.ok || !data.success || !data.data) {
    throw new Error(data.error ?? "Failed to sync settings.");
  }

  return data.data;
}

export function getLocalSettingsForSync() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(LOCAL_SETTINGS_KEY);

    if (!raw) return null;

    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== "object") return null;

    return normalizeLocalSettings(parsed);
  } catch {
    return null;
  }
}

export async function syncLocalSettingsToDatabase() {
  const settings = getLocalSettingsForSync();

  if (!settings) {
    return null;
  }

  return syncUserSettings(settings);
}

export function saveLocalSettingsForSync(settings: UpdateUserSettingsInput) {
  if (typeof window === "undefined") return;

  const current = getLocalSettingsForSync() ?? DEFAULT_USER_SETTINGS;

  window.localStorage.setItem(
    LOCAL_SETTINGS_KEY,
    JSON.stringify({
      ...current,
      ...settings,
    })
  );
}

export function clearLocalSettingsAfterSync() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(LOCAL_SETTINGS_KEY);
}

function normalizeLocalSettings(value: unknown): UpdateUserSettingsInput | null {
  if (!value || typeof value !== "object") return null;

  const input = value as Record<string, unknown>;
  const settings: UpdateUserSettingsInput = {};

  if (input.theme === "dark" || input.theme === "light") {
    settings.theme = input.theme;
  }

  if (
    input.llmProvider === "Gemini" ||
    input.llmProvider === "OpenAI" ||
    input.llmProvider === "Claude"
  ) {
    settings.llmProvider = input.llmProvider;
  }

  if (typeof input.llmModel === "string" && input.llmModel.trim()) {
    settings.llmModel = input.llmModel.trim().slice(0, 80);
  }

  if (
    input.financialProvider === "Alpha Vantage" ||
    input.financialProvider === "Finnhub" ||
    input.financialProvider === "Yahoo Finance"
  ) {
    settings.financialProvider = input.financialProvider;
  }

  if (
    input.riskProfile === "Conservative" ||
    input.riskProfile === "Balanced" ||
    input.riskProfile === "Aggressive"
  ) {
    settings.riskProfile = input.riskProfile;
  }

  if (typeof input.enableMockFallbacks === "boolean") {
    settings.enableMockFallbacks = input.enableMockFallbacks;
  }

  if (typeof input.enableAgentVisualization === "boolean") {
    settings.enableAgentVisualization = input.enableAgentVisualization;
  }

  if (typeof input.enableLocalHistory === "boolean") {
    settings.enableLocalHistory = input.enableLocalHistory;
  }

  return Object.keys(settings).length > 0 ? settings : null;
}