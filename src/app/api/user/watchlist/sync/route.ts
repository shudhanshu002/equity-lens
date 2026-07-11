import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { authOptions } from "@/lib/auth/auth-options";

const syncWatchlistItemSchema = z.object({
  company: z
    .string()
    .trim()
    .min(1, "Company is required.")
    .max(120, "Company name is too long."),

  symbol: z.string().trim().max(20).optional().nullable(),

  thesis: z.string().trim().max(600).optional().nullable(),

  status: z
    .enum(["Research", "Watchlist", "High Conviction"])
    .optional()
    .default("Research"),

  score: z.number().int().min(0).max(100).optional().default(50),

  risk: z.enum(["Low", "Medium", "High"]).optional().default("Medium"),
});

const syncWatchlistSchema = z.object({
  items: z
    .array(syncWatchlistItemSchema)
    .max(100, "You can sync up to 100 watchlist items at once."),

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
    const parsed = syncWatchlistSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            parsed.error.issues[0]?.message ?? "Invalid watchlist sync input.",
        },
        {
          status: 400,
        }
      );
    }

    const { items, clearBeforeSync } = parsed.data;

    if (clearBeforeSync) {
      await prisma.userWatchlistItem.deleteMany({
        where: {
          userId: session.user.id,
        },
      });
    }

    const syncedItems = [];
    const skippedItems = [];

    for (const item of items) {
      const existingItem = await prisma.userWatchlistItem.findFirst({
        where: {
          userId: session.user.id,
          company: {
            equals: item.company,
            mode: "insensitive",
          },
        },
      });

      if (existingItem) {
        const updatedItem = await prisma.userWatchlistItem.update({
          where: {
            id: existingItem.id,
          },
          data: {
            symbol: item.symbol || existingItem.symbol,
            thesis: item.thesis || existingItem.thesis,
            status: item.status,
            score: item.score,
            risk: item.risk,
          },
        });

        syncedItems.push(updatedItem);
        continue;
      }

      const createdItem = await prisma.userWatchlistItem.create({
        data: {
          userId: session.user.id,
          company: item.company,
          symbol: item.symbol || item.company.slice(0, 4).toUpperCase(),
          thesis:
            item.thesis ||
            "Synced from local watchlist. Run research to generate a full AI investment memo.",
          status: item.status,
          score: item.score,
          risk: item.risk,
        },
      });

      syncedItems.push(createdItem);
    }

    return NextResponse.json({
      success: true,
      message: "Watchlist synced successfully.",
      data: {
        syncedCount: syncedItems.length,
        skippedCount: skippedItems.length,
        items: syncedItems,
      },
    });
  } catch (error) {
    console.error("Sync watchlist error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to sync watchlist.",
      },
      {
        status: 500,
      }
    );
  }
}