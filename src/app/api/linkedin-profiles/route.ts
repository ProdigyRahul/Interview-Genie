import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
export const fetchCache = "force-no-store";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          profiles: [],
        },
        { status: 401 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
          profiles: [],
        },
        { status: 404 },
      );
    }

    // In a real implementation, you would fetch LinkedIn profiles from the database
    // For now, return mock data
    const mockProfiles = [
      {
        id: "linkedin-abc123",
        title: "Software Engineer Profile",
        profileUrl: "https://linkedin.com/in/johndoe",
        profileName: "John Doe",
        optimizationScore: 78,
        analysisResults: {
          optimization_suggestions: {
            headline_improvements: [
              {
                current_text: "Senior Software Developer at Tech Company",
                issue: "Generic title lacks specific technologies and focus areas",
                suggestion: "Senior Full-Stack Developer | React/Node.js Expert | Cloud Infrastructure (AWS) | Tech Leadership",
                impact: "More discoverable by recruiters searching for specific technologies"
              }
            ],
            summary_improvements: [],
            experience_improvements: [],
            education_improvements: [],
            skills_improvements: []
          },
          section_priorities: [
            {
              section: "Headline",
              priority: "high",
              reason: "First thing recruiters see and critical for search visibility",
              potential_impact: "Can increase profile views by up to 30% with optimized keywords"
            }
          ],
          quick_wins: [
            {
              action: "Add 5+ relevant skills that include specific technologies",
              effort: "low",
              impact: "Improves search visibility by 15-20%"
            }
          ]
        },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        fileUrl: "/sample-linkedin-report.pdf"
      },
      {
        id: "linkedin-def456",
        title: "Product Manager Profile",
        profileUrl: "https://linkedin.com/in/janesmith",
        profileName: "Jane Smith",
        optimizationScore: 85,
        analysisResults: {
          optimization_suggestions: {
            headline_improvements: [],
            summary_improvements: [
              {
                current_text: "Product manager with experience in tech.",
                issue: "Too vague and lacks specific achievements",
                suggestion: "Results-driven Product Manager with 5+ years leading SaaS products from concept to market. Increased user acquisition by 40% and retention by 25% through data-driven strategy and cross-functional leadership.",
                impact: "Communicates specific value and capabilities to potential employers"
              }
            ],
            experience_improvements: [],
            education_improvements: [],
            skills_improvements: []
          },
          section_priorities: [
            {
              section: "Summary",
              priority: "medium",
              reason: "Current summary lacks impact metrics",
              potential_impact: "Significantly improves first impression and communicates your unique value"
            }
          ],
          quick_wins: [
            {
              action: "Add quantifiable results to each job experience (numbers, percentages)",
              effort: "medium",
              impact: "Makes achievements concrete and memorable"
            }
          ]
        },
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        fileUrl: "/sample-linkedin-report-2.pdf"
      }
    ];

    return NextResponse.json({
      success: true,
      profiles: mockProfiles,
    });
  } catch (error) {
    console.error("Error fetching LinkedIn profiles:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch LinkedIn profiles",
        profiles: [],
      },
      { status: 500 },
    );
  }
}

// Handle preflight requests
export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      Allow: "GET, OPTIONS",
      "Content-Type": "application/json",
    },
  });
} 