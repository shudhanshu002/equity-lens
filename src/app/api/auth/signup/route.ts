import { NextResponse } from "next/server";
import { OtpPurpose } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { signupSchema, getZodErrorMessage } from "@/lib/auth/validation";
import {
  createOtpExpiry,
  generateOtp,
  hashOtp,
  hashPassword,
  normalizeEmail,
} from "@/lib/auth/password";
import { sendOtpEmail } from "@/lib/auth/mail";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = signupSchema.safeParse(body);

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
    const name = parsed.data.name.trim();
    const passwordHash = await hashPassword(parsed.data.password);

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser?.emailVerified) {
      return NextResponse.json(
        {
          success: false,
          error: "An account with this email already exists. Please login.",
        },
        {
          status: 409,
        }
      );
    }

    const otp = generateOtp(6);
    const otpHash = await hashOtp(otp);

    const user = existingUser
      ? await prisma.user.update({
          where: {
            email,
          },
          data: {
            name,
            passwordHash,
            emailVerified: null,
          },
        })
      : await prisma.user.create({
          data: {
            name,
            email,
            passwordHash,
          },
        });

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

    return NextResponse.json(
      {
        success: true,
        message:
          mailResult.mode === "console"
            ? "Account created. OTP is printed in your terminal because SMTP is not configured."
            : "Account created. Please check your email for the verification OTP.",
        email,
        otpDeliveryMode: mailResult.mode,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Signup error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create account. Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}