export type AdminExportScope =
  | "users"
  | "history"
  | "watchlist"
  | "exports"
  | "all";

export type AdminExportFormat = "json" | "csv";

export type AdminExportOptions = {
  scope: AdminExportScope;
  format: AdminExportFormat;
  limit: number;
};

export type AdminExportCounts = {
  users: number;
  historyItems: number;
  watchlistItems: number;
  exportItems: number;
  total: number;
};

export type AdminExportData = {
  scope: AdminExportScope;
  format: AdminExportFormat;
  exportedAt: string;
  limit: number;
  counts: AdminExportCounts;
  users: unknown[];
  historyItems: unknown[];
  watchlistItems: unknown[];
  exportItems: unknown[];
};

type ApiResponse<T> = {
  success: boolean;
  error?: string;
  data?: T;
};

export async function getAdminExportJson(options: {
  scope: AdminExportScope;
  limit: number;
}) {
  const url = buildAdminExportUrl({
    scope: options.scope,
    format: "json",
    limit: options.limit,
  });

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  const data = (await response.json()) as ApiResponse<AdminExportData>;

  if (!response.ok || !data.success || !data.data) {
    throw new Error(data.error ?? "Failed to export admin data.");
  }

  return data.data;
}

export async function downloadAdminExport(options: AdminExportOptions) {
  const url = buildAdminExportUrl(options);

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    const contentType = response.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const data = (await response.json()) as ApiResponse<unknown>;
      throw new Error(data.error ?? "Failed to download admin export.");
    }

    throw new Error("Failed to download admin export.");
  }

  if (options.format === "json") {
    const data = (await response.json()) as ApiResponse<AdminExportData>;

    if (!data.success || !data.data) {
      throw new Error(data.error ?? "Failed to export admin data.");
    }

    const jsonBlob = new Blob([JSON.stringify(data.data, null, 2)], {
      type: "application/json",
    });

    downloadBlob(
      jsonBlob,
      `equitylens-admin-${options.scope}-${Date.now()}.json`
    );

    return {
      filename: `equitylens-admin-${options.scope}.json`,
      count: data.data.counts.total,
    };
  }

  const csvBlob = await response.blob();

  downloadBlob(csvBlob, `equitylens-admin-${options.scope}-${Date.now()}.csv`);

  return {
    filename: `equitylens-admin-${options.scope}.csv`,
    count: null,
  };
}

export function buildAdminExportUrl(options: AdminExportOptions) {
  const params = new URLSearchParams();

  params.set("scope", options.scope);
  params.set("format", options.format);
  params.set("limit", String(options.limit));

  return `/api/admin/export?${params.toString()}`;
}

export function getAdminExportScopeLabel(scope: AdminExportScope) {
  const labels: Record<AdminExportScope, string> = {
    users: "Users",
    history: "Research History",
    watchlist: "Watchlist",
    exports: "Exports",
    all: "Everything",
  };

  return labels[scope];
}

export function getAdminExportFormatLabel(format: AdminExportFormat) {
  const labels: Record<AdminExportFormat, string> = {
    json: "JSON",
    csv: "CSV",
  };

  return labels[format];
}

export function getAdminExportScopeDescription(scope: AdminExportScope) {
  const descriptions: Record<AdminExportScope, string> = {
    users: "User accounts, roles, providers, and workspace counts.",
    history: "Saved research and comparison records.",
    watchlist: "Companies saved by users in their watchlists.",
    exports: "Export records created by users.",
    all: "Combined users, history, watchlist, and export records.",
  };

  return descriptions[scope];
}

export function formatAdminExportDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function downloadBlob(blob: Blob, filename: string) {
  const objectUrl = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(objectUrl);
}