import { NextResponse } from "next/server";
import { HistoryItemType, Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { authOptions } from "@/lib/auth/auth-options";

const syncHistoryItemSchema = z.object({
  type: z.enum(["RESEARCH", "COMPARISON"]),

  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(180, "Title is too long."),

  subtitle: z.string().trim().max(260).optional().nullable(),

  symbol: z.string().trim().max(20).optional().nullable(),

  decision: z.string().trim().max(40).optional().nullable(),

  score: z.number().int().min(0).max(100).optional().nullable(),

  payload: z.unknown().optional(),

  createdAt: z.string().datetime().optional(),
});

const syncHistorySchema = z.object({
  items: z
    .array(syncHistoryItemSchema)
    .max(100, "You can sync up to 100 history items at once."),

  clearBeforeSync: z.boolean().optional().default(false),
});

export async function POST(request: Request) {
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
    const parsed = syncHistorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            parsed.error.issues[0]?.message ?? "Invalid history sync input.",
        },
        {
          status: 400,
        }
      );
    }

    const { items, clearBeforeSync } = parsed.data;

    if (clearBeforeSync) {
      await prisma.userHistoryItem.deleteMany({
        where: {
          userId: session.user.id,
        },
      });
    }

    const syncedItems = [];

    for (const item of items) {
      const existingItem = await prisma.userHistoryItem.findFirst({
        where: {
          userId: session.user.id,
          type:
            item.type === "RESEARCH"
              ? HistoryItemType.RESEARCH
              : HistoryItemType.COMPARISON,
          title: item.title,
          symbol: item.symbol ?? undefined,
        },
      });

      if (existingItem) {
        continue;
      }

      const createdItem = await prisma.userHistoryItem.create({
        data: {
          userId: session.user.id,
          type:
            item.type === "RESEARCH"
              ? HistoryItemType.RESEARCH
              : HistoryItemType.COMPARISON,
          title: item.title,
          subtitle: item.subtitle ?? undefined,
          symbol: item.symbol ?? undefined,
          decision: item.decision ?? undefined,
          score: item.score ?? undefined,
          payload: toJsonValue(item.payload),
          createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
        },
      });

      syncedItems.push(createdItem);
    }

    return NextResponse.json({
      success: true,
      message: "History synced successfully.",
      data: {
        syncedCount: syncedItems.length,
        skippedCount: items.length - syncedItems.length,
        items: syncedItems,
      },
    });
  } catch (error) {
    console.error("Sync history error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to sync history.",
      },
      {
        status: 500,
      }
    );
  }
}

function toJsonValue(value: unknown) {
  if (value === undefined) {
    return Prisma.JsonNull;
  }

  return value as Prisma.InputJsonValue;
}