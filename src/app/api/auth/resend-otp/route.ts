import { NextResponse } from "next/server";
import { OtpPurpose } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getZodErrorMessage, requestOtpSchema } from "@/lib/auth/validation";
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

    const parsed = requestOtpSchema.safeParse(body);

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

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "No account found with this email.",
        },
        {
          status: 404,
        }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json({
        success: true,
        message: "Email is already verified. You can login now.",
      });
    }

    await prisma.otpToken.updateMany({
      where: {
        email,
        purpose: OtpPurpose.EMAIL_VERIFICATION,
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
        purpose: OtpPurpose.EMAIL_VERIFICATION,
        expiresAt: createOtpExpiry(10),
        userId: user.id,
      },
    });

    const mailResult = await sendOtpEmail({
      email,
      otp,
      purpose: "EMAIL_VERIFICATION",
    });

    return NextResponse.json({
      success: true,
      message:
        mailResult.mode === "console"
          ? "New OTP generated. It is printed in your terminal because SMTP is not configured."
          : "New OTP sent successfully. Please check your email.",
      email,
      otpDeliveryMode: mailResult.mode,
    });
  } catch (error) {
    console.error("Resend OTP error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to resend OTP. Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}