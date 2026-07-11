import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db/prisma";
import { authOptions } from "@/lib/auth/auth-options";

type ExportScope = "users" | "history" | "watchlist" | "exports" | "all";
type ExportFormat = "json" | "csv";

export async function GET(request: Request) {
  try {
    const adminCheck = await requireAdmin();

    if (adminCheck) {
      return adminCheck;
    }

    const { searchParams } = new URL(request.url);

    const scope = parseScope(searchParams.get("scope"));
    const format = parseFormat(searchParams.get("format"));
    const limit = parseLimit(searchParams.get("limit"));

    const data = await buildExportData(scope, limit);

    if (format === "csv") {
      const csv = buildCsvExport(scope, data);

      return new Response(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="equitylens-admin-${scope}-${Date.now()}.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        scope,
        format,
        exportedAt: new Date().toISOString(),
        limit,
        ...data,
      },
    });
  } catch (error) {
    console.error("Admin export error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to export admin data.",
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

async function buildExportData(scope: ExportScope, limit: number) {
  const shouldExportUsers = scope === "users" || scope === "all";
  const shouldExportHistory = scope === "history" || scope === "all";
  const shouldExportWatchlist = scope === "watchlist" || scope === "all";
  const shouldExportExports = scope === "exports" || scope === "all";

  const [users, historyItems, watchlistItems, exportItems] = await Promise.all([
    shouldExportUsers
      ? prisma.user.findMany({
          orderBy: {
            createdAt: "desc",
          },
          take: limit,
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
        })
      : Promise.resolve([]),

    shouldExportHistory
      ? prisma.userHistoryItem.findMany({
          orderBy: {
            createdAt: "desc",
          },
          take: limit,
          select: {
            id: true,
            type: true,
            title: true,
            subtitle: true,
            symbol: true,
            decision: true,
            score: true,
            createdAt: true,
            updatedAt: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        })
      : Promise.resolve([]),

    shouldExportWatchlist
      ? prisma.userWatchlistItem.findMany({
          orderBy: {
            createdAt: "desc",
          },
          take: limit,
          select: {
            id: true,
            company: true,
            symbol: true,
            thesis: true,
            status: true,
            score: true,
            risk: true,
            createdAt: true,
            updatedAt: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        })
      : Promise.resolve([]),

    shouldExportExports
      ? prisma.userExportItem.findMany({
          orderBy: {
            createdAt: "desc",
          },
          take: limit,
          select: {
            id: true,
            title: true,
            type: true,
            format: true,
            description: true,
            createdAt: true,
            updatedAt: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        })
      : Promise.resolve([]),
  ]);

  return {
    counts: {
      users: users.length,
      historyItems: historyItems.length,
      watchlistItems: watchlistItems.length,
      exportItems: exportItems.length,
      total:
        users.length +
        historyItems.length +
        watchlistItems.length +
        exportItems.length,
    },

    users: users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      emailVerified: user.emailVerified,
      providers: user.accounts.map((account) => account.provider),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      counts: {
        watchlistItems: user._count.watchlistItems,
        historyItems: user._count.historyItems,
        exportItems: user._count.exportItems,
        sessions: user._count.sessions,
      },
    })),

    historyItems,
    watchlistItems,
    exportItems,
  };
}

function buildCsvExport(
  scope: ExportScope,
  data: Awaited<ReturnType<typeof buildExportData>>
) {
  if (scope === "users") {
    return rowsToCsv(
      [
        "id",
        "name",
        "email",
        "role",
        "emailVerified",
        "providers",
        "watchlistItems",
        "historyItems",
        "exportItems",
        "sessions",
        "createdAt",
      ],
      data.users.map((user) => [
        user.id,
        user.name ?? "",
        user.email,
        user.role,
        user.emailVerified ? "true" : "false",
        user.providers.join("|"),
        user.counts.watchlistItems,
        user.counts.historyItems,
        user.counts.exportItems,
        user.counts.sessions,
        user.createdAt,
      ])
    );
  }

  if (scope === "history") {
    return rowsToCsv(
      [
        "id",
        "userEmail",
        "type",
        "title",
        "symbol",
        "decision",
        "score",
        "createdAt",
      ],
      data.historyItems.map((item) => [
        item.id,
        item.user.email,
        item.type,
        item.title,
        item.symbol ?? "",
        item.decision ?? "",
        item.score ?? "",
        item.createdAt,
      ])
    );
  }

  if (scope === "watchlist") {
    return rowsToCsv(
      [
        "id",
        "userEmail",
        "company",
        "symbol",
        "status",
        "score",
        "risk",
        "createdAt",
      ],
      data.watchlistItems.map((item) => [
        item.id,
        item.user.email,
        item.company,
        item.symbol ?? "",
        item.status,
        item.score,
        item.risk,
        item.createdAt,
      ])
    );
  }

  if (scope === "exports") {
    return rowsToCsv(
      ["id", "userEmail", "title", "type", "format", "description", "createdAt"],
      data.exportItems.map((item) => [
        item.id,
        item.user.email,
        item.title,
        item.type,
        item.format,
        item.description ?? "",
        item.createdAt,
      ])
    );
  }

  return rowsToCsv(
    ["section", "id", "userEmail", "title", "type", "score", "createdAt"],
    [
      ...data.users.map((user) => [
        "users",
        user.id,
        user.email,
        user.name ?? user.email,
        user.role,
        "",
        user.createdAt,
      ]),

      ...data.historyItems.map((item) => [
        "history",
        item.id,
        item.user.email,
        item.title,
        item.type,
        item.score ?? "",
        item.createdAt,
      ]),

      ...data.watchlistItems.map((item) => [
        "watchlist",
        item.id,
        item.user.email,
        item.company,
        item.status,
        item.score,
        item.createdAt,
      ]),

      ...data.exportItems.map((item) => [
        "exports",
        item.id,
        item.user.email,
        item.title,
        item.type,
        "",
        item.createdAt,
      ]),
    ]
  );
}

function rowsToCsv(headers: string[], rows: unknown[][]) {
  return [
    headers.map(escapeCsvValue).join(","),
    ...rows.map((row) => row.map(escapeCsvValue).join(",")),
  ].join("\n");
}

function escapeCsvValue(value: unknown) {
  const normalized =
    value instanceof Date ? value.toISOString() : String(value ?? "");

  const escaped = normalized.replaceAll('"', '""');

  return `"${escaped}"`;
}

function parseScope(value: string | null): ExportScope {
  if (
    value === "users" ||
    value === "history" ||
    value === "watchlist" ||
    value === "exports" ||
    value === "all"
  ) {
    return value;
  }

  return "all";
}

function parseFormat(value: string | null): ExportFormat {
  if (value === "csv" || value === "json") {
    return value;
  }

  return "json";
}

function parseLimit(value: string | null) {
  const parsed = Number(value ?? "100");

  if (!Number.isFinite(parsed)) {
    return 100;
  }

  return Math.min(Math.max(parsed, 1), 1000);
}