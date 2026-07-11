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
          status: 401 }
      );
    }

    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden. Admin access required.",
        },
        {
          status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);

    const limit = Number(searchParams.get("limit") ?? "30");

    const safeLimit =
      Number.isFinite(limit) && limit > 0 && limit <= 100 ? limit : 30;

    const [recentUsers, recentHistory, recentExports, recentWatchlist] =
      await Promise.all([
        prisma.user.findMany({
          orderBy: {
            createdAt: "desc",
          },
          take: safeLimit,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            emailVerified: true,
            createdAt: true,
          },
        }),

        prisma.userHistoryItem.findMany({
          orderBy: {
            createdAt: "desc",
          },
          take: safeLimit,
          select: {
            id: true,
            type: true,
            title: true,
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
          take: safeLimit,
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

        prisma.userWatchlistItem.findMany({
          orderBy: {
            createdAt: "desc",
          },
          take: safeLimit,
          select: {
            id: true,
            company: true,
            symbol: true,
            status: true,
            score: true,
            risk: true,
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
      ]);

    const auditEvents = [
      ...recentUsers.map((user) => ({
        id: `user:${user.id}`,
        category: "USER",
        action: "USER_CREATED",
        title: `New user registered: ${user.name ?? user.email}`,
        description: `${user.email} joined with role ${user.role}.`,
        createdAt: user.createdAt,
        actor: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        metadata: {
          role: user.role,
          emailVerified: Boolean(user.emailVerified),
        },
      })),

      ...recentHistory.map((item) => ({
        id: `history:${item.id}`,
        category: "HISTORY",
        action:
          item.type === "RESEARCH"
            ? "RESEARCH_SAVED"
            : "COMPARISON_SAVED",
        title: item.title,
        description: `${item.user.name ?? item.user.email} saved ${
          item.type === "RESEARCH" ? "a research report" : "a comparison report"
        }.`,
        createdAt: item.createdAt,
        actor: item.user,
        metadata: {
          type: item.type,
          symbol: item.symbol,
          decision: item.decision,
          score: item.score,
        },
      })),

      ...recentExports.map((item) => ({
        id: `export:${item.id}`,
        category: "EXPORT",
        action: "EXPORT_CREATED",
        title: item.title,
        description: `${item.user.name ?? item.user.email} created a ${
          item.format
        } export.`,
        createdAt: item.createdAt,
        actor: item.user,
        metadata: {
          type: item.type,
          format: item.format,
        },
      })),

      ...recentWatchlist.map((item) => ({
        id: `watchlist:${item.id}`,
        category: "WATCHLIST",
        action: "WATCHLIST_ITEM_CREATED",
        title: item.company,
        description: `${item.user.name ?? item.user.email} added ${
          item.company
        } to watchlist.`,
        createdAt: item.createdAt,
        actor: item.user,
        metadata: {
          symbol: item.symbol,
          status: item.status,
          score: item.score,
          risk: item.risk,
        },
      })),
    ]
      .sort(
        (first, second) =>
          new Date(second.createdAt).getTime() -
          new Date(first.createdAt).getTime()
      )
      .slice(0, safeLimit);

    return NextResponse.json({
      success: true,
      data: {
        events: auditEvents,
        count: auditEvents.length,
      },
    });
  } catch (error) {
    console.error("Admin audit error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch admin audit events.",
      },
      {
        status: 500 }
    );
  }
}