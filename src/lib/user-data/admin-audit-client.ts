export type AdminAuditCategory =
  | "USER"
  | "HISTORY"
  | "EXPORT"
  | "WATCHLIST";

export type AdminAuditAction =
  | "USER_CREATED"
  | "RESEARCH_SAVED"
  | "COMPARISON_SAVED"
  | "EXPORT_CREATED"
  | "WATCHLIST_ITEM_CREATED";

export type AdminAuditActor = {
  id: string;
  name: string | null;
  email: string;
};

export type AdminAuditEvent = {
  id: string;
  category: AdminAuditCategory;
  action: AdminAuditAction;
  title: string;
  description: string;
  createdAt: string;
  actor: AdminAuditActor;
  metadata: Record<string, unknown>;
};

export type AdminAuditResponse = {
  events: AdminAuditEvent[];
  count: number;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
};

export async function getAdminAuditEvents(limit = 30) {
  const params = new URLSearchParams();

  params.set("limit", String(limit));

  const response = await fetch(`/api/admin/audit?${params.toString()}`, {
    method: "GET",
    cache: "no-store",
  });

  const data = (await response.json()) as ApiResponse<AdminAuditResponse>;

  if (!response.ok || !data.success || !data.data) {
    throw new Error(data.error ?? "Failed to fetch admin audit events.");
  }

  return data.data;
}

export function getAdminAuditActorName(actor: AdminAuditActor) {
  if (actor.name?.trim()) {
    return actor.name.trim();
  }

  return actor.email.split("@")[0] ?? "User";
}

export function getAdminAuditCategoryLabel(category: AdminAuditCategory) {
  const labels: Record<AdminAuditCategory, string> = {
    USER: "User",
    HISTORY: "Research",
    EXPORT: "Export",
    WATCHLIST: "Watchlist",
  };

  return labels[category];
}

export function getAdminAuditActionLabel(action: AdminAuditAction) {
  const labels: Record<AdminAuditAction, string> = {
    USER_CREATED: "User registered",
    RESEARCH_SAVED: "Research saved",
    COMPARISON_SAVED: "Comparison saved",
    EXPORT_CREATED: "Export created",
    WATCHLIST_ITEM_CREATED: "Watchlist item added",
  };

  return labels[action];
}

export function getAdminAuditCategoryStyle(category: AdminAuditCategory) {
  const styles: Record<AdminAuditCategory, string> = {
    USER: "border-cyan-400/20 bg-cyan-400/10 text-cyan-700 dark:text-cyan-300",
    HISTORY:
      "border-emerald-400/20 bg-emerald-400/10 text-emerald-700 dark:text-emerald-300",
    EXPORT:
      "border-violet-400/20 bg-violet-400/10 text-violet-700 dark:text-violet-300",
    WATCHLIST:
      "border-amber-400/20 bg-amber-400/10 text-amber-700 dark:text-amber-300",
  };

  return styles[category];
}

export function formatAdminAuditDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function sortAdminAuditEvents(events: AdminAuditEvent[]) {
  return [...events].sort(
    (first, second) =>
      new Date(second.createdAt).getTime() -
      new Date(first.createdAt).getTime()
  );
}