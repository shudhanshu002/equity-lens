export type PromoteSelfResponse = {
  id: string;
  name: string | null;
  email: string;
  role: "USER" | "ADMIN";
  emailVerified: string | null;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
};

export async function promoteSelfToAdmin(setupToken: string) {
  const response = await fetch("/api/admin/promote-self", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      setupToken,
    }),
  });

  const data = (await response.json()) as ApiResponse<PromoteSelfResponse>;

  if (!response.ok || !data.success || !data.data) {
    throw new Error(data.error ?? "Failed to promote account to admin.");
  }

  return {
    message: data.message ?? "Admin access enabled.",
    user: data.data,
  };
}