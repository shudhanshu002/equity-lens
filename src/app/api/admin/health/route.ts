import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db/prisma";
import { authOptions } from "@/lib/auth/auth-options";

export async function GET() {
  const startedAt = Date.now();

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

    const checks = await runHealthChecks();

    const hasFailure = checks.some((check) => check.status === "DOWN");
    const hasWarning = checks.some((check) => check.status === "WARN");

    const overallStatus = hasFailure ? "DOWN" : hasWarning ? "WARN" : "UP";

    return NextResponse.json({
      success: true,
      data: {
        status: overallStatus,
        checkedAt: new Date().toISOString(),
        responseTimeMs: Date.now() - startedAt,
        checks,
        environment: {
          nodeEnv: process.env.NODE_ENV ?? "unknown",
          hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
          hasAuthSecret: Boolean(
            process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
          ),
          hasGoogleOAuth: Boolean(
            process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
          ),
          hasGoogleApiKey: Boolean(process.env.GOOGLE_API_KEY),
          hasAlphaVantageKey: Boolean(process.env.ALPHA_VANTAGE_API_KEY),
          hasFinnhubKey: Boolean(process.env.FINNHUB_API_KEY),
          hasSmtp: Boolean(
            process.env.SMTP_HOST &&
              process.env.SMTP_USER &&
              process.env.SMTP_PASS
          ),
          hasAdminSetupToken: Boolean(process.env.ADMIN_SETUP_TOKEN),
        },
      },
    });
  } catch (error) {
    console.error("Admin health error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to run admin health checks.",
        data: {
          status: "DOWN",
          checkedAt: new Date().toISOString(),
          responseTimeMs: Date.now() - startedAt,
        },
      },
      {
        status: 500,
      }
    );
  }
}

async function runHealthChecks() {
  const databaseStartedAt = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;

    const [
      usersCount,
      sessionsCount,
      historyCount,
      watchlistCount,
      exportsCount,
      otpCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.session.count(),
      prisma.userHistoryItem.count(),
      prisma.userWatchlistItem.count(),
      prisma.userExportItem.count(),
      prisma.otpToken.count(),
    ]);

    return [
      {
        name: "Database",
        status: "UP" as const,
        responseTimeMs: Date.now() - databaseStartedAt,
        message: "PostgreSQL connection is working.",
        metadata: {
          usersCount,
          sessionsCount,
          historyCount,
          watchlistCount,
          exportsCount,
          otpCount,
        },
      },

      {
        name: "Auth Secret",
        status: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
          ? ("UP" as const)
          : ("DOWN" as const),
        responseTimeMs: 0,
        message:
          process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
            ? "Auth secret is configured."
            : "AUTH_SECRET or NEXTAUTH_SECRET is missing.",
        metadata: {},
      },

      {
        name: "Google OAuth",
        status:
          process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
            ? ("UP" as const)
            : ("WARN" as const),
        responseTimeMs: 0,
        message:
          process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
            ? "Google OAuth login is configured."
            : "Google OAuth is not configured. Email/password login can still work.",
        metadata: {},
      },

      {
        name: "Gemini API",
        status: process.env.GOOGLE_API_KEY ? ("UP" as const) : ("WARN" as const),
        responseTimeMs: 0,
        message: process.env.GOOGLE_API_KEY
          ? "GOOGLE_API_KEY is configured."
          : "GOOGLE_API_KEY is missing. AI memo generation may fail.",
        metadata: {
          model: process.env.GOOGLE_MODEL ?? "gemini-2.5-flash",
        },
      },

      {
        name: "Alpha Vantage",
        status: process.env.ALPHA_VANTAGE_API_KEY
          ? ("UP" as const)
          : ("WARN" as const),
        responseTimeMs: 0,
        message: process.env.ALPHA_VANTAGE_API_KEY
          ? "ALPHA_VANTAGE_API_KEY is configured."
          : "ALPHA_VANTAGE_API_KEY is missing. Financial data may use fallback data.",
        metadata: {},
      },

      {
        name: "Finnhub",
        status: process.env.FINNHUB_API_KEY
          ? ("UP" as const)
          : ("WARN" as const),
        responseTimeMs: 0,
        message: process.env.FINNHUB_API_KEY
          ? "FINNHUB_API_KEY is configured."
          : "FINNHUB_API_KEY is missing. News may use mock fallback data.",
        metadata: {},
      },

      {
        name: "SMTP",
        status:
          process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
            ? ("UP" as const)
            : ("WARN" as const),
        responseTimeMs: 0,
        message:
          process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
            ? "SMTP is configured."
            : "SMTP is not configured. OTP will be logged in terminal during development.",
        metadata: {
          from: process.env.SMTP_FROM ?? null,
        },
      },
    ];
  } catch (error) {
    return [
      {
        name: "Database",
        status: "DOWN" as const,
        responseTimeMs: Date.now() - databaseStartedAt,
        message:
          error instanceof Error
            ? error.message
            : "Database health check failed.",
        metadata: {},
      },
    ];
  }
}