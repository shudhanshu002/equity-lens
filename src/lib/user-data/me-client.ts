import type { UserSettings } from "@/lib/user-data/settings-client";

export type CurrentUserResponse = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: "USER" | "ADMIN";
  emailVerified: string | null;
  createdAt: string;
  updatedAt: string;

  auth: {
    hasPassword: boolean;
    providers: string[];
  };

  settings: UserSettings | null;

  counts: {
    watchlistItems: number;
    historyItems: number;
    exportItems: number;
  };
};

type MeApiResponse = {
  success: boolean;
  authenticated: boolean;
  error?: string;
  data: CurrentUserResponse | null;
};

export async function getCurrentUser() {
  const response = await fetch("/api/user/me", {
    method: "GET",
    cache: "no-store",
  });

  const data = (await response.json()) as MeApiResponse;

  if (!response.ok || !data.success || !data.authenticated || !data.data) {
    throw new Error(data.error ?? "Failed to fetch current user.");
  }

  return data.data;
}

export async function checkCurrentUser() {
  const response = await fetch("/api/user/me", {
    method: "GET",
    cache: "no-store",
  });

  const data = (await response.json()) as MeApiResponse;

  return {
    authenticated: data.authenticated,
    user: data.data,
    error: data.error,
  };
}

export function getCurrentUserDisplayName(user: CurrentUserResponse | null) {
  if (!user) return "Investor";

  if (user.name?.trim()) {
    return user.name.trim();
  }

  return user.email.split("@")[0] ?? "Investor";
}

export function getCurrentUserInitials(user: CurrentUserResponse | null) {
  const displayName = getCurrentUserDisplayName(user);

  const parts = displayName
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return displayName.slice(0, 2).toUpperCase();
}

export function currentUserHasProvider(
  user: CurrentUserResponse | null,
  provider: string
) {
  return Boolean(user?.auth.providers.includes(provider));
}

export function currentUserHasPassword(user: CurrentUserResponse | null) {
  return Boolean(user?.auth.hasPassword);
}

export function currentUserIsVerified(user: CurrentUserResponse | null) {
  return Boolean(user?.emailVerified);
}

export function getCurrentUserWorkspaceCount(user: CurrentUserResponse | null) {
  if (!user) return 0;

  return (
    user.counts.watchlistItems +
    user.counts.historyItems +
    user.counts.exportItems
  );
}

export function formatCurrentUserDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}