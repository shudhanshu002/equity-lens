import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runInvestmentResearch } from "@/lib/langgraph/graph";

const ResearchRequestSchema = z.object({
  company: z.string().min(2, "Company name or ticker is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { company } = ResearchRequestSchema.parse(body);

    const report = await runInvestmentResearch(company);

    return NextResponse.json({
      success: true,
      data: {
        company: report.company,
        financials: report.financials,
        news: report.news,
        score: report.score,
        decision: report.decision,
        confidence: report.confidence,
        thesis: report.thesis,
        bullCase: report.bullCase,
        bearCase: report.bearCase,
        risks: report.risks,
        whatWouldChangeDecision: report.whatWouldChangeDecision,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Research API error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while running investment research.",
      },
      { status: 500 }
    );
  }
}