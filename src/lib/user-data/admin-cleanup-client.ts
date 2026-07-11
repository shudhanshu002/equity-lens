export type AdminCleanupCandidates = {
  expiredSessions: number;
  expiredOtpTokens: number;
  usedOldOtpTokens: number;
  total: number;
};

export type AdminCleanupDeleted = {
  expiredSessions: number;
  expiredOtpTokens: number;
  usedOldOtpTokens: number;
  total: number;
};

export type AdminCleanupPreviewResponse = {
  candidates: AdminCleanupCandidates;
};

export type AdminCleanupRunResponse = {
  dryRun: boolean;
  deleted: AdminCleanupDeleted;
  candidates: AdminCleanupCandidates;
};

export type AdminCleanupInput = {
  dryRun?: boolean;
  cleanupSessions?: boolean;
  cleanupOtpTokens?: boolean;
  usedOtpRetentionDays?: number;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
};

export async function getAdminCleanupPreview() {
  const response = await fetch("/api/admin/cleanup", {
    method: "GET",
    cache: "no-store",
  });

  const data = (await response.json()) as ApiResponse<AdminCleanupPreviewResponse>;

  if (!response.ok || !data.success || !data.data) {
    throw new Error(data.error ?? "Failed to fetch cleanup preview.");
  }

  return data.data;
}

export async function runAdminCleanup(input: AdminCleanupInput = {}) {
  const response = await fetch("/api/admin/cleanup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = (await response.json()) as ApiResponse<AdminCleanupRunResponse>;

  if (!response.ok || !data.success || !data.data) {
    throw new Error(data.error ?? "Failed to run admin cleanup.");
  }

  return {
    message: data.message ?? "Cleanup completed.",
    result: data.data,
  };
}

export function getCleanupTotalCandidates(
  preview: AdminCleanupPreviewResponse | null
) {
  if (!preview) return 0;

  return preview.candidates.total;
}

export function getCleanupRiskLabel(total: number) {
  if (total >= 100) return "High cleanup volume";
  if (total >= 25) return "Moderate cleanup volume";
  if (total > 0) return "Low cleanup volume";

  return "Clean";
}

export function getCleanupRiskStyle(total: number) {
  if (total >= 100) {
    return "border-red-400/20 bg-red-400/10 text-red-700 dark:text-red-300";
  }

  if (total >= 25) {
    return "border-amber-400/20 bg-amber-400/10 text-amber-700 dark:text-amber-300";
  }

  if (total > 0) {
    return "border-cyan-400/20 bg-cyan-400/10 text-cyan-700 dark:text-cyan-300";
  }

  return "border-emerald-400/20 bg-emerald-400/10 text-emerald-700 dark:text-emerald-300";
}