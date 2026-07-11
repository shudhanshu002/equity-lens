import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db/prisma";
import { authOptions } from "@/lib/auth/auth-options";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
          error: "Not authenticated.",
          data: null,
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
        settings: true,
        _count: {
          select: {
            watchlistItems: true,
            historyItems: true,
            exportItems: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
          error: "User not found.",
          data: null,
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,

        auth: {
          hasPassword: Boolean(user.passwordHash),
          providers: user.accounts.map((account) => account.provider),
        },

        settings: user.settings,

        counts: {
          watchlistItems: user._count.watchlistItems,
          historyItems: user._count.historyItems,
          exportItems: user._count.exportItems,
        },
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return NextResponse.json(
      {
        success: false,
        authenticated: false,
        error: "Failed to fetch current user.",
        data: null,
      },
      {
        status: 500,
      }
    );
  }
}