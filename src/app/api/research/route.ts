import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const ResearchRequestSchema = z.object({
  company: z.string().min(2, "Company name or ticker is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { company } = ResearchRequestSchema.parse(body);

    return NextResponse.json({
      success: true,
      message: "Investment research backend is working.",
      input: company,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Invalid research request.",
      },
      { status: 400 }
    );
  }
}