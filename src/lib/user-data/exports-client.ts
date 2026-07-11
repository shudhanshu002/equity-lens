export type UserExportType =
  | "RESEARCH_REPORT"
  | "COMPARISON_REPORT"
  | "WATCHLIST"
  | "SETTINGS"
  | "CUSTOM";

export type UserExportFormat = "PDF" | "MARKDOWN" | "JSON" | "CSV";

export type UserExportItem = {
  id: string;
  userId: string;
  title: string;
  type: UserExportType;
  format: UserExportFormat;
  description: string | null;
  payload: unknown | null;
  metadata: unknown | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateUserExportInput = {
  title: string;
  type: UserExportType;
  format: UserExportFormat;
  description?: string;
  payload?: unknown;
  metadata?: unknown;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
};

export async function getUserExports(filters?: {
  type?: UserExportType;
  format?: UserExportFormat;
}) {
  const params = new URLSearchParams();

  if (filters?.type) {
    params.set("type", filters.type);
  }

  if (filters?.format) {
    params.set("format", filters.format);
  }

  const query = params.toString() ? `?${params.toString()}` : "";

  const response = await fetch(`/api/user/exports${query}`, {
    method: "GET",
    cache: "no-store",
  });

  const data = (await response.json()) as ApiResponse<UserExportItem[]>;

  if (!response.ok || !data.success || !data.data) {
    throw new Error(data.error ?? "Failed to fetch exports.");
  }

  return data.data;
}

export async function saveUserExport(input: CreateUserExportInput) {
  const response = await fetch("/api/user/exports", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = (await response.json()) as ApiResponse<UserExportItem>;

  if (!response.ok || !data.success || !data.data) {
    throw new Error(data.error ?? "Failed to save export.");
  }

  return data.data;
}

export async function deleteUserExport(id: string) {
  const response = await fetch(`/api/user/exports?id=${id}`, {
    method: "DELETE",
  });

  const data = (await response.json()) as ApiResponse<null>;

  if (!response.ok || !data.success) {
    throw new Error(data.error ?? "Failed to delete export.");
  }

  return data.message ?? "Export deleted.";
}

export async function clearUserExports() {
  const response = await fetch("/api/user/exports", {
    method: "DELETE",
  });

  const data = (await response.json()) as ApiResponse<null>;

  if (!response.ok || !data.success) {
    throw new Error(data.error ?? "Failed to clear exports.");
  }

  return data.message ?? "Exports cleared.";
}

export function createExportTitle(input: {
  company?: string;
  symbol?: string;
  winnerName?: string;
  format: UserExportFormat;
  type: UserExportType;
}) {
  if (input.type === "RESEARCH_REPORT" && input.company) {
    return `${input.company} Research Report · ${input.format}`;
  }

  if (input.type === "COMPARISON_REPORT" && input.winnerName) {
    return `Comparison Report · Winner ${input.winnerName} · ${input.format}`;
  }

  if (input.type === "WATCHLIST") {
    return `Portfolio Watchlist · ${input.format}`;
  }

  if (input.type === "SETTINGS") {
    return `Settings Export · ${input.format}`;
  }

  return `EquityLens Export · ${input.format}`;
}

export function formatExportDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function getExportFormatLabel(format: UserExportFormat) {
  const labels: Record<UserExportFormat, string> = {
    PDF: "PDF",
    MARKDOWN: "Markdown",
    JSON: "JSON",
    CSV: "CSV",
  };

  return labels[format];
}

export function getExportTypeLabel(type: UserExportType) {
  const labels: Record<UserExportType, string> = {
    RESEARCH_REPORT: "Research Report",
    COMPARISON_REPORT: "Comparison Report",
    WATCHLIST: "Watchlist",
    SETTINGS: "Settings",
    CUSTOM: "Custom Export",
  };

  return labels[type];
}