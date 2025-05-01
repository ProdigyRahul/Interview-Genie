import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { writeFile } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { google, MODEL_NAME } from "@/lib/google";
import { generateText } from "ai";
import { GoogleGenerativeAIProviderOptions } from '@ai-sdk/google';
import fs from "fs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300; // Increased timeout for PDF processing
export const fetchCache = "force-no-store";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Process multipart form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    
    // Validate file
    if (!file || !file.type.includes("pdf")) {
      return NextResponse.json(
        { success: false, error: "PDF file is required" },
        { status: 400 }
      );
    }

    // Generate a unique ID for the file
    const uniqueId = uuidv4();
    const fileName = `${uniqueId}-${file.name.replace(/\s+/g, "_")}`;
    const uploadDir = join(process.cwd(), "public", "uploads", "linkedin-profiles");
    
    // Ensure upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const filePath = join(uploadDir, fileName);
    const fileUrl = `/uploads/linkedin-profiles/${fileName}`;

    // Convert file to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Save file to disk
    await writeFile(filePath, buffer);

    // Extract profile data from the form
    const profileName = formData.get("profileName") as string || "LinkedIn Profile";
    const profileUrl = formData.get("profileUrl") as string || "";
    const title = formData.get("title") as string || `${profileName}'s LinkedIn Profile`;

    // Generate prompt for Gemini AI
    const prompt = `
      You are a senior LinkedIn profile optimization expert with 10+ years of experience helping professionals improve their profiles. Analyze this profile thoroughly and provide comprehensive, detailed suggestions for improvement.

      Conduct a detailed analysis focusing on:
      1. Professional Branding
      2. Keyword Optimization
      3. Achievement Highlighting
      4. Metrics and Impact
      5. Industry Best Practices
      6. Engagement Factors
      7. Recruiter Search Optimization

      For EACH section:
      - Identify ALL areas that could be improved
      - Look for missing elements, weak phrases, and missed opportunities
      - Suggest specific metrics and achievements that could be added
      - Recommend industry-specific keywords and phrases
      - Point out any generic or weak language that should be replaced
      - Identify opportunities to showcase leadership and impact

      Provide your detailed analysis in the following JSON format (maintain exact structure):
      {
          "optimization_score": number,
          "optimization_suggestions": {
              "headline_improvements": [
                  {
                      "current_text": "exact text from profile",
                      "issue": "specific issue identified",
                      "suggestion": "specific rewrite",
                      "impact": "expected outcome"
                  }
              ],
              "summary_improvements": [
                  {
                      "current_text": "exact text from profile",
                      "issue": "specific issue identified",
                      "suggestion": "specific rewrite",
                      "impact": "expected outcome"
                  }
              ],
              "experience_improvements": [
                  {
                      "current_text": "exact text from profile",
                      "issue": "specific issue identified",
                      "suggestion": "specific rewrite",
                      "impact": "expected outcome"
                  }
              ],
              "education_improvements": [
                  {
                      "current_text": "exact text from profile",
                      "issue": "specific issue identified",
                      "suggestion": "specific rewrite",
                      "impact": "expected outcome"
                  }
              ],
              "skills_improvements": [
                  {
                      "current_text": "exact text from profile",
                      "issue": "specific issue identified",
                      "suggestion": "specific addition or change",
                      "impact": "expected outcome"
                  }
              ]
          },
          "section_priorities": [
              {
                  "section": "section name",
                  "priority": "high/medium/low",
                  "reason": "why this needs attention",
                  "potential_impact": "expected outcome"
              }
          ],
          "quick_wins": [
              {
                  "action": "specific quick improvement",
                  "effort": "low/medium/high",
                  "impact": "expected outcome"
              }
          ]
      }

      Important requirements:
      1. Provide AT LEAST 3-4 detailed suggestions for each section that needs improvement
      2. Focus on high-impact, specific changes that will significantly improve profile visibility
      3. Include exact quotes from the profile when identifying issues
      4. Provide detailed, specific rewrites with industry-relevant keywords
      5. Explain the concrete impact of each suggested change
      6. Prioritize suggestions that add measurable achievements and metrics
      7. Include specific examples and industry best practices
      8. Identify opportunities to add leadership examples and impact statements
      9. Suggest ways to improve recruiter searchability
      10. Keep arrays empty ONLY if a section truly needs no improvement

      Remember to maintain valid JSON structure while providing comprehensive suggestions.
    `;

    // Read the PDF file
    const fileBytes = await file.arrayBuffer();
    const fileBase64 = Buffer.from(fileBytes).toString("base64");

    // Use Vercel AI SDK to generate content with Gemini
    const result = await generateText({
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
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "file",
              data: fileBase64,
              mimeType: "application/pdf",
            }
          ]
        }
      ],
      // Add provider options similar to resume-analysis
      providerOptions: {
        google: {
          responseModalities: ['TEXT']
          
        } satisfies GoogleGenerativeAIProviderOptions
      }
    });

    const responseText = result.text;

    // Process the AI response - extract and clean JSON
    let analysisData;
    try {
      // Clean up any potential markdown formatting
      const cleanedResponse = responseText
        .replace(/```json\s*/g, '')
        .replace(/```\s*$/g, '')
        .trim();
      
      // Parse the JSON string
      analysisData = JSON.parse(cleanedResponse);
      
      // Ensure the response has the expected structure
      analysisData = sanitizeResponseData(analysisData);
      
      // Validate the required fields exist
      if (!analysisData.optimization_score || 
          !analysisData.optimization_suggestions ||
          !analysisData.section_priorities ||
          !analysisData.quick_wins) {
        console.warn("AI response missing some expected fields:", Object.keys(analysisData));
      }
    } catch (error) {
      console.error("Error parsing AI response:", error);
      console.log("Raw response:", responseText.substring(0, 200) + "...");
      throw new Error("Failed to parse AI response as valid JSON");
    }

    const optimizationScore = analysisData.optimization_score || 75;

    // Save the profile to the database
    try {
      const linkedInProfile = await db.linkedInProfile.create({
        data: {
          userId: user.id,
          title,
          profileName,
          profileUrl,
          originalFilename: file.name,
          fileUrl,
          optimizationScore,
          analysisResults: analysisData,
        },
      });

      return NextResponse.json({
        success: true,
        profile: linkedInProfile,
      });
    } catch (dbError) {
      console.error("Database error creating LinkedIn profile:", dbError);
      return NextResponse.json(
        { 
          success: false, 
          error: dbError instanceof Error ? dbError.message : "Failed to save profile to database"
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error processing LinkedIn profile:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to process LinkedIn profile" 
      },
      { status: 500 }
    );
  }
}

