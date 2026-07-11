import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { authOptions } from "@/lib/auth/auth-options";

const createWatchlistItemSchema = z.object({
  company: z
    .string()
    .trim()
    .min(1, "Company is required.")
    .max(120, "Company name is too long."),

  symbol: z
    .string()
    .trim()
    .max(20, "Symbol is too long.")
    .optional(),

  thesis: z
    .string()
    .trim()
    .max(600, "Thesis is too long.")
    .optional(),

  status: z
    .enum(["Research", "Watchlist", "High Conviction"])
    .optional(),

  score: z
    .number()
    .int()
    .min(0)
    .max(100)
    .optional(),

  risk: z
    .enum(["Low", "Medium", "High"])
    .optional(),
});

const updateWatchlistItemSchema = createWatchlistItemSchema.partial().extend({
  id: z.string().min(1, "Watchlist item id is required."),
});

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

    const items = await prisma.userWatchlistItem.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error("Get watchlist error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch watchlist.",
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
    const parsed = createWatchlistItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            parsed.error.issues[0]?.message ??
            "Invalid watchlist item input.",
        },
        {
          status: 400,
        }
      );
    }

    const existingItem = await prisma.userWatchlistItem.findFirst({
      where: {
        userId: session.user.id,
        company: {
          equals: parsed.data.company,
          mode: "insensitive",
        },
      },
    });

    if (existingItem) {
      return NextResponse.json(
        {
          success: false,
          error: "This company is already in your watchlist.",
        },
        {
          status: 409,
        }
      );
    }

    const item = await prisma.userWatchlistItem.create({
      data: {
        userId: session.user.id,
        company: parsed.data.company,
        symbol: parsed.data.symbol || parsed.data.company.slice(0, 4).toUpperCase(),
        thesis:
          parsed.data.thesis ||
          "Added manually. Run research to generate a full AI investment memo.",
        status: parsed.data.status ?? "Research",
        score: parsed.data.score ?? 50,
        risk: parsed.data.risk ?? "Medium",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Company added to watchlist.",
        data: item,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Create watchlist item error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to add company to watchlist.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(request: Request) {
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
    const parsed = updateWatchlistItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            parsed.error.issues[0]?.message ??
            "Invalid watchlist update input.",
        },
        {
          status: 400,
        }
      );
    }

    const { id, ...updates } = parsed.data;

    const existingItem = await prisma.userWatchlistItem.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        {
          success: false,
          error: "Watchlist item not found.",
        },
        {
          status: 404,
        }
      );
    }

    const updatedItem = await prisma.userWatchlistItem.update({
      where: {
        id,
      },
      data: updates,
    });

    return NextResponse.json({
      success: true,
      message: "Watchlist item updated.",
      data: updatedItem,
    });
  } catch (error) {
    console.error("Update watchlist item error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update watchlist item.",
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
      return NextResponse.json(
        {
          success: false,
          error: "Watchlist item id is required.",
        },
        {
          status: 400,
        }
      );
    }

    const existingItem = await prisma.userWatchlistItem.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        {
          success: false,
          error: "Watchlist item not found.",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.userWatchlistItem.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Watchlist item removed.",
    });
  } catch (error) {
    console.error("Delete watchlist item error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete watchlist item.",
      },
      {
        status: 500,
      }
    );
  }
}