import type { UserExportItem } from "@/lib/user-data/exports-client";
import type { UserHistoryItem } from "@/lib/user-data/history-client";
import type { UserProfile } from "@/lib/user-data/profile-client";
import type { UserSettings } from "@/lib/user-data/settings-client";
import type { UserWatchlistItem } from "@/lib/user-data/watchlist-client";

export type UserDashboardData = {
  profile: UserProfile;

  settings: UserSettings | null;

  metrics: {
    watchlistCount: number;
    historyCount: number;
    researchCount: number;
    comparisonCount: number;
    exportCount: number;
    averageResearchScore: number;
  };

  latest: {
    watchlistItems: UserWatchlistItem[];
    historyItems: UserHistoryItem[];
    exportItems: UserExportItem[];
  };
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
};

export async function getUserDashboard() {
  const response = await fetch("/api/user/dashboard", {
    method: "GET",
    cache: "no-store",
  });

  const data = (await response.json()) as ApiResponse<UserDashboardData>;

  if (!response.ok || !data.success || !data.data) {
    throw new Error(data.error ?? "Failed to fetch dashboard data.");
  }

  return data.data;
}

export function getDashboardGreeting(profile: UserProfile | null) {
  const hour = new Date().getHours();

  const timeGreeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const name =
    profile?.name?.trim() ||
    profile?.email?.split("@")[0] ||
    "Investor";

  return `${timeGreeting}, ${name}`;
}

export function getDashboardHealthLabel(data: UserDashboardData | null) {
  if (!data) return "Not connected";

  const { watchlistCount, historyCount, exportCount } = data.metrics;

  if (watchlistCount >= 3 && historyCount >= 3 && exportCount >= 1) {
    return "Workspace active";
  }

  if (watchlistCount > 0 || historyCount > 0) {
    return "Workspace started";
  }

  return "New workspace";
}

export function getDashboardCompletionScore(data: UserDashboardData | null) {
  if (!data) return 0;

  let score = 0;

  if (data.profile.emailVerified) score += 20;
  if (data.settings) score += 20;
  if (data.metrics.watchlistCount > 0) score += 20;
  if (data.metrics.historyCount > 0) score += 25;
  if (data.metrics.exportCount > 0) score += 15;

  return score;
}

export function formatDashboardDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}