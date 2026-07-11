import type { ComparisonApiResponse } from "@/lib/api-client";
import type { InvestmentResearchReport } from "@/lib/types/research";

export type UserHistoryItemType = "RESEARCH" | "COMPARISON";

export type UserHistoryItem = {
  id: string;
  userId: string;
  type: UserHistoryItemType;
  title: string;
  subtitle: string | null;
  symbol: string | null;
  decision: string | null;
  score: number | null;
  payload: unknown;
  createdAt: string;
  updatedAt: string;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
};

export async function getUserHistory(type?: UserHistoryItemType) {
  const query = type ? `?type=${type}` : "";

  const response = await fetch(`/api/user/history${query}`, {
    method: "GET",
    cache: "no-store",
  });

  const data = (await response.json()) as ApiResponse<UserHistoryItem[]>;

  if (!response.ok || !data.success || !data.data) {
    throw new Error(data.error ?? "Failed to fetch user history.");
  }

  return data.data;
}

export async function saveResearchHistory(report: InvestmentResearchReport) {
  const response = await fetch("/api/user/history", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "RESEARCH",
      title: report.company.name,
      subtitle: `${report.company.symbol} · ${report.decision}`,
      symbol: report.company.symbol,
      decision: report.decision,
      score: report.score.total,
      payload: report,
    }),
  });

  const data = (await response.json()) as ApiResponse<UserHistoryItem>;

  if (!response.ok || !data.success || !data.data) {
    throw new Error(data.error ?? "Failed to save research history.");
  }

  return data.data;
}

export async function saveComparisonHistory(
  comparison: NonNullable<ComparisonApiResponse["data"]>
) {
  const response = await fetch("/api/user/history", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "COMPARISON",
      title: `Comparison Winner: ${comparison.comparison.winnerName}`,
      subtitle: `${comparison.comparison.winnerSymbol} · ${comparison.comparison.winnerDecision}`,
      symbol: comparison.comparison.winnerSymbol,
      decision: comparison.comparison.winnerDecision,
      score: comparison.comparison.winnerScore,
      payload: comparison,
    }),
  });

  const data = (await response.json()) as ApiResponse<UserHistoryItem>;

  if (!response.ok || !data.success || !data.data) {
    throw new Error(data.error ?? "Failed to save comparison history.");
  }

  return data.data;
}

export async function deleteUserHistoryItem(id: string) {
  const response = await fetch(`/api/user/history?id=${id}`, {
    method: "DELETE",
  });

  const data = (await response.json()) as ApiResponse<null>;

  if (!response.ok || !data.success) {
    throw new Error(data.error ?? "Failed to delete history item.");
  }

  return data.message ?? "History item deleted.";
}

export async function clearUserHistory() {
  const response = await fetch("/api/user/history", {
    method: "DELETE",
  });

  const data = (await response.json()) as ApiResponse<null>;

  if (!response.ok || !data.success) {
    throw new Error(data.error ?? "Failed to clear history.");
  }

  return data.message ?? "History cleared.";
}

export function isResearchPayload(
  payload: unknown
): payload is InvestmentResearchReport {
  if (!payload || typeof payload !== "object") return false;

  const item = payload as Partial<InvestmentResearchReport>;

  return Boolean(
    item.company &&
      item.decision &&
      item.score &&
      typeof item.thesis === "string"
  );
}

export function isComparisonPayload(
  payload: unknown
): payload is NonNullable<ComparisonApiResponse["data"]> {
  if (!payload || typeof payload !== "object") return false;

  const item = payload as Partial<NonNullable<ComparisonApiResponse["data"]>>;

  return Boolean(item.comparison && item.metadata);
}