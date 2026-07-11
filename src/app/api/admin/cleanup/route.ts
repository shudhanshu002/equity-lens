import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { authOptions } from "@/lib/auth/auth-options";

const cleanupSchema = z.object({
  dryRun: z.boolean().optional().default(false),
  cleanupSessions: z.boolean().optional().default(true),
  cleanupOtpTokens: z.boolean().optional().default(true),
  usedOtpRetentionDays: z.number().int().min(1).max(90).optional().default(7),
});

export async function GET() {
  try {
    const adminCheck = await requireAdmin();

    if (adminCheck) {
      return adminCheck;
    }

    const now = new Date();
    const usedOtpCutoff = getDaysAgo(7);

    const [expiredSessions, expiredOtpTokens, usedOldOtpTokens] =
      await Promise.all([
        prisma.session.count({
          where: {
            expires: {
              lt: now,
            },
          },
        }),

        prisma.otpToken.count({
          where: {
            expiresAt: {
              lt: now,
            },
          },
        }),

        prisma.otpToken.count({
          where: {
            usedAt: {
              not: null,
            },
            createdAt: {
              lt: usedOtpCutoff,
            },
          },
        }),
      ]);

    return NextResponse.json({
      success: true,
      data: {
        candidates: {
          expiredSessions,
          expiredOtpTokens,
          usedOldOtpTokens,
          total: expiredSessions + expiredOtpTokens + usedOldOtpTokens,
        },
      },
    });
  } catch (error) {
    console.error("Admin cleanup preview error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to preview cleanup candidates.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    const adminCheck = await requireAdmin();

    if (adminCheck) {
      return adminCheck;
    }

    const body = await request.json().catch(() => ({}));
    const parsed = cleanupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            parsed.error.issues[0]?.message ?? "Invalid cleanup request.",
        },
        {
          status: 400,
        }
      );
    }

    const {
      dryRun,
      cleanupSessions,
      cleanupOtpTokens,
      usedOtpRetentionDays,
    } = parsed.data;

    const now = new Date();
    const usedOtpCutoff = getDaysAgo(usedOtpRetentionDays);

    const [expiredSessionsCount, expiredOtpTokensCount, usedOldOtpTokensCount] =
      await Promise.all([
        cleanupSessions
          ? prisma.session.count({
              where: {
                expires: {
                  lt: now,
                },
              },
            })
          : Promise.resolve(0),

        cleanupOtpTokens
          ? prisma.otpToken.count({
              where: {
                expiresAt: {
                  lt: now,
                },
              },
            })
          : Promise.resolve(0),

        cleanupOtpTokens
          ? prisma.otpToken.count({
              where: {
                usedAt: {
                  not: null,
                },
                createdAt: {
                  lt: usedOtpCutoff,
                },
              },
            })
          : Promise.resolve(0),
      ]);

    if (dryRun) {
      return NextResponse.json({
        success: true,
        message: "Cleanup dry run completed. No records were deleted.",
        data: {
          dryRun: true,
          deleted: {
            expiredSessions: 0,
            expiredOtpTokens: 0,
            usedOldOtpTokens: 0,
            total: 0,
          },
          candidates: {
            expiredSessions: expiredSessionsCount,
            expiredOtpTokens: expiredOtpTokensCount,
            usedOldOtpTokens: usedOldOtpTokensCount,
            total:
              expiredSessionsCount +
              expiredOtpTokensCount +
              usedOldOtpTokensCount,
          },
        },
      });
    }

    const [deletedSessions, deletedExpiredOtpTokens, deletedUsedOldOtpTokens] =
      await prisma.$transaction([
        cleanupSessions
          ? prisma.session.deleteMany({
              where: {
                expires: {
                  lt: now,
                },
              },
            })
          : prisma.session.deleteMany({
              where: {
                id: "__never_match__",
              },
            }),

        cleanupOtpTokens
          ? prisma.otpToken.deleteMany({
              where: {
                expiresAt: {
                  lt: now,
                },
              },
            })
          : prisma.otpToken.deleteMany({
              where: {
                id: "__never_match__",
              },
            }),

        cleanupOtpTokens
          ? prisma.otpToken.deleteMany({
              where: {
                usedAt: {
                  not: null,
                },
                createdAt: {
                  lt: usedOtpCutoff,
                },
              },
            })
          : prisma.otpToken.deleteMany({
              where: {
                id: "__never_match__",
              },
            }),
      ]);

    return NextResponse.json({
      success: true,
      message: "Cleanup completed successfully.",
      data: {
        dryRun: false,
        deleted: {
          expiredSessions: deletedSessions.count,
          expiredOtpTokens: deletedExpiredOtpTokens.count,
          usedOldOtpTokens: deletedUsedOldOtpTokens.count,
          total:
            deletedSessions.count +
            deletedExpiredOtpTokens.count +
            deletedUsedOldOtpTokens.count,
        },
        candidates: {
          expiredSessions: expiredSessionsCount,
          expiredOtpTokens: expiredOtpTokensCount,
          usedOldOtpTokens: usedOldOtpTokensCount,
          total:
            expiredSessionsCount +
            expiredOtpTokensCount +
            usedOldOtpTokensCount,
        },
      },
    });
  } catch (error) {
    console.error("Admin cleanup error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to run cleanup.",
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

function getDaysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}