export type AdminHealthStatus = "UP" | "WARN" | "DOWN";

export type AdminHealthCheck = {
  name: string;
  status: AdminHealthStatus;
  responseTimeMs: number;
  message: string;
  metadata: Record<string, unknown>;
};

export type AdminHealthEnvironment = {
  nodeEnv: string;
  hasDatabaseUrl: boolean;
  hasAuthSecret: boolean;
  hasGoogleOAuth: boolean;
  hasGoogleApiKey: boolean;
  hasAlphaVantageKey: boolean;
  hasFinnhubKey: boolean;
  hasSmtp: boolean;
  hasAdminSetupToken: boolean;
};

export type AdminHealthData = {
  status: AdminHealthStatus;
  checkedAt: string;
  responseTimeMs: number;
  checks: AdminHealthCheck[];
  environment: AdminHealthEnvironment;
};

type ApiResponse<T> = {
  success: boolean;
  error?: string;
  data?: T;
};

export async function getAdminHealth() {
  const response = await fetch("/api/admin/health", {
    method: "GET",
    cache: "no-store",
  });

  const data = (await response.json()) as ApiResponse<AdminHealthData>;

  if (!response.ok || !data.success || !data.data) {
    throw new Error(data.error ?? "Failed to fetch admin health.");
  }

  return data.data;
}

export function getAdminHealthStatusLabel(status: AdminHealthStatus) {
  const labels: Record<AdminHealthStatus, string> = {
    UP: "Healthy",
    WARN: "Warning",
    DOWN: "Down",
  };

  return labels[status];
}

export function getAdminHealthStatusStyle(status: AdminHealthStatus) {
  const styles: Record<AdminHealthStatus, string> = {
    UP: "border-emerald-400/20 bg-emerald-400/10 text-emerald-700 dark:text-emerald-300",
    WARN: "border-amber-400/20 bg-amber-400/10 text-amber-700 dark:text-amber-300",
    DOWN: "border-red-400/20 bg-red-400/10 text-red-700 dark:text-red-300",
  };

  return styles[status];
}

export function getAdminHealthDotStyle(status: AdminHealthStatus) {
  const styles: Record<AdminHealthStatus, string> = {
    UP: "bg-emerald-500",
    WARN: "bg-amber-500",
    DOWN: "bg-red-500",
  };

  return styles[status];
}

export function getAdminHealthSummary(data: AdminHealthData | null) {
  if (!data) {
    return {
      total: 0,
      up: 0,
      warn: 0,
      down: 0,
    };
  }

  return {
    total: data.checks.length,
    up: data.checks.filter((check) => check.status === "UP").length,
    warn: data.checks.filter((check) => check.status === "WARN").length,
    down: data.checks.filter((check) => check.status === "DOWN").length,
  };
}

export function formatAdminHealthDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatAdminHealthMetadataValue(value: unknown) {
  if (value === null || value === undefined) return "-";

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}