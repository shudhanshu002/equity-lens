import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { authOptions } from "@/lib/auth/auth-options";

const promoteSelfSchema = z.object({
  setupToken: z.string().min(1, "Setup token is required."),
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

    const expectedToken = process.env.ADMIN_SETUP_TOKEN;

    if (!expectedToken) {
      return NextResponse.json(
        {
          success: false,
          error: "ADMIN_SETUP_TOKEN is not configured on the server.",
        },
        {
          status: 500,
        }
      );
    }

    const body = await request.json();
    const parsed = promoteSelfSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            parsed.error.issues[0]?.message ??
            "Invalid admin promotion request.",
        },
        {
          status: 400,
        }
      );
    }

    if (parsed.data.setupToken !== expectedToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid setup token.",
        },
        {
          status: 403,
        }
      );
    }

    const adminCount = await prisma.user.count({
      where: {
        role: UserRole.ADMIN,
      },
    });

    if (adminCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Admin already exists. Promote users from the admin panel instead.",
        },
        {
          status: 409,
        }
      );
    }

    const promotedUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        role: UserRole.ADMIN,
        emailVerified: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "You are now the first admin user.",
      data: promotedUser,
    });
  } catch (error) {
    console.error("Promote self error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to promote user.",
      },
      {
        status: 500,
      }
    );
  }
}