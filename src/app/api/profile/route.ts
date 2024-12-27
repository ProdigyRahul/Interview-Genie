import { auth } from "@/lib/auth";
import { db } from "@/server/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }), 
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        profileProgress: true,
        isProfileComplete: true,
      },
    });

    return new NextResponse(
      JSON.stringify({
        profileProgress: user?.profileProgress ?? 0,
        isProfileComplete: user?.isProfileComplete ?? false,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("[PROFILE_GET]", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }), 
      { status: 500 }
    );
  }
} 