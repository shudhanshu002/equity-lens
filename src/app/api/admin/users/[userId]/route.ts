import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { authOptions } from "@/lib/auth/auth-options";

type RouteContext = {
  params: Promise<{
    userId: string;
  }>;
};

const updateUserSchema = z.object({
  name: z
    .string()
    .trim()
    .max(80, "Name is too long.")
    .nullable()
    .optional(),

  role: z.enum(["USER", "ADMIN"]).optional(),

  emailVerified: z.boolean().optional(),
});

export async function GET(_request: Request, context: RouteContext) {
  try {
    const adminCheck = await requireAdmin();

    if (adminCheck) {
      return adminCheck;
    }

    const { userId } = await context.params;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
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

        accounts: {
          select: {
            provider: true,
            type: true,
          },
        },

        settings: true,

        watchlistItems: {
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },

        historyItems: {
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },

        exportItems: {
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },

        _count: {
          select: {
            watchlistItems: true,
            historyItems: true,
            exportItems: true,
            sessions: true,
            accounts: true,
            otpTokens: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        providers: user.accounts.map((account) => account.provider),
        counts: {
          watchlistItems: user._count.watchlistItems,
          historyItems: user._count.historyItems,
          exportItems: user._count.exportItems,
          sessions: user._count.sessions,
          accounts: user._count.accounts,
          otpTokens: user._count.otpTokens,
        },
      },
    });
  } catch (error) {
    console.error("Admin get user error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch user.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const adminCheck = await requireAdmin();

    if (adminCheck) {
      return adminCheck;
    }

    const { userId } = await context.params;

    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message ?? "Invalid user update.",
        },
        {
          status: 400,
        }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found.",
        },
        {
          status: 404,
        }
      );
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...(parsed.data.name !== undefined
          ? {
              name: parsed.data.name,
            }
          : {}),

        ...(parsed.data.role
          ? {
              role:
                parsed.data.role === "ADMIN" ? UserRole.ADMIN : UserRole.USER,
            }
          : {}),

        ...(parsed.data.emailVerified !== undefined
          ? {
              emailVerified: parsed.data.emailVerified ? new Date() : null,
            }
          : {}),
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
      },
    });

    return NextResponse.json({
      success: true,
      message: "User updated successfully.",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Admin update user error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update user.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
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

    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden. Admin access required.",
        },
        {
          status: 403,
        }
      );
    }

    const { userId } = await context.params;

    if (session.user.id === userId) {
      return NextResponse.json(
        {
          success: false,
          error: "You cannot delete your own admin account.",
        },
        {
          status: 400,
        }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found.",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error) {
    console.error("Admin delete user error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete user.",
      },
      {
        status: 500,
      }
    );
  }
}

async function requireAdmin() {
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

  if (session.user.role !== UserRole.ADMIN) {
    return NextResponse.json(
      {
        success: false,
        error: "Forbidden. Admin access required.",
      },
      {
        status: 403,
      }
    );
  }

  return null;
}