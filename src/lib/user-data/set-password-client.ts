export type SetPasswordInput = {
  newPassword: string;
  confirmPassword: string;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
};

export async function setUserPassword(input: SetPasswordInput) {
  const response = await fetch("/api/auth/set-password", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = (await response.json()) as ApiResponse<null>;

  if (!response.ok || !data.success) {
    throw new Error(data.error ?? "Failed to set password.");
  }

  return data.message ?? "Password set successfully.";
}

export function canSetPassword(input: SetPasswordInput) {
  return (
    input.newPassword.length >= 8 &&
    /[A-Z]/.test(input.newPassword) &&
    /[a-z]/.test(input.newPassword) &&
    /[0-9]/.test(input.newPassword) &&
    input.newPassword === input.confirmPassword
  );
}