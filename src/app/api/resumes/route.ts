import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateResumeContent, analyzeResume } from '@/lib/gemini';
import pdfParse from 'pdf-parse';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const API_URL = 'http://23.94.74.248:5000/api/v1/ats-score';

export const maxDuration = 60;
export const fetchCache = 'force-no-store';

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    
    if (data.success) {
      // Store the analysis in the database
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      try {
        // Create resume analysis record
        await prisma.resumeAnalysis.create({
          data: {
            userId: user.id,
            originalFilename: data.metadata.filename,
            fileUrl: data.metadata.file_url,
            totalScore: data.ats_analysis.total_score,
            sectionScores: data.ats_analysis.section_scores,
            detailedBreakdown: data.ats_analysis.detailed_breakdown,
            keywordMatchRate: data.ats_analysis.keyword_match_rate,
            missingKeywords: data.ats_analysis.missing_keywords,
            improvements: {
              high_priority: data.improvement_suggestions.high_priority,
              content: data.improvement_suggestions.content,
              format: data.improvement_suggestions.format,
              language: data.improvement_suggestions.language,
              keywords: data.improvement_suggestions.keywords,
              details: data.improvement_details
            }
          }
        });
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Continue even if saving to database fails
      }
    }

    // Return the exact format from the ML API
    return NextResponse.json({
      success: data.success,
      ats_analysis: data.ats_analysis,
      improvement_suggestions: data.improvement_suggestions,
      improvement_details: data.improvement_details,
      metadata: data.metadata
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : "Failed to analyze resume"
    }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized',
        analyses: [] 
      }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ 
        success: false,
        error: 'User not found',
        analyses: [] 
      }, { status: 404 });
    }

    try {
      // Get resume analyses history
      const analyses = await prisma.resumeAnalysis.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 10, // Limit to last 10 analyses
        select: {
          id: true,
          originalFilename: true,
          fileUrl: true,
          totalScore: true,
          sectionScores: true,
          keywordMatchRate: true,
          missingKeywords: true,
          improvements: true,
          createdAt: true,
          updatedAt: true
        }
      });

      return NextResponse.json({ 
        success: true,
        analyses: analyses || [] 
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ 
        success: false,
        error: 'Failed to fetch resume analyses',
        analyses: [] 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error fetching resume analyses:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch resume analyses',
      analyses: []
    }, { status: 500 });
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

// Handle preflight requests
export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Allow': 'POST, OPTIONS',
      'Content-Type': 'application/json',
    },
  });
} 