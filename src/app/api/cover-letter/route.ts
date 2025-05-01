import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { google, MODEL_NAME } from "@/lib/google";
import { generateText } from "ai";
import {type GoogleGenerativeAIProviderOptions } from '@ai-sdk/google';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { jsPDF } from "jspdf";

// Define feature credit costs
const COVER_LETTER_CREDITS = 20;

// Use Node.js runtime
export const dynamic = 'force-dynamic';
// Configure longer timeout for AI processing
export const maxDuration = 60; // 60 seconds timeout

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
    if (!isPro && user.credits < COVER_LETTER_CREDITS) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Not enough credits. Cover Letter Builder requires ${COVER_LETTER_CREDITS} credits.` 
        },
        { status: 402 }
      );
    }

    const data = await request.json();
    
    // Basic validation
    if (!data.fullName || !data.email || !data.phone || !data.companyName || !data.jobTitle) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Format key points for the prompt
    const keyPointsText = data.keyPoints && data.keyPoints.length > 0
      ? "Key points to emphasize:\n" + data.keyPoints.map((point: string) => `- ${point}`).join("\n")
      : "";
    
    // Set up customization parameters
    const tone = data.customization?.tone || "professional";
    const style = data.customization?.style || "modern";
    const length = data.customization?.length || "medium";
    
    // Generate cover letter using Gemini AI
    const { text: coverLetterText } = await generateText({
      model: google(MODEL_NAME, {
        safetySettings: [
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_LOW_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_LOW_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_LOW_AND_ABOVE' },
          { category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_LOW_AND_ABOVE' }
        ]
      }),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Generate a high-quality cover letter with the following information:
              
Full Name: ${data.fullName}
Email: ${data.email}
Phone: ${data.phone}
Company Name: ${data.companyName}
Job Title: ${data.jobTitle}
Hiring Manager: ${data.hiringManager || "Hiring Manager"}

${keyPointsText}

Customization:
- Tone: ${tone} (professional, friendly, confident)
- Style: ${style} (modern, traditional, creative)
- Length: ${length} (short, medium, long)

Please provide the response as a JSON object with the following structure:
{
  "content": {
    "full_letter": "The complete cover letter text with proper formatting",
    "sections": {
      "header": "Contact information and date",
      "greeting": "Salutation to hiring manager",
      "introduction": "Opening paragraph",
      "body": "Main content paragraphs",
      "closing": "Closing paragraph",
      "signature": "Signature line"
    },
    "analysis": {
      "strengths": ["Strength 1", "Strength 2"],
      "suggestions": ["Suggestion 1", "Suggestion 2"]
    }
  }
}

The cover letter should be formal, persuasive, and highlight the candidate's relevant skills and enthusiasm for the role.`
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

    // Parse AI response
    let coverLetterData;
    try {
      // Clean up any potential markdown formatting
      const cleanedText = coverLetterText
        .replace(/```json\s*/g, '')
        .replace(/```\s*$/g, '')
        .trim();
      
      coverLetterData = JSON.parse(cleanedText);
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return NextResponse.json(
        { error: "Failed to generate cover letter content" },
        { status: 500 }
      );
    }

    // Generate PDF file
    const uniqueFilename = `${uuidv4()}.pdf`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'cover-letters');
    const filePath = path.join(uploadDir, uniqueFilename);
    
    // Ensure upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Generate the public URL
    const fileUrl = `/uploads/cover-letters/${uniqueFilename}`;

    // Create PDF
    try {
      const doc = new jsPDF();
      
      // Add content - split long text into lines to fit page width
      const splitText = doc.splitTextToSize(coverLetterData.content.full_letter, 180);
      doc.text(splitText, 15, 15);
      
      // Save the PDF to the server
      fs.writeFileSync(filePath, Buffer.from(doc.output('arraybuffer')));
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Continue even if PDF fails - we'll still save the content
    }

    // Store in database and deduct credits
    const [coverLetter] = await db.$transaction([
      // 1. Create the cover letter
      db.coverLetter.create({
        data: {
          userId: session.user.id,
          title: `Cover Letter for ${data.jobTitle} at ${data.companyName}`,
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          companyName: data.companyName,
          jobTitle: data.jobTitle,
          hiringManager: data.hiringManager || null,
          keyPoints: data.keyPoints || [],
          customization: data.customization || { tone: "professional", style: "modern", length: "medium" },
          content: coverLetterData.content.full_letter,
          fileUrl: fileUrl
        }
      }),
      
      // 2. Deduct credits if not a PRO user
      ...(!isPro ? [
        db.user.update({
          where: { id: user.id },
          data: { 
            credits: {
              decrement: COVER_LETTER_CREDITS
            }
          },
        })
      ] : [])
    ]);

    // Return success response with cover letter data
    return NextResponse.json({
      success: true,
      id: coverLetter.id,
      content: coverLetterData.content,
      fileUrl: fileUrl,
      creditsRemaining: isPro ? "UNLIMITED" : (user.credits - COVER_LETTER_CREDITS),
      creditsCost: COVER_LETTER_CREDITS
    });
  } catch (error) {
    console.error('Error in cover letter generation:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve user's cover letters
export async function GET(_request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const coverLetters = await db.coverLetter.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        companyName: true,
        jobTitle: true,
        content: true,
        fileUrl: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      success: true,
      coverLetters
    });
  } catch (error) {
    console.error('Error fetching cover letters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cover letters' },
      { status: 500 }
    );
  }
} 