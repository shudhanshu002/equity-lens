import { NextResponse } from "next/server";
import { OtpPurpose } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getZodErrorMessage, verifyOtpSchema } from "@/lib/auth/validation";
import { isExpired, normalizeEmail, verifyOtp } from "@/lib/auth/password";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = verifyOtpSchema.safeParse(body);

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

    const otpToken = await prisma.otpToken.findFirst({
      where: {
        email,
        purpose: OtpPurpose.EMAIL_VERIFICATION,
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
          error: "OTP not found. Please request a new verification code.",
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
          error: "OTP has expired. Please request a new verification code.",
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
          emailVerified: new Date(),
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Email verified successfully. You can login now.",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to verify OTP. Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}