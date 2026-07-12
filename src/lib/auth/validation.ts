import { z } from "zod";

export const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(80, "Name must be less than 80 characters."),

  email: z
    .string()
    .trim()
    .email("Please enter a valid email address.")
    .max(120, "Email must be less than 120 characters."),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(100, "Password must be less than 100 characters.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
    .regex(/[0-9]/, "Password must contain at least one number."),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address.")
    .max(120, "Email must be less than 120 characters."),

  password: z
    .string()
    .min(1, "Password is required.")
    .max(100, "Password must be less than 100 characters."),
});

export const requestOtpSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address.")
    .max(120, "Email must be less than 120 characters."),
});

export const verifyOtpSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address.")
    .max(120, "Email must be less than 120 characters."),

  otp: z
    .string()
    .trim()
    .length(6, "OTP must be 6 digits.")
    .regex(/^[0-9]+$/, "OTP must contain only numbers."),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address.")
    .max(120, "Email must be less than 120 characters."),
});

export const resetPasswordSchema = z.preprocess(
  (data: any) => {
    if (data && typeof data === "object") {
      if (data.password && !data.newPassword) {
        return {
          ...data,
          newPassword: data.password,
        };
      }
    }
    return data;
  },
  z.object({
    email: z
      .string()
      .trim()
      .email("Please enter a valid email address.")
      .max(120, "Email must be less than 120 characters."),

    otp: z
      .string()
      .trim()
      .length(6, "OTP must be 6 digits.")
      .regex(/^[0-9]+$/, "OTP must contain only numbers."),

    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(100, "Password must be less than 100 characters.")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
      .regex(/[0-9]/, "Password must contain at least one number."),
  })
);

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RequestOtpInput = z.infer<typeof requestOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export function getZodErrorMessage(error: unknown) {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? "Invalid input.";
  }

  return "Invalid input.";
}