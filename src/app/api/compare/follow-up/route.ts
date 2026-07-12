import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveCompany } from "@/lib/services/company-resolver";
import { classifyFollowUpIntent } from "@/lib/follow-up/intent";
import { fetchFollowUpResearch } from "@/lib/follow-up/research";
import { generateCompareFollowUpAnswer } from "@/lib/follow-up/compare-answer";
import type { CompanyProfile } from "@/lib/types/research";

const companyProfileSchema = z
  .object({
    symbol: z.string(),
    name: z.string(),
    exchange: z.string(),
    sector: z.string(),
    industry: z.string(),
    country: z.string(),
    currency: z.string(),
    marketCap: z.number().nullable().optional(),
    coverageMode: z.enum(["PUBLIC_EQUITY", "GENERAL_COMPANY"]).optional(),
    isPubliclyTraded: z.boolean().optional(),
    resolvedTicker: z.string().nullable().optional(),
    marketDataSymbol: z.string().nullable().optional(),
  })
  .passthrough();

const schema = z.object({
  question: z.string().min(3),
  companies: z
    .array(z.string().min(2))
    .min(2)
    .max(4),
  companyProfiles: z.array(companyProfileSchema).optional(),
  previousComparison: z.unknown().optional(),
  previousReports: z.array(z.unknown()).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid compare follow-up request.",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const {
      question,
      companies,
      companyProfiles,
      previousComparison,
      previousReports,
    } = parsed.data;

    const intent = classifyFollowUpIntent(question);

    const resolvedCompanies: CompanyProfile[] = companyProfiles?.length
      ? (companyProfiles as CompanyProfile[])
      : (
          await Promise.all(
            companies.map(async (company) => {
              const resolved = await resolveCompany(company);
              return resolved.company;
            })
          )
        ).filter((c): c is CompanyProfile => !!c);

    const researchByCompany = await Promise.all(
      resolvedCompanies.map(async (company) => {
        const sources = await fetchFollowUpResearch({
          company,
          intent,
          question,
        });

        return {
          company,
          sources,
        };
      })
    );

    const answer = await generateCompareFollowUpAnswer({
      question,
      intent,
      researchByCompany,
      previousComparison,
      previousReports,
    });

    return NextResponse.json({
      success: true,
      data: {
        intent,
        answer,
        researchByCompany,
        metadata: {
          generatedAt: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Compare follow-up failed.",
      },
      { status: 500 }
    );
  }
}
