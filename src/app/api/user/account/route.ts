import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { authOptions } from "@/lib/auth/auth-options";
import { verifyPassword } from "@/lib/auth/password";

const deleteAccountSchema = z.object({
  password: z.string().optional(),
  confirmation: z.literal("DELETE_MY_ACCOUNT"),
});

export async function GET() {
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

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        passwordHash: true,
        accounts: {
          select: {
            provider: true,
            type: true,
          },
        },
        _count: {
          select: {
            watchlistItems: true,
            historyItems: true,
            exportItems: true,
            otpTokens: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Account not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        security: {
          hasPassword: Boolean(user.passwordHash),
          providers: user.accounts.map((account) => account.provider),
        },
        usage: {
          watchlistItems: user._count.watchlistItems,
          historyItems: user._count.historyItems,
          exportItems: user._count.exportItems,
          otpTokens: user._count.otpTokens,
        },
      },
    });
  } catch (error) {
    console.error("Get account error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch account details.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(request: Request) {
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
    const parsed = deleteAccountSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            parsed.error.issues[0]?.message ??
            "Invalid account deletion request.",
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
          error: "Account not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (user.passwordHash) {
      if (!parsed.data.password) {
        return NextResponse.json(
          {
            success: false,
            error: "Password is required to delete this account.",
          },
          {
            status: 400,
          }
        );
      }

      const validPassword = await verifyPassword(
        parsed.data.password,
        user.passwordHash
      );

      if (!validPassword) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid password.",
          },
          {
            status: 401,
          }
        );
      }
    }

    await prisma.user.delete({
      where: {
        id: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully.",
    });
  } catch (error) {
    console.error("Delete account error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete account.",
      },
      {
        status: 500,
      }
    );
  }
}