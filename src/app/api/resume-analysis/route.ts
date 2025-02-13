import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ResumeAnalysisResult } from "@/types/resume";

const API_URL = "http://23.94.74.248:5000/api/v1/ats-score";
const TIMEOUT_DURATION = 8000; // 8 seconds to stay under Vercel's 10s limit

// Helper function to handle timeout
const fetchWithTimeout = async (url: string, options: RequestInit, timeout: number) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

export async function POST(request: Request) {
  const startTime = Date.now();
  
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    
    console.log(`[Resume Analysis] Starting analysis for user ${session.user.id}`);
    
    try {
      const response = await fetchWithTimeout(API_URL, {
        method: 'POST',
        body: formData,
      }, TIMEOUT_DURATION);

      if (!response.ok) {
        console.error(`[Resume Analysis] API responded with status: ${response.status}`);
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json() as ResumeAnalysisResult;

      if (!data.success) {
        console.error('[Resume Analysis] API returned success: false');
        throw new Error("Failed to analyze resume");
      }

      console.log(`[Resume Analysis] Successfully received analysis after ${Date.now() - startTime}ms`);

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
          improvementSuggestions: JSON.parse(JSON.stringify({
            high_priority: data.improvement_suggestions.high_priority,
            content: data.improvement_suggestions.content,
            format: data.improvement_suggestions.format,
            language: data.improvement_suggestions.language,
            keywords: data.improvement_suggestions.keywords,
          })),
          improvementDetails: JSON.parse(JSON.stringify({
            bullet_points: data.improvement_details.bullet_points,
            achievements: data.improvement_details.achievements,
            skills: data.improvement_details.skills,
          })),
        },
      });

      console.log(`[Resume Analysis] Successfully saved to database after ${Date.now() - startTime}ms`);
      return NextResponse.json(data);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('[Resume Analysis] Request timed out after 8 seconds');
        return NextResponse.json(
          { error: 'Analysis request timed out. Please try again.' },
          { status: 504 }
        );
      }
      throw error;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Resume Analysis] Error: ${errorMessage}`, error);
    return NextResponse.json(
      { error: 'Failed to analyze resume. Please try again later.' },
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