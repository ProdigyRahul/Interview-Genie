import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

// Common profile select object to ensure consistent data shape
const profileSelect = {
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

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const profile = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: profileSelect,
    });

    if (!profile) {
      return new NextResponse("Profile not found", { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("[PROFILE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    // Calculate filled fields for progress
    const fields = [
      body.firstName,
      body.lastName,
      body.email,
      body.phoneNumber,
      body.gender,
      body.country,
      body.state,
      body.city,
      body.pinCode,
      body.workStatus,
      body.experience,
      body.education,
      body.industry,
      body.ageGroup,
      body.aspiration,
      body.hardSkills,
    ];

    const filledFields = fields.filter(field => 
      field !== null && field !== undefined && 
      (typeof field === 'string' ? field.trim().length > 0 : true)
    ).length;

    const totalFields = fields.length;
    const profileProgress = Math.round((filledFields / totalFields) * 100);
    
    const updatedProfile = await db.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        ...body,
        profileProgress,
        isProfileComplete: profileProgress >= 80,
      },
      select: profileSelect,
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error("[PROFILE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 