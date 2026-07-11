import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { authOptions } from "@/lib/auth/auth-options";

const syncSettingsSchema = z.object({
  settings: z.object({
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
  }),
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
    const parsed = syncSettingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            parsed.error.issues[0]?.message ?? "Invalid settings sync input.",
        },
        {
          status: 400,
        }
      );
    }

    const syncedSettings = await prisma.userSettings.upsert({
      where: {
        userId: session.user.id,
      },
      update: parsed.data.settings,
      create: {
        userId: session.user.id,
        ...parsed.data.settings,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Settings synced successfully.",
      data: syncedSettings,
    });
  } catch (error) {
    console.error("Sync settings error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to sync settings.",
      },
      {
        status: 500,
      }
    );
  }
}