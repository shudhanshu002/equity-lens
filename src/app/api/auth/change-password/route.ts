import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { authOptions } from "@/lib/auth/auth-options";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),

    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters.")
      .regex(/[A-Z]/, "New password must contain at least one uppercase letter.")
      .regex(/[a-z]/, "New password must contain at least one lowercase letter.")
      .regex(/[0-9]/, "New password must contain at least one number."),

    confirmPassword: z.string().min(1, "Confirm password is required."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirm password do not match.",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password.",
    path: ["newPassword"],
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
    const parsed = changePasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            parsed.error.issues[0]?.message ??
            "Invalid change password input.",
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

    if (!user.passwordHash) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This account does not use password login. Use Google login or reset-password flow.",
        },
        {
          status: 400,
        }
      );
    }

    const validCurrentPassword = await verifyPassword(
      parsed.data.currentPassword,
      user.passwordHash
    );

    if (!validCurrentPassword) {
      return NextResponse.json(
        {
          success: false,
          error: "Current password is incorrect.",
        },
        {
          status: 401,
        }
      );
    }

    const newPasswordHash = await hashPassword(parsed.data.newPassword);

    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        passwordHash: newPasswordHash,
      },
    });

    await prisma.session.deleteMany({
      where: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Password changed successfully. Please login again.",
    });
  } catch (error) {
    console.error("Change password error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to change password.",
      },
      {
        status: 500,
      }
    );
  }
}