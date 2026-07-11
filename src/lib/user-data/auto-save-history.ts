import type { ComparisonApiResponse } from "@/lib/api-client";
import type { InvestmentResearchReport } from "@/lib/types/research";
import {
  saveComparisonHistory,
  saveResearchHistory,
  type UserHistoryItemType,
} from "@/lib/user-data/history-client";

const LOCAL_HISTORY_KEY = "equitylens-local-history";

export type AutoSaveMode = "database" | "local" | "skipped";

export type AutoSaveHistoryResult = {
  saved: boolean;
  mode: AutoSaveMode;
  message: string;
  error?: string;
};

export type LocalHistoryItem = {
  id: string;
  type: UserHistoryItemType;
  title: string;
  subtitle?: string;
  symbol?: string;
  decision?: string;
  score?: number;
  payload: unknown;
  createdAt: string;
};

type AutoSaveOptions = {
  loggedIn: boolean;
  enableLocalFallback?: boolean;
};

export async function autoSaveResearchHistory(
  report: InvestmentResearchReport,
  options: AutoSaveOptions
): Promise<AutoSaveHistoryResult> {
  const enableLocalFallback = options.enableLocalFallback ?? true;

  if (options.loggedIn) {
    try {
      await saveResearchHistory(report);

      return {
        saved: true,
        mode: "database",
        message: "Research report saved to your account history.",
      };
    } catch (error) {
      if (!enableLocalFallback) {
        return {
          saved: false,
          mode: "skipped",
          message: "Research completed, but history was not saved.",
          error:
            error instanceof Error
              ? error.message
              : "Failed to save research history.",
        };
      }
    }
  }

  if (!enableLocalFallback) {
    return {
      saved: false,
      mode: "skipped",
      message: "Research completed. Login to save reports to history.",
    };
  }

  saveLocalHistoryItem({
    id: createLocalHistoryId("research"),
    type: "RESEARCH",
    title: report.company.name,
    subtitle: `${report.company.symbol} · ${report.decision}`,
    symbol: report.company.symbol,
    decision: report.decision,
    score: report.score.total,
    payload: report,
    createdAt: new Date().toISOString(),
  });

  return {
    saved: true,
    mode: "local",
    message: options.loggedIn
      ? "Database save failed, so the report was saved locally."
      : "Research report saved locally. Login to sync future reports.",
  };
}

export async function autoSaveComparisonHistory(
  comparison: NonNullable<ComparisonApiResponse["data"]>,
  options: AutoSaveOptions
): Promise<AutoSaveHistoryResult> {
  const enableLocalFallback = options.enableLocalFallback ?? true;

  if (options.loggedIn) {
    try {
      await saveComparisonHistory(comparison);

      return {
        saved: true,
        mode: "database",
        message: "Comparison saved to your account history.",
      };
    } catch (error) {
      if (!enableLocalFallback) {
        return {
          saved: false,
          mode: "skipped",
          message: "Comparison completed, but history was not saved.",
          error:
            error instanceof Error
              ? error.message
              : "Failed to save comparison history.",
        };
      }
    }
  }

  if (!enableLocalFallback) {
    return {
      saved: false,
      mode: "skipped",
      message: "Comparison completed. Login to save comparisons to history.",
    };
  }

  saveLocalHistoryItem({
    id: createLocalHistoryId("comparison"),
    type: "COMPARISON",
    title: `Comparison Winner: ${comparison.comparison.winnerName}`,
    subtitle: `${comparison.comparison.winnerSymbol} · ${comparison.comparison.winnerDecision}`,
    symbol: comparison.comparison.winnerSymbol,
    decision: comparison.comparison.winnerDecision,
    score: comparison.comparison.winnerScore,
    payload: comparison,
    createdAt: new Date().toISOString(),
  });

  return {
    saved: true,
    mode: "local",
    message: options.loggedIn
      ? "Database save failed, so the comparison was saved locally."
      : "Comparison saved locally. Login to sync future comparisons.",
  };
}

export function getLocalHistoryItems() {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(LOCAL_HISTORY_KEY);

    if (!raw) return [];

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    return parsed as LocalHistoryItem[];
  } catch {
    return [];
  }
}

export function clearLocalHistoryItems() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(LOCAL_HISTORY_KEY);
}

function saveLocalHistoryItem(item: LocalHistoryItem) {
  if (typeof window === "undefined") return;

  const currentItems = getLocalHistoryItems();

  const nextItems = [item, ...currentItems].slice(0, 50);

  window.localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(nextItems));
}

function createLocalHistoryId(type: "research" | "comparison") {
  return `local-${type}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}