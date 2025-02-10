import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch the resume with all its relations
    const resume = await prisma.resume.findFirst({
      where: {
        id: params.id,
        userId: user.id
      },
      include: {
        personalInfo: true,
        summary: true,
        experiences: true,
        education: true,
        projects: true,
        certifications: true,
        skills: true,
        references: true,
        achievements: true,
        volunteering: true
      }
    });

    if (!resume) {
      return NextResponse.json(
        { error: "Resume not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json(resume);
  } catch (error) {
    console.error("Error fetching resume:", error);
    return NextResponse.json(
      { error: "Failed to fetch resume" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify resume ownership
    const existingResume = await prisma.resume.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    });

    if (!existingResume) {
      return NextResponse.json(
        { error: "Resume not found or unauthorized" },
        { status: 404 }
      );
    }

    const data = await req.json();

    // Update the resume and its relations
    const resume = await prisma.resume.update({
      where: { id: params.id },
      data: {
        title: data.title,
        personalInfo: {
          update: {
            fullName: data.personalInfo.fullName,
            email: data.personalInfo.email,
            phoneNumber: data.personalInfo.phoneNumber,
            jobTitle: data.personalInfo.jobTitle,
            location: data.personalInfo.location,
            linkedIn: data.personalInfo.linkedIn,
            portfolio: data.personalInfo.portfolio,
            github: data.personalInfo.github
          }
        },
        summary: {
          upsert: {
            create: { content: data.summary },
            update: { content: data.summary }
          }
        }
      },
      include: {
        personalInfo: true,
        summary: true,
        experiences: true,
        education: true,
        projects: true,
        certifications: true,
        skills: true,
        references: true,
        achievements: true
      }
    });

    return NextResponse.json(resume);
  } catch (error) {
    console.error("Error updating resume:", error);
    return NextResponse.json(
      { error: "Failed to update resume" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify resume ownership
    const resume = await prisma.resume.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    });

    if (!resume) {
      return NextResponse.json(
        { error: "Resume not found or unauthorized" },
        { status: 404 }
      );
    }

    // Delete the resume (cascade delete will handle relations)
    await prisma.resume.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting resume:", error);
    return NextResponse.json(
      { error: "Failed to delete resume" },
      { status: 500 }
    );
  }
} 