import { NextResponse } from "next/server";
import { OtpPurpose } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  getZodErrorMessage,
  resetPasswordSchema,
} from "@/lib/auth/validation";
import {
  hashPassword,
  isExpired,
  normalizeEmail,
  verifyOtp,
} from "@/lib/auth/password";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: getZodErrorMessage(parsed.error),
        },
        {
          status: 400,
        }
      );
    }

    const email = normalizeEmail(parsed.data.email);
    const otp = parsed.data.otp.trim();
    const newPasswordHash = await hashPassword(parsed.data.newPassword);

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid reset request.",
        },
        {
          status: 400,
        }
      );
    }

    const otpToken = await prisma.otpToken.findFirst({
      where: {
        email,
        purpose: OtpPurpose.PASSWORD_RESET,
        usedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!otpToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Password reset OTP not found. Please request a new code.",
        },
        {
          status: 404,
        }
      );
    }

    if (isExpired(otpToken.expiresAt)) {
      return NextResponse.json(
        {
          success: false,
          error: "Password reset OTP has expired. Please request a new code.",
        },
        {
          status: 410,
        }
      );
    }

    const validOtp = await verifyOtp(otp, otpToken.otpHash);

    if (!validOtp) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid OTP. Please check the code and try again.",
        },
        {
          status: 401,
        }
      );
    }

    await prisma.$transaction([
      prisma.otpToken.update({
        where: {
          id: otpToken.id,
        },
        data: {
          usedAt: new Date(),
        },
      }),

      prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          passwordHash: newPasswordHash,
          emailVerified: user.emailVerified ?? new Date(),
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Password reset successfully. You can login now.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to reset password. Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}