/**
 * Ensures the AI response has the expected structure and types
 */
function sanitizeResponseData(data: any): any {
  const sanitized: any = {
    optimization_score: typeof data.optimization_score === 'number' ? 
      data.optimization_score : (parseInt(data.optimization_score) || 75),
    optimization_suggestions: {
      headline_improvements: Array.isArray(data.optimization_suggestions?.headline_improvements) ? 
        data.optimization_suggestions.headline_improvements : [],
      summary_improvements: Array.isArray(data.optimization_suggestions?.summary_improvements) ? 
        data.optimization_suggestions.summary_improvements : [],
      experience_improvements: Array.isArray(data.optimization_suggestions?.experience_improvements) ? 
        data.optimization_suggestions.experience_improvements : [],
      education_improvements: Array.isArray(data.optimization_suggestions?.education_improvements) ? 
        data.optimization_suggestions.education_improvements : [],
      skills_improvements: Array.isArray(data.optimization_suggestions?.skills_improvements) ? 
        data.optimization_suggestions.skills_improvements : []
    },
    section_priorities: Array.isArray(data.section_priorities) ? data.section_priorities : [],
    quick_wins: Array.isArray(data.quick_wins) ? data.quick_wins : []
  };
  
  return sanitized;
}

// Handle preflight requests
export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      Allow: "POST, OPTIONS",
      "Content-Type": "application/json",
    },
  });
} 