import type { UserExportItem } from "@/lib/user-data/exports-client";
import type { UserHistoryItem } from "@/lib/user-data/history-client";
import type { UserSettings } from "@/lib/user-data/settings-client";
import type { UserWatchlistItem } from "@/lib/user-data/watchlist-client";

export type AdminUserRole = "USER" | "ADMIN";

export type AdminUserListItem = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: AdminUserRole;
  emailVerified: string | null;
  createdAt: string;
  updatedAt: string;
  providers: string[];
  counts: {
    watchlistItems: number;
    historyItems: number;
    exportItems: number;
    sessions: number;
  };
};

export type AdminUsersResponse = {
  users: AdminUserListItem[];
  pagination: {
    page: number;
    limit: number;
    totalUsers: number;
    totalPages: number;
  };
};

export type AdminUserDetails = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: AdminUserRole;
  emailVerified: string | null;
  createdAt: string;
  updatedAt: string;

  accounts: {
    provider: string;
    type: string;
  }[];

  providers: string[];
  settings: UserSettings | null;

  watchlistItems: UserWatchlistItem[];
  historyItems: UserHistoryItem[];
  exportItems: UserExportItem[];

  counts: {
    watchlistItems: number;
    historyItems: number;
    exportItems: number;
    sessions: number;
    accounts: number;
    otpTokens: number;
  };
};

export type AdminUpdateUserInput = {
  name?: string | null;
  role?: AdminUserRole;
  emailVerified?: boolean;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
};

export async function getAdminUsers(filters?: {
  search?: string;
  role?: AdminUserRole;
  page?: number;
  limit?: number;
}) {
  const params = new URLSearchParams();

  if (filters?.search) {
    params.set("search", filters.search);
  }

  if (filters?.role) {
    params.set("role", filters.role);
  }

  if (filters?.page) {
    params.set("page", String(filters.page));
  }

  if (filters?.limit) {
    params.set("limit", String(filters.limit));
  }

  const query = params.toString() ? `?${params.toString()}` : "";

  const response = await fetch(`/api/admin/users${query}`, {
    method: "GET",
    cache: "no-store",
  });

  const data = (await response.json()) as ApiResponse<AdminUsersResponse>;

  if (!response.ok || !data.success || !data.data) {
    throw new Error(data.error ?? "Failed to fetch admin users.");
  }

  return data.data;
}

export async function getAdminUserDetails(userId: string) {
  const response = await fetch(`/api/admin/users/${userId}`, {
    method: "GET",
    cache: "no-store",
  });

  const data = (await response.json()) as ApiResponse<AdminUserDetails>;

  if (!response.ok || !data.success || !data.data) {
    throw new Error(data.error ?? "Failed to fetch user details.");
  }

  return data.data;
}

export async function updateAdminUser(
  userId: string,
  input: AdminUpdateUserInput
) {
  const response = await fetch(`/api/admin/users/${userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = (await response.json()) as ApiResponse<AdminUserDetails>;

  if (!response.ok || !data.success || !data.data) {
    throw new Error(data.error ?? "Failed to update user.");
  }

  return data.data;
}

export async function deleteAdminUser(userId: string) {
  const response = await fetch(`/api/admin/users/${userId}`, {
    method: "DELETE",
  });

  const data = (await response.json()) as ApiResponse<null>;

  if (!response.ok || !data.success) {
    throw new Error(data.error ?? "Failed to delete user.");
  }

  return data.message ?? "User deleted successfully.";
}

export function getAdminUserDisplayName(user: AdminUserListItem | AdminUserDetails) {
  if (user.name?.trim()) {
    return user.name.trim();
  }

  return user.email.split("@")[0] ?? "User";
}

export function getAdminUserInitials(user: AdminUserListItem | AdminUserDetails) {
  const displayName = getAdminUserDisplayName(user);

  const parts = displayName
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return displayName.slice(0, 2).toUpperCase();
}

export function getAdminUserProviderLabel(user: AdminUserListItem | AdminUserDetails) {
  if (user.providers.includes("google") && user.providers.length > 1) {
    return "Google + Email";
  }

  if (user.providers.includes("google")) {
    return "Google";
  }

  if (user.providers.length > 0) {
    return user.providers.join(", ");
  }

  return "Email";
}

export function getAdminUserWorkspaceCount(
  user: AdminUserListItem | AdminUserDetails
) {
  return (
    user.counts.watchlistItems +
    user.counts.historyItems +
    user.counts.exportItems
  );
}

export function formatAdminDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}