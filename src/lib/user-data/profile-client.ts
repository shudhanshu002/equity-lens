export type UserRole = "USER" | "ADMIN";

export type UserProfile = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: UserRole;
  emailVerified: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpdateUserProfileInput = {
  name: string;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
};

export async function getUserProfile() {
  const response = await fetch("/api/user/profile", {
    method: "GET",
    cache: "no-store",
  });

  const data = (await response.json()) as ApiResponse<UserProfile>;

  if (!response.ok || !data.success || !data.data) {
    throw new Error(data.error ?? "Failed to fetch user profile.");
  }

  return data.data;
}

export async function updateUserProfile(input: UpdateUserProfileInput) {
  const response = await fetch("/api/user/profile", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = (await response.json()) as ApiResponse<UserProfile>;

  if (!response.ok || !data.success || !data.data) {
    throw new Error(data.error ?? "Failed to update user profile.");
  }

  return data.data;
}

export function getProfileDisplayName(profile: UserProfile | null) {
  if (!profile) return "Investor";

  if (profile.name?.trim()) {
    return profile.name.trim();
  }

  return profile.email.split("@")[0] ?? "Investor";
}

export function getProfileInitials(profile: UserProfile | null) {
  const displayName = getProfileDisplayName(profile);

  const parts = displayName
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return displayName.slice(0, 2).toUpperCase();
}

export function isEmailVerified(profile: UserProfile | null) {
  return Boolean(profile?.emailVerified);
}

export function formatProfileDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(new Date(value));
}