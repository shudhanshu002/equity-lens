import { NextResponse } from "next/server";
import { z } from "zod";
import { runRobustComparison } from "@/lib/compare/run-comparison";

const compareRequestSchema = z.object({
  companies: z.preprocess(
    (value) => {
      if (typeof value === "string") {
        return value
          .split(/,| vs | versus | and /i)
          .map((company) => company.trim())
          .filter(Boolean);
      }

      return value;
    },
    z
      .array(z.string().min(2, "Company name cannot be empty"))
      .min(2, "Compare at least two companies")
      .max(4, "Compare up to four companies at a time")
  ),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = compareRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid compare request.",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = await runRobustComparison(parsed.data.companies);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Comparison failed.",
      },
      { status: 500 }
    );
  }
}