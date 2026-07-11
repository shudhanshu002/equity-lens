export type AccountProvider = "google" | "credentials" | string;

export type UserAccountDetails = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: "USER" | "ADMIN";
  emailVerified: string | null;
  createdAt: string;
  updatedAt: string;

  security: {
    hasPassword: boolean;
    providers: AccountProvider[];
  };

  usage: {
    watchlistItems: number;
    historyItems: number;
    exportItems: number;
    otpTokens: number;
  };
};

export type DeleteAccountInput = {
  password?: string;
  confirmation: "DELETE_MY_ACCOUNT";
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
};

export async function getUserAccountDetails() {
  const response = await fetch("/api/user/account", {
    method: "GET",
    cache: "no-store",
  });

  const data = (await response.json()) as ApiResponse<UserAccountDetails>;

  if (!response.ok || !data.success || !data.data) {
    throw new Error(data.error ?? "Failed to fetch account details.");
  }

  return data.data;
}

export async function deleteUserAccount(input: DeleteAccountInput) {
  const response = await fetch("/api/user/account", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = (await response.json()) as ApiResponse<null>;

  if (!response.ok || !data.success) {
    throw new Error(data.error ?? "Failed to delete account.");
  }

  return data.message ?? "Account deleted successfully.";
}

export function hasGoogleProvider(account: UserAccountDetails | null) {
  return Boolean(account?.security.providers.includes("google"));
}

export function hasPasswordProvider(account: UserAccountDetails | null) {
  return Boolean(account?.security.hasPassword);
}

export function getConnectedProviderLabel(account: UserAccountDetails | null) {
  if (!account) return "Not connected";

  const providers = account.security.providers;

  if (account.security.hasPassword && providers.includes("google")) {
    return "Email + Google";
  }

  if (providers.includes("google")) {
    return "Google";
  }

  if (account.security.hasPassword) {
    return "Email Password";
  }

  return providers.length > 0 ? providers.join(", ") : "Unknown";
}

export function getAccountUsageTotal(account: UserAccountDetails | null) {
  if (!account) return 0;

  return (
    account.usage.watchlistItems +
    account.usage.historyItems +
    account.usage.exportItems
  );
}

export function formatAccountDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}