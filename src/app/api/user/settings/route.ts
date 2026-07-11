import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { authOptions } from "@/lib/auth/auth-options";

const updateSettingsSchema = z.object({
  theme: z.enum(["dark", "light"]).optional(),

  llmProvider: z.enum(["Gemini", "OpenAI", "Claude"]).optional(),

  llmModel: z
    .string()
    .trim()
    .min(1, "Model is required.")
    .max(80, "Model name is too long.")
    .optional(),

  financialProvider: z
    .enum(["Alpha Vantage", "Finnhub", "Yahoo Finance"])
    .optional(),

  riskProfile: z
    .enum(["Conservative", "Balanced", "Aggressive"])
    .optional(),

  enableMockFallbacks: z.boolean().optional(),
  enableAgentVisualization: z.boolean().optional(),
  enableLocalHistory: z.boolean().optional(),
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

    const settings = await prisma.userSettings.upsert({
      where: {
        userId: session.user.id,
      },
      update: {},
      create: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Get user settings error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch user settings.",
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
    const parsed = updateSettingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message ?? "Invalid settings input.",
        },
        {
          status: 400,
        }
      );
    }

    const updatedSettings = await prisma.userSettings.upsert({
      where: {
        userId: session.user.id,
      },
      update: parsed.data,
      create: {
        userId: session.user.id,
        ...parsed.data,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Settings saved successfully.",
      data: updatedSettings,
    });
  } catch (error) {
    console.error("Update user settings error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update user settings.",
      },
      {
        status: 500,
      }
    );
  }
}