import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateResumeContent } from '@/lib/gemini';
import { Prisma } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const { fullName, email, phoneNumber, jobTitle, yearsOfExperience, keySkills } = data;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create the resume with personal info
    const resume = await prisma.resume.create({
      data: {
        userId: user.id,
        title: `${fullName}'s Resume`,
        fileType: 'pdf',
        personalInfo: {
          create: {
            fullName,
            email,
            phoneNumber,
            jobTitle,
            location: '',
            linkedIn: '',
            portfolio: '',
            github: ''
          }
        }
      },
      include: {
        personalInfo: true
      }
    });

    // Generate AI summary based on the provided information
    const summaryContext = {
      jobTitle,
      experience: yearsOfExperience,
      skills: keySkills
    };

    const summary = await generateResumeContent('summary', summaryContext);
    if (summary.content) {
      await prisma.resumeSummary.create({
        data: {
          resumeId: resume.id,
          content: summary.content
        }
      });
    }

    // Generate AI skills suggestions
    const skillsContext = {
      jobTitle,
      experience: yearsOfExperience
    };

    const skillsSuggestions = await generateResumeContent('skills', skillsContext);
    if (skillsSuggestions.content) {
      const skillsArray = skillsSuggestions.content
        .split('\n')
        .filter(skill => skill.trim())
        .map(skill => skill.replace(/^-\s*/, '').trim());

      await prisma.resumeSkill.create({
        data: {
          resumeId: resume.id,
          category: 'Technical Skills',
          skills: skillsArray
        }
      });
    }

    // Fetch the complete resume with all relations
    const completeResume = await prisma.resume.findUnique({
      where: { id: resume.id },
      include: {
        personalInfo: true,
        summary: true,
        skills: true
      }
    });

    return NextResponse.json(completeResume);
  } catch (error) {
    console.error('Error creating resume:', error);
    return NextResponse.json(
      { error: 'Failed to create resume' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const resumes = await prisma.resume.findMany({
      where: { userId: user.id },
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
      },
      orderBy: [
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json(resumes);
  } catch (error) {
    console.error('Error fetching resumes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resumes' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const resumeId = searchParams.get('id');

    if (!resumeId) {
      return NextResponse.json(
        { error: 'Resume ID is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify ownership
    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId: user.id
      }
    });

    if (!resume) {
      return NextResponse.json(
        { error: 'Resume not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete the resume and all related data (cascade delete will handle relations)
    await prisma.resume.delete({
      where: { id: resumeId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting resume:', error);
    return NextResponse.json(
      { error: 'Failed to delete resume' },
      { status: 500 }
    );
  }
} 