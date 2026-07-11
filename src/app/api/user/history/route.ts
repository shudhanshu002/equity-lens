import { NextResponse } from "next/server";
import { HistoryItemType } from "@prisma/client";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { authOptions } from "@/lib/auth/auth-options";

const createHistoryItemSchema = z.object({
  type: z.enum(["RESEARCH", "COMPARISON"]),

  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(180, "Title is too long."),

  subtitle: z
    .string()
    .trim()
    .max(260, "Subtitle is too long.")
    .optional(),

  symbol: z
    .string()
    .trim()
    .max(20, "Symbol is too long.")
    .optional(),

  decision: z
    .string()
    .trim()
    .max(40, "Decision is too long.")
    .optional(),

  score: z
    .number()
    .int()
    .min(0)
    .max(100)
    .optional(),

  payload: z.unknown(),
});

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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    const historyItems = await prisma.userHistoryItem.findMany({
      where: {
        userId: session.user.id,
        ...(type === "RESEARCH" || type === "COMPARISON"
          ? {
              type: type as HistoryItemType,
            }
          : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      data: historyItems,
    });
  } catch (error) {
    console.error("Get user history error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch history.",
      },
      {
        status: 500,
      }
    );
  }
}

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
    const parsed = createHistoryItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            parsed.error.issues[0]?.message ?? "Invalid history item input.",
        },
        {
          status: 400,
        }
      );
    }

    const historyItem = await prisma.userHistoryItem.create({
      data: {
        userId: session.user.id,
        type:
          parsed.data.type === "RESEARCH"
            ? HistoryItemType.RESEARCH
            : HistoryItemType.COMPARISON,
        title: parsed.data.title,
        subtitle: parsed.data.subtitle,
        symbol: parsed.data.symbol,
        decision: parsed.data.decision,
        score: parsed.data.score,
        payload: parsed.data.payload as any,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "History item saved.",
        data: historyItem,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Create user history error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to save history item.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      await prisma.userHistoryItem.deleteMany({
        where: {
          userId: session.user.id,
        },
      });

      return NextResponse.json({
        success: true,
        message: "All history cleared.",
      });
    }

    const existingItem = await prisma.userHistoryItem.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        {
          success: false,
          error: "History item not found.",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.userHistoryItem.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "History item removed.",
    });
  } catch (error) {
    console.error("Delete user history error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete history.",
      },
      {
        status: 500,
      }
    );
  }
}