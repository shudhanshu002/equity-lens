export type UserThemeMode = "dark" | "light";
export type UserLlmProvider = "Gemini" | "OpenAI" | "Claude";
export type UserFinancialProvider = "Alpha Vantage" | "Finnhub" | "Yahoo Finance";
export type UserRiskProfile = "Conservative" | "Balanced" | "Aggressive";

export type UserSettings = {
  id: string;
  userId: string;

  theme: UserThemeMode;
  llmProvider: UserLlmProvider;
  llmModel: string;
  financialProvider: UserFinancialProvider;
  riskProfile: UserRiskProfile;

  enableMockFallbacks: boolean;
  enableAgentVisualization: boolean;
  enableLocalHistory: boolean;

  createdAt: string;
  updatedAt: string;
};

export type UpdateUserSettingsInput = Partial<{
  theme: UserThemeMode;
  llmProvider: UserLlmProvider;
  llmModel: string;
  financialProvider: UserFinancialProvider;
  riskProfile: UserRiskProfile;
  enableMockFallbacks: boolean;
  enableAgentVisualization: boolean;
  enableLocalHistory: boolean;
}>;

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
};

export const DEFAULT_USER_SETTINGS: Omit<
  UserSettings,
  "id" | "userId" | "createdAt" | "updatedAt"
> = {
  theme: "dark",
  llmProvider: "Gemini",
  llmModel: "gemini-2.5-flash",
  financialProvider: "Alpha Vantage",
  riskProfile: "Balanced",
  enableMockFallbacks: true,
  enableAgentVisualization: true,
  enableLocalHistory: true,
};

export async function getUserSettings() {
  const response = await fetch("/api/user/settings", {
    method: "GET",
    cache: "no-store",
  });

  const data = (await response.json()) as ApiResponse<UserSettings>;

  if (!response.ok || !data.success || !data.data) {
    throw new Error(data.error ?? "Failed to fetch user settings.");
  }

  return data.data;
}

export async function updateUserSettings(input: UpdateUserSettingsInput) {
  const response = await fetch("/api/user/settings", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = (await response.json()) as ApiResponse<UserSettings>;

  if (!response.ok || !data.success || !data.data) {
    throw new Error(data.error ?? "Failed to update user settings.");
  }

  return data.data;
}

export function applyThemePreference(theme: UserThemeMode) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  window.localStorage.setItem("equitylens-theme", theme);
}

export function getLocalThemePreference(): UserThemeMode {
  const savedTheme = window.localStorage.getItem("equitylens-theme");

  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  return prefersDark ? "dark" : "light";
}

export function mergeWithDefaultSettings(
  settings?: Partial<UserSettings> | null
) {
  return {
    ...DEFAULT_USER_SETTINGS,
    ...settings,
  };
}