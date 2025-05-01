import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
export const fetchCache = "force-no-store";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 },
      );
    }

    const { id } = params;

    // Fetch the LinkedIn profile from the database
    const profile = await prisma.linkedInProfile.findUnique({
      where: {
        id,
      },
    });

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          error: "LinkedIn profile not found",
        },
        { status: 404 },
      );
    }

    // Verify the profile belongs to the user
    if (profile.userId !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized to access this profile",
        },
        { status: 403 },
      );
    }

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Error fetching LinkedIn profile:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch LinkedIn profile",
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