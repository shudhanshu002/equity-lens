import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db/prisma";
import { authOptions } from "@/lib/auth/auth-options";

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim();
    const role = searchParams.get("role");
    const page = Number(searchParams.get("page") ?? "1");
    const limit = Number(searchParams.get("limit") ?? "20");

    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    const safeLimit =
      Number.isFinite(limit) && limit > 0 && limit <= 100 ? limit : 20;

    const where = {
      ...(search
        ? {
            OR: [
              {
                name: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                email: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {}),

      ...(role === "USER" || role === "ADMIN"
        ? {
            role: role as UserRole,
          }
        : {}),
    };

    const [users, totalUsers] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
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
          _count: {
            select: {
              watchlistItems: true,
              historyItems: true,
              exportItems: true,
              sessions: true,
            },
          },
        },
      }),

      prisma.user.count({
        where,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        users: users.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          providers: user.accounts.map((account) => account.provider),
          counts: {
            watchlistItems: user._count.watchlistItems,
            historyItems: user._count.historyItems,
            exportItems: user._count.exportItems,
            sessions: user._count.sessions,
          },
        })),

        pagination: {
          page: safePage,
          limit: safeLimit,
          totalUsers,
          totalPages: Math.ceil(totalUsers / safeLimit),
        },
      },
    });
  } catch (error) {
    console.error("Admin users fetch error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch users.",
      },
      {
        status: 500,
      }
    );
  }
}