import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ResumeAnalysisResult } from "@/types/resume";
import { google, MODEL_NAME } from "@/lib/google";
import { generateText } from "ai";
import type { GoogleGenerativeAIProviderOptions } from '@ai-sdk/google';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Define feature credit costs
const RESUME_OPTIMIZER_CREDITS = 30;

// Remove edge runtime and use Node.js runtime
export const dynamic = 'force-dynamic';
// Configure longer timeout
export const maxDuration = 60; // 60 seconds timeout

// Define extended result type that includes credits
interface ResumeAnalysisResultWithCredits extends ResumeAnalysisResult {
  credits: {
    cost: number;
    remaining: number | "UNLIMITED";
  };
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has enough credits or is a PRO member
    const isPro = user.subscriptionStatus === "PRO";
    if (!isPro && user.credits < RESUME_OPTIMIZER_CREDITS) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Not enough credits. Resume Optimizer requires ${RESUME_OPTIMIZER_CREDITS} credits.` 
        },
        { status: 402 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 });
    }

    // Save the file to public/uploads/resumes
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = path.extname(file.name).toLowerCase();
    const uniqueFilename = `${uuidv4()}${fileExtension}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'resumes');
    const filePath = path.join(uploadDir, uniqueFilename);
    
    // Ensure upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Write file to disk
    fs.writeFileSync(filePath, fileBuffer);
    
    // Generate the public URL
    const fileUrl = `/uploads/resumes/${uniqueFilename}`;

    const { text: analysis } = await generateText({
      model: google(MODEL_NAME, {
        safetySettings: [
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_LOW_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_LOW_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_LOW_AND_ABOVE' },
          { category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_LOW_AND_ABOVE' }
        ],
        structuredOutputs: false // Disable structured outputs to avoid schema limitations
      }),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this resume and provide a detailed ATS analysis as a valid JSON object with the following structure:\n' +
                    '{\n' +
                    '  "ats_analysis": {\n' +
                    '    "total_score": number (0-100),\n' +
                    '    "section_scores": {\n' +
                    '      "format": number (0-20),\n' +
                    '      "content": number (0-20),\n' +
                    '      "language": number (0-20),\n' +
                    '      "competencies": number (0-20),\n' +
                    '      "keywords": number (0-20)\n' +
                    '    },\n' +
                    '    "detailed_breakdown": {\n' +
                    '      "format_analysis": {\n' +
                    '        "length_depth_score": number (0-20),\n' +
                    '        "bullet_usage_score": number (0-20),\n' +
                    '        "bullet_length_score": number (0-20),\n' +
                    '        "page_density_score": number (0-20),\n' +
                    '        "formatting_score": number (0-20)\n' +
                    '      },\n' +
                    '      "content_analysis": { ... similar scores },\n' +
                    '      "language_analysis": { ... similar scores },\n' +
                    '      "competencies_analysis": { ... similar scores }\n' +
                    '    },\n' +
                    '    "keyword_match_rate": string,\n' +
                    '    "missing_keywords": string[],\n' +
                    '    "improvement_suggestions": {\n' +
                    '      "high_priority": string[],\n' +
                    '      "content": [\n' +
                    '        {\n' +
                    '          "current": string,\n' +
                    '          "suggested": string,\n' +
                    '          "impact": string,\n' +
                    '          "section": string\n' +
                    '        }\n' +
                    '      ],\n' +
                    '      "format": [\n' +
                    '        {\n' +
                    '          "original": string,\n' +
                    '          "improved": string,\n' +
                    '          "reason": string\n' +
                    '        }\n' +
                    '      ],\n' +
                    '      "language": [ ... similar to format ],\n' +
                    '      "keywords": string[]\n' +
                    '    }\n' +
                    '  }\n' +
                    '}\n' +
                    'Do not add any markdown formatting, code blocks, or extra text outside the JSON structure.'
            },
            {
              type: 'file',
              data: fileBuffer,
              mimeType: file.type,
            }
          ]
        }
      ],
      providerOptions: {
        google: {
          responseModalities: ['TEXT'],
          thinkingConfig: {
            thinkingBudget: 2048,
          }
        } satisfies GoogleGenerativeAIProviderOptions
      }
    });

    // Ensure we have a valid JSON string before parsing
    let data: ResumeAnalysisResult;
    try {
      // Clean up any potential markdown formatting
      const cleanedAnalysis = analysis
        .replace(/```json\s*/g, '')
        .replace(/```\s*$/g, '')
        .trim();
      
      const rawData = JSON.parse(cleanedAnalysis);
      console.log('Raw AI response:', JSON.stringify(rawData, null, 2));
      
      // Transform the data to match our expected structure
      data = {
        success: true,
        file_url: fileUrl,
        ats_analysis: {
          total_score: rawData.ats_analysis?.total_score || rawData.ats_analysis?.overall_score || 50,
          section_scores: {
            format: rawData.ats_analysis?.section_scores?.format || 10,
            content: rawData.ats_analysis?.section_scores?.content || 10,
            language: rawData.ats_analysis?.section_scores?.language || 10,
            competencies: rawData.ats_analysis?.section_scores?.competencies || 10,
            keywords: rawData.ats_analysis?.section_scores?.keywords || 10
          },
          detailed_breakdown: {
            format_analysis: rawData.ats_analysis?.detailed_breakdown?.format_analysis || {
              length_depth_score: 10,
              bullet_usage_score: 10,
              bullet_length_score: 10,
              page_density_score: 10,
              formatting_score: 10
            },
            content_analysis: rawData.ats_analysis?.detailed_breakdown?.content_analysis || {
              impact_score: 10,
              achievements_score: 10,
              relevance_score: 10,
              technical_depth_score: 10
            },
            language_analysis: rawData.ats_analysis?.detailed_breakdown?.language_analysis || {
              verb_strength: 10,
              tense_consistency: 10,
              clarity: 10,
              spelling_grammar: 10,
              professional_tone: 10
            },
            competencies_analysis: rawData.ats_analysis?.detailed_breakdown?.competencies_analysis || {
              leadership_initiative: 10,
              problem_solving: 10,
              collaboration: 10,
              results_orientation: 10
            }
          },
          keyword_match_rate: rawData.ats_analysis?.keyword_match_rate || "50%",
          missing_keywords: rawData.ats_analysis?.missing_keywords || 
                           rawData.ats_analysis?.missing_important_keywords || []
        },
        improvement_suggestions: {
          high_priority: rawData.ats_analysis?.improvement_suggestions?.high_priority || 
                          rawData.ats_analysis?.improvement_suggestions?.high_priority_changes || 
                          [],
          content: (rawData.ats_analysis?.improvement_suggestions?.content || []).map((item: any) => ({
            current: item?.current || '',
            impact: item?.impact || '',
            section: item?.section || '',
            suggested: item?.suggested || ''
          })),
          format: (rawData.ats_analysis?.improvement_suggestions?.format || []).map((item: any) => ({
            improved: item?.improved || '',
            original: item?.original || '',
            reason: item?.reason || ''
          })),
          language: (rawData.ats_analysis?.improvement_suggestions?.language || []).map((item: any) => ({
            improved: item?.improved || '',
            original: item?.original || '',
            reason: item?.reason || ''
          })),
          keywords: rawData.ats_analysis?.improvement_suggestions?.keywords || []
        },
        improvement_details: {
          bullet_points: rawData.ats_analysis?.detailed_breakdown?.bullet_points_analysis ? 
                        [{ 
                          original: '', 
                          improved: rawData.ats_analysis.detailed_breakdown.bullet_points_analysis.suggestions || '',
                          reason: rawData.ats_analysis.detailed_breakdown.bullet_points_analysis.analysis || ''
                        }] : [],
          achievements: rawData.ats_analysis?.detailed_breakdown?.achievements_analysis ? 
                       [{ 
                         original: '', 
                         improved: rawData.ats_analysis.detailed_breakdown.achievements_analysis.suggestions || '',
                         reason: rawData.ats_analysis.detailed_breakdown.achievements_analysis.analysis || ''
                       }] : [],
          skills: rawData.ats_analysis?.detailed_breakdown?.skills_analysis ?
                [{ 
                  original: '', 
                  improved: rawData.ats_analysis.detailed_breakdown.skills_analysis.suggestions || '',
                  reason: rawData.ats_analysis.detailed_breakdown.skills_analysis.analysis || ''
                }] : []
        },
        metadata: {
          filename: file.name,
          file_url: fileUrl,
          job_description_provided: false,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Failed to parse analysis result:', error);
      console.log('Raw analysis:', analysis);
      throw new Error('Failed to parse AI response into valid JSON');
    }

    // Store the analysis in the database and deduct credits
    const [_, updatedUserIfNeeded] = await db.$transaction([
      // 1. Create the analysis record
      db.resumeAnalysis.create({
        data: {
          userId: session.user.id,
          originalFilename: file.name,
          fileUrl: fileUrl,
          totalScore: data.ats_analysis.total_score,
          sectionScores: data.ats_analysis.section_scores,
          detailedBreakdown: data.ats_analysis.detailed_breakdown,
          keywordMatchRate: data.ats_analysis.keyword_match_rate,
          missingKeywords: data.ats_analysis.missing_keywords || [],
          improvementSuggestions: {
            high_priority: data.improvement_suggestions.high_priority,
            content: data.improvement_suggestions.content,
            format: data.improvement_suggestions.format,
            language: data.improvement_suggestions.language,
            keywords: data.improvement_suggestions.keywords,
          },
          improvementDetails: {
            bullet_points: data.improvement_details.bullet_points,
            achievements: data.improvement_details.achievements,
            skills: data.improvement_details.skills,
          },
        },
      }),
      
      // 2. Deduct credits if not a PRO user
      ...(!isPro ? [
        db.user.update({
          where: { id: user.id },
          data: { 
            credits: {
              decrement: RESUME_OPTIMIZER_CREDITS
            }
          },
        })
      ] : [])
    ]);

    // Add credit information to the response
    return NextResponse.json({
      ...data,
      credits: {
        cost: RESUME_OPTIMIZER_CREDITS,
        remaining: isPro ? "UNLIMITED" : (user.credits - RESUME_OPTIMIZER_CREDITS)
      }
    } as ResumeAnalysisResultWithCredits);
  } catch (error) {
    console.error('Error in resume analysis:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: errorMessage },
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
      select: {
        id: true,
        userId: true,
        originalFilename: true,
        fileUrl: true,
        totalScore: true,
        sectionScores: true,
        detailedBreakdown: true,
        keywordMatchRate: true,
        missingKeywords: true,
        improvementSuggestions: true,
        improvementDetails: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Parse JSON fields
    const formattedAnalyses = analyses.map(analysis => ({
      ...analysis,
      createdAt: analysis.createdAt.toISOString(),
      updatedAt: analysis.updatedAt.toISOString(),
    }));

    return NextResponse.json({ 
      success: true, 
      analyses: formattedAnalyses 
    });
  } catch (error) {
    console.error('Error fetching resume analyses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resume analyses' },
      { status: 500 }
    );
  }
} 