export type AdminStatsUser = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: "USER" | "ADMIN";
  emailVerified: string | null;
  createdAt: string;
  _count: {
    watchlistItems: number;
    historyItems: number;
    exportItems: number;
  };
};

export type AdminStatsHistoryItem = {
  id: string;
  title: string;
  type: "RESEARCH" | "COMPARISON";
  symbol: string | null;
  decision: string | null;
  score: number | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
};

export type AdminStatsExportItem = {
  id: string;
  title: string;
  type: string;
  format: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
};

export type AdminStatsData = {
  users: {
    total: number;
    verified: number;
    unverified: number;
    admins: number;
    normalUsers: number;
    passwordUsers: number;
    googleUsers: number;
  };

  workspace: {
    watchlistItems: number;
    historyItems: number;
    researchItems: number;
    comparisonItems: number;
    exportItems: number;
    activeSessions: number;
    averageResearchScore: number;
  };

  latest: {
    users: AdminStatsUser[];
    historyItems: AdminStatsHistoryItem[];
    exportItems: AdminStatsExportItem[];
  };
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
};

export async function getAdminStats() {
  const response = await fetch("/api/admin/stats", {
    method: "GET",
    cache: "no-store",
  });

  const data = (await response.json()) as ApiResponse<AdminStatsData>;

  if (!response.ok || !data.success || !data.data) {
    throw new Error(data.error ?? "Failed to fetch admin stats.");
  }

  return data.data;
}

export function getAdminStatsVerificationRate(stats: AdminStatsData | null) {
  if (!stats || stats.users.total === 0) return 0;

  return Math.round((stats.users.verified / stats.users.total) * 100);
}

export function getAdminStatsGoogleRate(stats: AdminStatsData | null) {
  if (!stats || stats.users.total === 0) return 0;

  return Math.round((stats.users.googleUsers / stats.users.total) * 100);
}

export function getAdminStatsPasswordRate(stats: AdminStatsData | null) {
  if (!stats || stats.users.total === 0) return 0;

  return Math.round((stats.users.passwordUsers / stats.users.total) * 100);
}

export function getAdminStatsWorkspaceTotal(stats: AdminStatsData | null) {
  if (!stats) return 0;

  return (
    stats.workspace.watchlistItems +
    stats.workspace.historyItems +
    stats.workspace.exportItems
  );
}

export function getAdminStatsActivityHealth(stats: AdminStatsData | null) {
  if (!stats) return "No data";

  const workspaceTotal = getAdminStatsWorkspaceTotal(stats);

  if (stats.users.total >= 5 && workspaceTotal >= 20) {
    return "High activity";
  }

  if (stats.users.total >= 2 && workspaceTotal >= 5) {
    return "Growing";
  }

  if (stats.users.total > 0) {
    return "Early usage";
  }

  return "No users yet";
}

export function getAdminStatsUserName(
  user:
    | AdminStatsUser
    | AdminStatsHistoryItem["user"]
    | AdminStatsExportItem["user"]
) {
  if (user.name?.trim()) {
    return user.name.trim();
  }

  return user.email.split("@")[0] ?? "User";
}

export function formatAdminStatsDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}