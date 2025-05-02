import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Define interface for emotion analysis
interface EmotionAnalysis {
  emotion: string;
  frequency: number;
  average_score: number;
  confidence_level: string;
}

// Define interface for analysis response
interface AnalysisResponse {
  success: boolean;
  videoAnalysis: {
    emotion_analysis: EmotionAnalysis[];
    dominant_emotion: {
      emotion: string;
      frequency: number;
      average_score: number;
      confidence_level: string;
    };
    confidence_analysis: {
      High: {
        percentage: number;
        emotions: [string, number][];
      };
      Average: {
        percentage: number;
        emotions: [string, number][];
      };
      Low: {
        percentage: number;
        emotions: [string, number][];
      };
    };
    dominant_confidence: string;
    confidence_summary: string;
    analysis_summary: string;
    domain_knowledge: {
      what_went_well: string[];
      what_could_be_better: string[];
    };
    communication: {
      speech_metrics: {
        word_count: number;
      };
      speech_rate: {
        words_per_minute: number;
      };
    };
    overall_assessment: {
      overall_score: number;
    };
  };
  transcript: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const videoFile = formData.get("video") as File | null;
    const question = formData.get("question") as string | null;
    const transcript = formData.get("transcript") as string | null;

    console.log("API received:", { 
      hasVideo: !!videoFile, 
      question, 
      hasTranscript: !!transcript 
    });

    if (!videoFile) {
      return NextResponse.json(
        { error: "No video file provided" },
        { status: 400 }
      );
    }

    // Save video to uploads directory for debugging
    try {
      const uploadDir = path.join(process.cwd(), "public/uploads/interviews");
      const fileName = `${uuidv4()}.webm`;
      const filePath = path.join(uploadDir, fileName);
      
      const bytes = await videoFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      await writeFile(filePath, buffer);
      console.log("Video saved to:", filePath);
    } catch (saveError) {
      console.error("Error saving video (non-fatal):", saveError);
      // Continue processing even if save fails
    }

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Use the provided transcript if available
    const actualTranscript = transcript || 
      "Based on your question about my experience with development, I've been working in this field for over three years. I've worked on multiple projects using React and Next.js, and I've also gained experience with backend technologies. I believe my skills match well with what you're looking for in this role.";

    // Mock video analysis response
    const analysisResponse: AnalysisResponse = {
      success: true,
      videoAnalysis: {
        emotion_analysis: [
          {
            emotion: "Neutral",
            frequency: 0.5176470588235295,
            average_score: 0.4480846801942045,
            confidence_level: "Average",
          },
          {
            emotion: "Fear",
            frequency: 0.06470588235294118,
            average_score: 0.3149234381589023,
            confidence_level: "Average",
          },
          {
            emotion: "Surprise",
            frequency: 0.08235294117647059,
            average_score: 0.393436712878091,
            confidence_level: "Average",
          },
          {
            emotion: "Happiness",
            frequency: 0.3352941176470588,
            average_score: 0.631653963996653,
            confidence_level: "High",
          },
        ],
        dominant_emotion: {
          emotion: "Neutral",
          frequency: 0.5176470588235295,
          average_score: 0.4480846801942045,
          confidence_level: "Average",
        },
        confidence_analysis: {
          High: {
            percentage: 92.94871794871796,
            emotions: [
              ["Neutral", 0.5176470588235295],
              ["Happiness", 0.3352941176470588],
            ],
          },
          Average: {
            percentage: 0.0,
            emotions: [],
          },
          Low: {
            percentage: 7.051282051282051,
            emotions: [["Fear", 0.06470588235294118]],
          },
        },
        dominant_confidence: "High",
        confidence_summary:
          "Video shows predominantly high-confidence emotions (Happiness/Neutral)\nHigh confidence emotions: Neutral: 51.8%, Happiness: 33.5%\nLow confidence emotions: Fear: 6.5%",
        analysis_summary:
          "The candidate demonstrated exceptional emotional expressiveness with clear and consistent display of positive emotions. Their facial expressions showed strong confidence and authenticity, particularly during moments of happiness and neutral interactions. This suggests a high level of emotional intelligence and ability to maintain composed, positive engagement throughout the video.",
        domain_knowledge: {
          what_went_well: [
            "Demonstrated confidence in explaining technical concepts",
            "Provided specific examples from past experience",
            "Showed enthusiasm when discussing the role",
          ],
          what_could_be_better: [
            "Could provide more concrete examples",
            "Technical terminology could be more precise",
            "Consider structuring answers with the STAR method",
          ],
        },
        communication: {
          speech_metrics: {
            word_count: actualTranscript.split(' ').length,
          },
          speech_rate: {
            words_per_minute: 110,
          },
        },
        overall_assessment: {
          overall_score: 8.2,
        },
      },
      transcript: actualTranscript,
    };

    return NextResponse.json(analysisResponse, { status: 200 });
  } catch (error) {
    console.error("Error processing video:", error);
    return NextResponse.json(
      { error: "Failed to process video" },
      { status: 500 }
    );
  }
}

// Add a GET method to test if the API is working
export async function GET() {
  return NextResponse.json({
    status: "success",
    message: "Interview Analysis API is running"
  });
}
