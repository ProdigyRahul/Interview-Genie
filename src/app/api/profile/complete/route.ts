import { auth } from "@/lib/auth";
import { db } from "@/server/db";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Define the shape of the education data
const userEducationSchema = z.object({
  course: z.string().optional(),
  result: z.string().optional(),
  passoutYear: z.string().optional(),
  collegeName: z.string().optional(),
  branchName: z.string().optional(),
  cgpa: z.string().optional(),
});

// Define the shape of the profile data
const profileDataSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),
  gender: z.string().optional(),
  ageGroup: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  pinCode: z.string().optional(),
  workStatus: z.string().optional(),
  experience: z.string().optional(),
  education: z.string().optional(),
  aspiration: z.string().optional(),
  lookingForInternship: z.boolean().optional(),
  industry: z.string().optional(),
  avatarUrl: z.string().optional(),
  resumeUrl: z.string().optional(),
  cookieConsent: z.boolean().optional(),
  userEducation: userEducationSchema.optional(),
});

export type ProfileUpdateData = Omit<z.infer<typeof profileDataSchema>, "userEducation">;

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const rawData = await req.json();
    const data = profileDataSchema.parse(rawData);

    // Validate resume URL if provided
    if (data.resumeUrl && !data.resumeUrl.endsWith('.pdf')) {
      return NextResponse.json(
        { error: "Invalid resume format. Please upload a PDF file." },
        { status: 400 }
      );
    }

    // Separate userEducation from other update data
    const { userEducation, ...updateData } = data;

    // Update user data excluding userEducation
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        ...updateData,
        isProfileComplete: true,
      },
    });

    // If userEducation data is provided, update it separately
    if (userEducation) {
      await db.userEducation.upsert({
        where: {
          userId: session.user.id,
        },
        create: {
          userId: session.user.id,
          ...userEducation,
        },
        update: userEducation,
      });
    }

    // Revalidate all necessary paths
    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/api/auth/session");
    revalidatePath("/complete-profile");

    // Return success response with cache control headers
    const response = NextResponse.json({
      success: true,
      user: updatedUser,
      redirect: "/dashboard",
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });

    return response;
  } catch (error) {
    console.error("Profile completion error:", error);
    return NextResponse.json(
      { error: "Failed to complete profile" },
      { status: 500 }
    );
  }
}