import type {
  LocalHistoryItem,
} from "@/lib/user-data/auto-save-history";
import {
  clearLocalHistoryItems,
  getLocalHistoryItems,
} from "@/lib/user-data/auto-save-history";
import type {
  UserHistoryItem,
  UserHistoryItemType,
} from "@/lib/user-data/history-client";

export type SyncHistoryItemInput = {
  type: UserHistoryItemType;
  title: string;
  subtitle?: string | null;
  symbol?: string | null;
  decision?: string | null;
  score?: number | null;
  payload?: unknown;
  createdAt?: string;
};

export type SyncHistoryInput = {
  items: SyncHistoryItemInput[];
  clearBeforeSync?: boolean;
};

export type SyncHistoryResult = {
  syncedCount: number;
  skippedCount: number;
  items: UserHistoryItem[];
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
};

export async function syncUserHistory(input: SyncHistoryInput) {
  const response = await fetch("/api/user/history/sync", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = (await response.json()) as ApiResponse<SyncHistoryResult>;

  if (!response.ok || !data.success || !data.data) {
    throw new Error(data.error ?? "Failed to sync history.");
  }

  return data.data;
}

export function getLocalHistoryForSync() {
  const localItems = getLocalHistoryItems();

  return localItems
    .map((item) => normalizeLocalHistoryItem(item))
    .filter(Boolean) as SyncHistoryItemInput[];
}

export async function syncLocalHistoryToDatabase(options?: {
  clearBeforeSync?: boolean;
}) {
  const items = getLocalHistoryForSync();

  if (items.length === 0) {
    return {
      syncedCount: 0,
      skippedCount: 0,
      items: [],
    } satisfies SyncHistoryResult;
  }

  return syncUserHistory({
    items,
    clearBeforeSync: options?.clearBeforeSync ?? false,
  });
}

export function clearLocalHistoryAfterSync() {
  clearLocalHistoryItems();
}

function normalizeLocalHistoryItem(item: LocalHistoryItem) {
  if (!item || typeof item !== "object") return null;

  const type = normalizeHistoryType(item.type);

  if (!type) return null;

  const title =
    typeof item.title === "string" && item.title.trim()
      ? item.title.trim()
      : type === "RESEARCH"
        ? "Research Report"
        : "Comparison Report";

  const subtitle =
    typeof item.subtitle === "string" && item.subtitle.trim()
      ? item.subtitle.trim()
      : null;

  const symbol =
    typeof item.symbol === "string" && item.symbol.trim()
      ? item.symbol.trim()
      : null;

  const decision =
    typeof item.decision === "string" && item.decision.trim()
      ? item.decision.trim()
      : null;

  const score =
    typeof item.score === "number" && Number.isFinite(item.score)
      ? Math.min(100, Math.max(0, Math.round(item.score)))
      : null;

  const createdAt =
    typeof item.createdAt === "string" && isValidDateString(item.createdAt)
      ? item.createdAt
      : new Date().toISOString();

  return {
    type,
    title,
    subtitle,
    symbol,
    decision,
    score,
    payload: item.payload,
    createdAt,
  } satisfies SyncHistoryItemInput;
}

function normalizeHistoryType(value: unknown): UserHistoryItemType | null {
  if (value === "RESEARCH" || value === "COMPARISON") {
    return value;
  }

  return null;
}

function isValidDateString(value: string) {
  const date = new Date(value);

  return !Number.isNaN(date.getTime());
}