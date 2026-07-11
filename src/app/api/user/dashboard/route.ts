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
          error: "Unauthorized. Please login first.",
        },
        {
          status: 401,
        }
      );
    }

    const [
      profile,
      settings,
      watchlistCount,
      historyCount,
      researchCount,
      comparisonCount,
      exportCount,
      latestWatchlistItems,
      latestHistoryItems,
      latestExportItems,
      scoreAggregate,
    ] = await Promise.all([
      prisma.user.findUnique({
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
        },
      }),

      prisma.userSettings.findUnique({
        where: {
          userId: session.user.id,
        },
      }),

      prisma.userWatchlistItem.count({
        where: {
          userId: session.user.id,
        },
      }),

      prisma.userHistoryItem.count({
        where: {
          userId: session.user.id,
        },
      }),

      prisma.userHistoryItem.count({
        where: {
          userId: session.user.id,
          type: "RESEARCH",
        },
      }),

      prisma.userHistoryItem.count({
        where: {
          userId: session.user.id,
          type: "COMPARISON",
        },
      }),

      prisma.userExportItem.count({
        where: {
          userId: session.user.id,
        },
      }),

      prisma.userWatchlistItem.findMany({
        where: {
          userId: session.user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      }),

      prisma.userHistoryItem.findMany({
        where: {
          userId: session.user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      }),

      prisma.userExportItem.findMany({
        where: {
          userId: session.user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      }),

      prisma.userHistoryItem.aggregate({
        where: {
          userId: session.user.id,
          score: {
            not: null,
          },
        },
        _avg: {
          score: true,
        },
      }),
    ]);

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          error: "User profile not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        profile,
        settings,
        metrics: {
          watchlistCount,
          historyCount,
          researchCount,
          comparisonCount,
          exportCount,
          averageResearchScore: Math.round(scoreAggregate._avg.score ?? 0),
        },
        latest: {
          watchlistItems: latestWatchlistItems,
          historyItems: latestHistoryItems,
          exportItems: latestExportItems,
        },
      },
    });
  } catch (error) {
    console.error("Get user dashboard error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch dashboard data.",
      },
      {
        status: 500,
      }
    );
  }
}