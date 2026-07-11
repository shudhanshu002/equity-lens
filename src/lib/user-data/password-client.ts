export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
};

export async function changeUserPassword(input: ChangePasswordInput) {
  const response = await fetch("/api/auth/change-password", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = (await response.json()) as ApiResponse<null>;

  if (!response.ok || !data.success) {
    throw new Error(data.error ?? "Failed to change password.");
  }

  return data.message ?? "Password changed successfully.";
}

export function validatePasswordStrength(password: string) {
  const checks = {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const passedCount = Object.values(checks).filter(Boolean).length;

  return {
    checks,
    passedCount,
    valid: passedCount === Object.keys(checks).length,
  };
}

export function getPasswordStrengthLabel(password: string) {
  const strength = validatePasswordStrength(password);

  if (!password) return "Empty";
  if (strength.passedCount <= 1) return "Weak";
  if (strength.passedCount <= 3) return "Medium";

  return "Strong";
}

export function getPasswordStrengthPercentage(password: string) {
  const strength = validatePasswordStrength(password);

  return Math.round((strength.passedCount / 4) * 100);
}

export function passwordsMatch(password: string, confirmPassword: string) {
  return password.length > 0 && password === confirmPassword;
}