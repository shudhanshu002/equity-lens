import { NextResponse } from "next/server";
import { OtpPurpose } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  forgotPasswordSchema,
  getZodErrorMessage,
} from "@/lib/auth/validation";
import {
  createOtpExpiry,
  generateOtp,
  hashOtp,
  normalizeEmail,
} from "@/lib/auth/password";
import { sendOtpEmail } from "@/lib/auth/mail";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = forgotPasswordSchema.safeParse(body);

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

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    /*
      Security note:
      We do not reveal whether the email exists.
      This prevents account enumeration.
    */
    if (!user) {
      return NextResponse.json({
        success: true,
        message:
          "If an account exists with this email, a password reset OTP has been sent.",
      });
    }

    await prisma.otpToken.updateMany({
      where: {
        email,
        purpose: OtpPurpose.PASSWORD_RESET,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });

    const otp = generateOtp(6);
    const otpHash = await hashOtp(otp);

    await prisma.otpToken.create({
      data: {
        email,
        otpHash,
        purpose: OtpPurpose.PASSWORD_RESET,
        expiresAt: createOtpExpiry(10),
        userId: user.id,
      },
    });

    const mailResult = await sendOtpEmail({
      email,
      otp,
      purpose: "PASSWORD_RESET",
    });

    return NextResponse.json({
      success: true,
      message:
        mailResult.mode === "console"
          ? "Password reset OTP generated. It is printed in your terminal because SMTP is not configured."
          : "If an account exists with this email, a password reset OTP has been sent.",
      email,
      otpDeliveryMode: mailResult.mode,
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to request password reset. Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}