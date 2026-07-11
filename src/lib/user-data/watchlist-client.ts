export type WatchlistStatus = "Research" | "Watchlist" | "High Conviction";
export type WatchlistRisk = "Low" | "Medium" | "High";

export type UserWatchlistItem = {
  id: string;
  userId: string;
  company: string;
  symbol: string | null;
  thesis: string | null;
  status: WatchlistStatus;
  score: number;
  risk: WatchlistRisk;
  createdAt: string;
  updatedAt: string;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
};

export type CreateWatchlistItemInput = {
  company: string;
  symbol?: string;
  thesis?: string;
  status?: WatchlistStatus;
  score?: number;
  risk?: WatchlistRisk;
};

export type UpdateWatchlistItemInput = Partial<CreateWatchlistItemInput> & {
  id: string;
};

export async function getUserWatchlist() {
  const response = await fetch("/api/user/watchlist", {
    method: "GET",
    cache: "no-store",
  });

  const data = (await response.json()) as ApiResponse<UserWatchlistItem[]>;

  if (!response.ok || !data.success || !data.data) {
    throw new Error(data.error ?? "Failed to fetch watchlist.");
  }

  return data.data;
}

export async function addUserWatchlistItem(input: CreateWatchlistItemInput) {
  const response = await fetch("/api/user/watchlist", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = (await response.json()) as ApiResponse<UserWatchlistItem>;

  if (!response.ok || !data.success || !data.data) {
    throw new Error(data.error ?? "Failed to add company to watchlist.");
  }

  return data.data;
}

export async function updateUserWatchlistItem(input: UpdateWatchlistItemInput) {
  const response = await fetch("/api/user/watchlist", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = (await response.json()) as ApiResponse<UserWatchlistItem>;

  if (!response.ok || !data.success || !data.data) {
    throw new Error(data.error ?? "Failed to update watchlist item.");
  }

  return data.data;
}

export async function deleteUserWatchlistItem(id: string) {
  const response = await fetch(`/api/user/watchlist?id=${id}`, {
    method: "DELETE",
  });

  const data = (await response.json()) as ApiResponse<null>;

  if (!response.ok || !data.success) {
    throw new Error(data.error ?? "Failed to delete watchlist item.");
  }

  return data.message ?? "Watchlist item deleted.";
}

export function mapCompanyToSymbol(company: string) {
  const commonSymbols: Record<string, string> = {
    apple: "AAPL",
    microsoft: "MSFT",
    nvidia: "NVDA",
    tesla: "TSLA",
    netflix: "NFLX",
    amazon: "AMZN",
    meta: "META",
    google: "GOOGL",
    alphabet: "GOOGL",
    reliance: "RELIANCE",
  };

  const normalized = company.trim().toLowerCase();

  return commonSymbols[normalized] ?? company.trim().slice(0, 4).toUpperCase();
}

export function createDefaultWatchlistItem(
  company: string
): CreateWatchlistItemInput {
  return {
    company,
    symbol: mapCompanyToSymbol(company),
    thesis:
      "Added manually. Run research to generate a full AI investment memo.",
    status: "Research",
    score: 50,
    risk: "Medium",
  };
}