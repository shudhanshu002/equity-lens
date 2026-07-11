import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { authOptions } from "@/lib/auth/auth-options";

const createExportSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Export title is required.")
    .max(180, "Export title is too long."),

  type: z.enum([
    "RESEARCH_REPORT",
    "COMPARISON_REPORT",
    "WATCHLIST",
    "SETTINGS",
    "CUSTOM",
  ]),

  format: z.enum(["PDF", "MARKDOWN", "JSON", "CSV"]),

  description: z
    .string()
    .trim()
    .max(400, "Description is too long.")
    .optional(),

  payload: z.unknown().optional(),
  metadata: z.unknown().optional(),
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
    const format = searchParams.get("format");

    const exportItems = await prisma.userExportItem.findMany({
      where: {
        userId: session.user.id,
        ...(type ? { type } : {}),
        ...(format ? { format } : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });

    return NextResponse.json({
      success: true,
      data: exportItems,
    });
  } catch (error) {
    console.error("Get user exports error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch exports.",
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
    const parsed = createExportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message ?? "Invalid export input.",
        },
        {
          status: 400,
        }
      );
    }

    const exportItem = await prisma.userExportItem.create({
      data: {
        userId: session.user.id,
        title: parsed.data.title,
        type: parsed.data.type,
        format: parsed.data.format,
        description: parsed.data.description,
        payload: toJsonValue(parsed.data.payload),
        metadata: toJsonValue(parsed.data.metadata),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Export saved successfully.",
        data: exportItem,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Create user export error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to save export.",
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
      await prisma.userExportItem.deleteMany({
        where: {
          userId: session.user.id,
        },
      });

      return NextResponse.json({
        success: true,
        message: "All exports cleared.",
      });
    }

    const existingItem = await prisma.userExportItem.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        {
          success: false,
          error: "Export item not found.",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.userExportItem.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Export removed successfully.",
    });
  } catch (error) {
    console.error("Delete user export error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete export.",
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