import type {
  UserWatchlistItem,
  WatchlistRisk,
  WatchlistStatus,
} from "@/lib/user-data/watchlist-client";

export type SyncWatchlistItemInput = {
  company: string;
  symbol?: string | null;
  thesis?: string | null;
  status?: WatchlistStatus;
  score?: number;
  risk?: WatchlistRisk;
};

export type SyncWatchlistInput = {
  items: SyncWatchlistItemInput[];
  clearBeforeSync?: boolean;
};

export type SyncWatchlistResult = {
  syncedCount: number;
  skippedCount: number;
  items: UserWatchlistItem[];
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
};

export async function syncUserWatchlist(input: SyncWatchlistInput) {
  const response = await fetch("/api/user/watchlist/sync", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = (await response.json()) as ApiResponse<SyncWatchlistResult>;

  if (!response.ok || !data.success || !data.data) {
    throw new Error(data.error ?? "Failed to sync watchlist.");
  }

  return data.data;
}

export function getLocalWatchlistForSync() {
  if (typeof window === "undefined") return [];

  try {
    const raw =
      window.localStorage.getItem("equitylens-watchlist") ??
      window.localStorage.getItem("equitylens-local-watchlist");

    if (!raw) return [];

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => normalizeLocalWatchlistItem(item))
      .filter(Boolean) as SyncWatchlistItemInput[];
  } catch {
    return [];
  }
}

export async function syncLocalWatchlistToDatabase(options?: {
  clearBeforeSync?: boolean;
}) {
  const items = getLocalWatchlistForSync();

  if (items.length === 0) {
    return {
      syncedCount: 0,
      skippedCount: 0,
      items: [],
    } satisfies SyncWatchlistResult;
  }

  return syncUserWatchlist({
    items,
    clearBeforeSync: options?.clearBeforeSync ?? false,
  });
}

export function clearLocalWatchlistAfterSync() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem("equitylens-watchlist");
  window.localStorage.removeItem("equitylens-local-watchlist");
}

function normalizeLocalWatchlistItem(item: unknown) {
  if (!item || typeof item !== "object") return null;

  const value = item as Record<string, unknown>;

  const company =
    typeof value.company === "string"
      ? value.company.trim()
      : typeof value.name === "string"
        ? value.name.trim()
        : "";

  if (!company) return null;

  const symbol =
    typeof value.symbol === "string" && value.symbol.trim()
      ? value.symbol.trim()
      : company.slice(0, 4).toUpperCase();

  const thesis =
    typeof value.thesis === "string" && value.thesis.trim()
      ? value.thesis.trim()
      : "Synced from local watchlist.";

  const status = normalizeStatus(value.status);
  const risk = normalizeRisk(value.risk);

  const score =
    typeof value.score === "number" && Number.isFinite(value.score)
      ? Math.min(100, Math.max(0, Math.round(value.score)))
      : 50;

  return {
    company,
    symbol,
    thesis,
    status,
    score,
    risk,
  } satisfies SyncWatchlistItemInput;
}

function normalizeStatus(value: unknown): WatchlistStatus {
  if (
    value === "Research" ||
    value === "Watchlist" ||
    value === "High Conviction"
  ) {
    return value;
  }

  return "Research";
}

function normalizeRisk(value: unknown): WatchlistRisk {
  if (value === "Low" || value === "Medium" || value === "High") {
    return value;
  }

  return "Medium";
}