import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
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

    const [
      totalUsers,
      verifiedUsers,
      adminUsers,
      passwordUsers,
      googleAccounts,
      totalWatchlistItems,
      totalHistoryItems,
      totalResearchItems,
      totalComparisonItems,
      totalExportItems,
      activeSessions,
      latestUsers,
      latestHistoryItems,
      latestExportItems,
      scoreAggregate,
    ] = await Promise.all([
      prisma.user.count(),

      prisma.user.count({
        where: {
          emailVerified: {
            not: null,
          },
        },
      }),

      prisma.user.count({
        where: {
          role: UserRole.ADMIN,
        },
      }),

      prisma.user.count({
        where: {
          passwordHash: {
            not: null,
          },
        },
      }),

      prisma.account.count({
        where: {
          provider: "google",
        },
      }),

      prisma.userWatchlistItem.count(),

      prisma.userHistoryItem.count(),

      prisma.userHistoryItem.count({
        where: {
          type: "RESEARCH",
        },
      }),

      prisma.userHistoryItem.count({
        where: {
          type: "COMPARISON",
        },
      }),

      prisma.userExportItem.count(),

      prisma.session.count(),

      prisma.user.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          _count: {
            select: {
              watchlistItems: true,
              historyItems: true,
              exportItems: true,
            },
          },
        },
      }),

      prisma.userHistoryItem.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
        select: {
          id: true,
          title: true,
          type: true,
          symbol: true,
          decision: true,
          score: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),

      prisma.userExportItem.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
        select: {
          id: true,
          title: true,
          type: true,
          format: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),

      prisma.userHistoryItem.aggregate({
        where: {
          score: {
            not: null,
          },
        },
        _avg: {
          score: true,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          verified: verifiedUsers,
          unverified: totalUsers - verifiedUsers,
          admins: adminUsers,
          normalUsers: totalUsers - adminUsers,
          passwordUsers,
          googleUsers: googleAccounts,
        },

        workspace: {
          watchlistItems: totalWatchlistItems,
          historyItems: totalHistoryItems,
          researchItems: totalResearchItems,
          comparisonItems: totalComparisonItems,
          exportItems: totalExportItems,
          activeSessions,
          averageResearchScore: Math.round(scoreAggregate._avg.score ?? 0),
        },

        latest: {
          users: latestUsers,
          historyItems: latestHistoryItems,
          exportItems: latestExportItems,
        },
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch admin stats.",
      },
      {
        status: 500,
      }
    );
  }
}