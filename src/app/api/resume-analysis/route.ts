import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ResumeAnalysisResult } from "@/types/resume";

const API_URL = "http://23.94.74.248:5000/api/v1/ats-score";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    
    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json() as ResumeAnalysisResult;

    if (!data.success) {
      throw new Error("Failed to analyze resume");
    }

    // Store the analysis in the database
    const analysis = await db.resumeAnalysis.create({
      data: {
        userId: session.user.id,
        originalFilename: data.metadata.filename,
        fileUrl: data.metadata.file_url,
        totalScore: data.ats_analysis.total_score,
        sectionScores: JSON.parse(JSON.stringify(data.ats_analysis.section_scores)),
        detailedBreakdown: JSON.parse(JSON.stringify(data.ats_analysis.detailed_breakdown)),
        keywordMatchRate: data.ats_analysis.keyword_match_rate,
        missingKeywords: data.ats_analysis.missing_keywords || [],
        improvements: JSON.parse(JSON.stringify({
          high_priority: data.improvement_suggestions.high_priority,
          content: data.improvement_suggestions.content,
          format: data.improvement_suggestions.format,
          language: data.improvement_suggestions.language,
          keywords: data.improvement_suggestions.keywords,
          details: {
            bullet_points: data.improvement_details.bullet_points,
            achievements: data.improvement_details.achievements,
            skills: data.improvement_details.skills,
          },
        })),
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in resume analysis:', error);
    return NextResponse.json(
      { error: 'Failed to analyze resume' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const analyses = await db.resumeAnalysis.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, analyses });
  } catch (error) {
    console.error('Error fetching resume analyses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resume analyses' },
      { status: 500 }
    );
  }
} 