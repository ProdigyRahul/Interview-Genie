import { auth } from "@/lib/auth";
import { db } from "@/server/db";
import { NextResponse } from "next/server";
import { z } from "zod";

// Define request schema for better type safety
const profileDataSchema = z.object({
  data: z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    phoneNumber: z.string().min(10, "Phone number must be at least 10 characters"),
    gender: z.string(),
    country: z.string(),
    state: z.string(),
    city: z.string(),
    pinCode: z.string(),
    workStatus: z.string(),
    experience: z.string(),
    education: z.string(),
    industry: z.string(),
    ageGroup: z.string().optional(),
    aspiration: z.string().optional(),
    hardSkills: z.array(z.string()).optional(),
    image: z.string().nullable(),
  })
});

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }), 
        { status: 401 }
      );
    }

    const body = await req.json();
    const { data } = profileDataSchema.parse(body);

    // Update user profile
    const result = await db.user.update({
      where: { email: session.user.email },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        name: `${data.firstName} ${data.lastName}`, // Update name as well
        phoneNumber: data.phoneNumber,
        gender: data.gender,
        country: data.country,
        state: data.state,
        city: data.city,
        pinCode: data.pinCode,
        workStatus: data.workStatus,
        experience: data.experience,
        education: data.education,
        industry: data.industry,
        ageGroup: data.ageGroup,
        aspiration: data.aspiration,
        hardSkills: data.hardSkills,
        image: data.image,
        isProfileComplete: true,
        profileProgress: 100,
        updatedAt: new Date(),
      },
    });

    return new NextResponse(
      JSON.stringify({
        success: true,
        user: result,
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error("[PROFILE_COMPLETE]", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to update profile" }), 
      { status: 500 }
    );
  }
}