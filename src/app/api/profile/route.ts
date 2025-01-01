import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

// Define the profile fields we want to select
const profileFields = {
  id: true,
  name: true,
  email: true,
  image: true,
  credits: true,
  subscriptionStatus: true,
  profileProgress: true,
  isProfileComplete: true,
  firstName: true,
  lastName: true,
  phoneNumber: true,
  gender: true,
  country: true,
  state: true,
  city: true,
  pinCode: true,
  workStatus: true,
  experience: true,
  education: true,
  industry: true,
  ageGroup: true,
  aspiration: true,
  hardSkills: true,
} as const;

// Profile update schema
const profileUpdateSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  phoneNumber: z.string().min(10).optional(),
  gender: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  pinCode: z.string().optional(),
  workStatus: z.string().optional(),
  experience: z.string().optional(),
  education: z.string().optional(),
  industry: z.string().optional(),
  ageGroup: z.string().optional(),
  aspiration: z.string().optional(),
  hardSkills: z.array(z.string()).optional(),
  image: z.string().nullable().optional(),
  profileProgress: z.number().min(0).max(100).optional(),
  isProfileComplete: z.boolean().optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401 }
      );
    }

    // Get user profile with selected fields
    const profile = await db.user.findUnique({
      where: { id: session.user.id },
      select: profileFields,
    });

    if (!profile) {
      return new NextResponse(
        JSON.stringify({ error: "Profile not found" }),
        { status: 404 }
      );
    }

    // Set response headers with caching
    return new NextResponse(JSON.stringify(profile), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300, stale-while-revalidate=60", // 5 minutes
      },
    });
  } catch (error) {
    console.error("[PROFILE_GET]", error);
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
    const validatedData = profileUpdateSchema.parse(body);

    // Update user profile with optimized query
    const updatedProfile = await db.user.update({
      where: { id: session.user.id },
      data: {
        ...validatedData,
        name: validatedData.firstName && validatedData.lastName 
          ? `${validatedData.firstName} ${validatedData.lastName}`
          : undefined,
        updatedAt: new Date(),
      },
      select: profileFields,
    });

    return new NextResponse(JSON.stringify(updatedProfile), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("[PROFILE_UPDATE]", error);
    if (error instanceof z.ZodError) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid data", details: error.errors }),
        { status: 400 }
      );
    }
    return new NextResponse(
      JSON.stringify({ error: "Failed to update profile" }),
      { status: 500 }
    );
  }
} 