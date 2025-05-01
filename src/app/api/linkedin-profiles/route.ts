import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
export const fetchCache = "force-no-store";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          profiles: [],
        },
        { status: 401 },
      );
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
          profiles: [],
        },
        { status: 404 },
      );
    }

    // Fetch LinkedIn profiles from the database
    const profiles = await db.linkedInProfile.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      profiles,
    });
  } catch (error) {
    console.error("Error fetching LinkedIn profiles:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch LinkedIn profiles",
        profiles: [],
      },
      { status: 500 },
    );
  }
}

// Handle preflight requests
export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      Allow: "GET, OPTIONS",
      "Content-Type": "application/json",
    },
  });
} 