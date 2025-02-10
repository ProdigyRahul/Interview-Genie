import { NextRequest, NextResponse } from 'next/server';
import { generateLaTeX } from '@/lib/templates/latex/generator';
import { generateResumePDF } from '@/lib/templates/latex/compiler';
import { ResumeData, TemplateType } from '@/lib/templates/latex/types';
import { analyzeResume } from '@/lib/gemini';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    const { data, template } = body as { data: ResumeData; template: TemplateType };

    // Validate request data
    if (!data || !template) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate LaTeX content
    const latexContent = generateLaTeX(data, template);

    // Generate PDF
    const { buffer, error } = await generateResumePDF(latexContent);
    if (error || !buffer.length) {
      return NextResponse.json({ error: error || 'Failed to generate PDF' }, { status: 500 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Analyze resume with Gemini
    const analysis = await analyzeResume(latexContent);

    // Convert ResumeData to a plain object for JSON storage
    const parsedData = {
      personalInfo: { ...data.personalInfo },
      summary: data.summary,
      experience: data.experience.map(exp => ({ ...exp })),
      education: data.education.map(edu => ({ ...edu })),
      projects: data.projects.map(proj => ({ ...proj })),
      certifications: data.certifications.map(cert => ({ ...cert })),
      skills: { ...data.skills },
      achievements: data.achievements.map(ach => ({ ...ach }))
    };

    // Save resume to database
    const resume = await prisma.resume.create({
      data: {
        userId: user.id,
        title: data.personalInfo.name,
        fileType: 'pdf',
        parsedData,
        atsScore: analysis.ats_analysis.total_score,
        personalInfo: {
          create: {
            fullName: data.personalInfo.name,
            email: data.personalInfo.email,
            phoneNumber: data.personalInfo.phone,
            jobTitle: data.personalInfo.title || '',
            location: data.personalInfo.location,
            linkedIn: data.personalInfo.linkedin,
            portfolio: data.personalInfo.website,
            github: data.personalInfo.github
          }
        },
        summary: {
          create: {
            content: data.summary
          }
        },
        experiences: {
          create: data.experience.map(exp => ({
            companyName: exp.company,
            jobTitle: exp.position,
            location: exp.location,
            startDate: new Date(exp.startDate),
            endDate: exp.endDate ? new Date(exp.endDate) : null,
            current: !exp.endDate,
            description: exp.description.join('\n'),
            achievements: [],
            technologies: []
          }))
        },
        education: {
          create: data.education.map(edu => ({
            school: edu.school,
            degree: edu.degree,
            fieldOfStudy: '',
            location: edu.location,
            startDate: new Date(edu.startDate),
            endDate: edu.endDate ? new Date(edu.endDate) : null,
            current: !edu.endDate,
            achievements: edu.description || []
          }))
        },
        projects: {
          create: data.projects.map(proj => ({
            title: proj.name,
            description: proj.description.join('\n'),
            technologies: [proj.technologies],
            link: ''
          }))
        },
        certifications: {
          create: data.certifications.map(cert => ({
            name: cert.name,
            issuingOrg: cert.issuer,
            issueDate: new Date(cert.date),
            credentialId: '',
            credentialUrl: ''
          }))
        },
        skills: {
          create: [
            {
              category: 'Technical',
              skills: data.skills.technical
            },
            {
              category: 'Soft',
              skills: data.skills.soft
            },
            {
              category: 'Languages',
              skills: data.skills.languages
            }
          ]
        },
        achievements: {
          create: data.achievements.map(ach => ({
            title: ach.title,
            description: ach.description,
            date: new Date(ach.date)
          }))
        }
      }
    });

    // Return PDF buffer, resume ID, and ATS analysis
    return NextResponse.json({
      resumeId: resume.id,
      pdf: buffer.toString('base64'),
      ats_analysis: analysis.ats_analysis,
      improvement_suggestions: analysis.improvement_suggestions,
      improvement_details: analysis.improvement_details
    });
  } catch (error) {
    console.error('Error generating resume:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function calculateResumeScore(data: ResumeData): number {
  let score = 0;
  const maxScore = 100;

  // Personal Info (10 points)
  const personalInfoFields = Object.values(data.personalInfo).filter(Boolean).length;
  score += (personalInfoFields / 8) * 10;

  // Summary (10 points)
  if (data.summary) {
    const words = data.summary.split(' ').length;
    score += Math.min(words / 50, 1) * 10;
  }

  // Experience (30 points)
  const expScore = Math.min(data.experience.length / 3, 1) * 15;
  const expDetailScore = data.experience.reduce((acc, exp) => 
    acc + Math.min(exp.description.length / 3, 1), 0) / Math.max(data.experience.length, 1) * 15;
  score += expScore + expDetailScore;

  // Education (15 points)
  score += Math.min(data.education.length / 2, 1) * 15;

  // Projects (15 points)
  const projScore = Math.min(data.projects.length / 3, 1) * 7.5;
  const projDetailScore = data.projects.reduce((acc, proj) => 
    acc + Math.min(proj.description.length / 2, 1), 0) / Math.max(data.projects.length, 1) * 7.5;
  score += projScore + projDetailScore;

  // Skills (10 points)
  const skillsCount = data.skills.technical.length + data.skills.soft.length + data.skills.languages.length;
  score += Math.min(skillsCount / 10, 1) * 10;

  // Certifications and Achievements (10 points)
  const certScore = Math.min(data.certifications.length / 2, 1) * 5;
  const achScore = Math.min(data.achievements.length / 2, 1) * 5;
  score += certScore + achScore;

  return Math.round(Math.min(score, maxScore));
} 