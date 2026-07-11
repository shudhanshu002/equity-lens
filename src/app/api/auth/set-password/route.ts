import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { authOptions } from "@/lib/auth/auth-options";
import { hashPassword } from "@/lib/auth/password";

const setPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
      .regex(/[0-9]/, "Password must contain at least one number."),

    confirmPassword: z.string().min(1, "Confirm password is required."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Password and confirm password do not match.",
    path: ["confirmPassword"],
  });

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized. Please login first.",
        },
        {
          status: 401,
        }
      );
    }

    const body = await request.json();
    const parsed = setPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            parsed.error.issues[0]?.message ?? "Invalid set password input.",
        },
        {
          status: 400,
        }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        passwordHash: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User account not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (user.passwordHash) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Password is already set for this account. Use change password instead.",
        },
        {
          status: 409,
        }
      );
    }

    const passwordHash = await hashPassword(parsed.data.newPassword);

    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        passwordHash,
        emailVerified: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Password set successfully. You can now login using email and password.",
    });
  } catch (error) {
    console.error("Set password error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to set password.",
      },
      {
        status: 500,
      }
    );
  }
}