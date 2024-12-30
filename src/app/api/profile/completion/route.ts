import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        isProfileComplete: true,
        profileProgress: true,
      },
    });

    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: "User not found" }),
        { status: 404 }
      );
    }

    return new NextResponse(
      JSON.stringify({
        isProfileComplete: user.isProfileComplete,
        profileProgress: user.profileProgress,
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error("Profile completion error:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401 }
      );
    }

    const body = await req.json();
    const { profileProgress } = body;

    const user = await db.user.update({
      where: { id: session.user.id },
      data: {
        profileProgress,
        isProfileComplete: profileProgress === 100,
      },
      select: {
        isProfileComplete: true,
        profileProgress: true,
      },
    });

    return new NextResponse(
      JSON.stringify({
        isProfileComplete: user.isProfileComplete,
        profileProgress: user.profileProgress,
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error("Profile completion update error:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
} 