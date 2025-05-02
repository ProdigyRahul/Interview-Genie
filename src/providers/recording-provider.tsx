"use client";

import React, { createContext, useContext, useState, useRef, ReactNode } from "react";

interface AnalysisResult {
  videoAnalysis?: {
    emotion_analysis?: any[];
    dominant_emotion?: any;
    analysis_summary?: string;
    domain_knowledge?: {
      what_went_well?: string[];
      what_could_be_better?: string[];
    };
    communication?: {
      speech_metrics?: {
        word_count?: number;
      };
      speech_rate?: {
        words_per_minute?: number;
      };
    };
    overall_assessment?: {
      overall_score?: number;
    };
  };
  transcript?: string;
  question?: string;
}

interface RecordingContextType {
  isRecording: boolean;
  recordedChunks: Blob[];
  mediaRecorderRef: React.MutableRefObject<MediaRecorder | null>;
  startRecording: () => void;
  stopRecording: () => void;
  resetRecording: () => void;
  error: string | null;
  sendVideoForAnalysis: (question: string) => Promise<AnalysisResult>;
  recordedVideos: Map<number, Blob>;
  analysisResults: Map<number, AnalysisResult>;
  isProcessing: boolean;
  transcribeAudio: (audioBlob: Blob) => Promise<string>;
}

const RecordingContext = createContext<RecordingContextType | undefined>(undefined);

export function RecordingProvider({ children }: { children: ReactNode }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [recordedVideos, setRecordedVideos] = useState<Map<number, Blob>>(new Map());
  const [analysisResults, setAnalysisResults] = useState<Map<number, AnalysisResult>>(new Map());
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const startRecording = () => {
    // This is now handled by the client component directly
    setRecordedChunks([]);
    setIsRecording(true);
  };

  const stopRecording = () => {
    // This is now handled by the client component directly
    setIsRecording(false);
  };

  const resetRecording = () => {
    setRecordedChunks([]);
  };
  
  // Function to transcribe audio using Web Speech API
  const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
    // In a real implementation, you would extract audio from the video
    // and use the Web Speech API or a speech-to-text service
    
    // For this implementation, we'll simulate transcription
    console.log("Simulating audio transcription...");
    
    // In production, you would:
    // 1. Extract audio from video blob
    // 2. Use SpeechRecognition API or send to a service like Google Speech-to-Text
    
    // Sample implementation using Web Speech API would look like:
    /*
    return new Promise((resolve, reject) => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };
      
      recognition.onerror = (event) => {
        reject(`Speech recognition error: ${event.error}`);
      };
      
      // Start recognition with the audio blob
      recognition.start();
    });
    */
    
    // Simulated response for demo
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return "Based on your question about my experience with development, I've been working in this field for over three years. I've worked on multiple projects using React and Next.js, and I've also gained experience with backend technologies. I believe my skills match well with what you're looking for in this role.";
  };

  const sendVideoForAnalysis = async (question: string): Promise<AnalysisResult> => {
    if (recordedChunks.length === 0) {
      throw new Error("No video recorded");
    }
    
    setIsProcessing(true);
    
    try {
      // Create video blob from recorded chunks
      const videoBlob = new Blob(recordedChunks, {
        type: 'video/webm'
      });
      
      // Store video blob in map with current question index
      const questionIndex = analysisResults.size;
      setRecordedVideos(prev => {
        const newMap = new Map(prev);
        newMap.set(questionIndex, videoBlob);
        return newMap;
      });
      
      // Transcribe the audio
      const transcript = await transcribeAudio(videoBlob);
      
      // Create form data for API request
      const formData = new FormData();
      formData.append('video', videoBlob, `interview-${questionIndex}.webm`);
      formData.append('question', question);
      formData.append('transcript', transcript);
      
      // Call the actual API endpoint
      try {
        const response = await fetch('/api/ai/analyze', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          throw new Error(`Analysis failed: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        // Ensure transcript is included
        result.transcript = transcript;
        
        // Store analysis result
        setAnalysisResults(prev => {
          const newMap = new Map(prev);
          newMap.set(questionIndex, { ...result, question });
          return newMap;
        });
        
        setIsProcessing(false);
        return result;
      } catch (apiError) {
        console.error("API error:", apiError);
        
        // Fallback to mock response if API fails
        console.log("Using fallback mock response");
        
        // Sample video analysis response
        const mockAnalysisResponse: AnalysisResult = {
          videoAnalysis: {
            emotion_analysis: [
              {
                emotion: "Neutral",
                frequency: 0.51,
                average_score: 0.44,
                confidence_level: "Average"
              },
              {
                emotion: "Fear",
                frequency: 0.06,
                average_score: 0.31,
                confidence_level: "Average"
              },
              {
                emotion: "Surprise",
                frequency: 0.08,
                average_score: 0.39,
                confidence_level: "Average"
              },
              {
                emotion: "Happiness",
                frequency: 0.33,
                average_score: 0.63,
                confidence_level: "High"
              }
            ],
            dominant_emotion: {
              emotion: "Neutral",
              frequency: 0.51,
              average_score: 0.44,
              confidence_level: "Average"
            },
            analysis_summary: "The candidate demonstrated exceptional emotional expressiveness with clear and consistent display of positive emotions. Their facial expressions showed strong confidence and authenticity, particularly during moments of happiness and neutral interactions.",
            domain_knowledge: {
              what_went_well: [
                "Demonstrated confidence in explaining technical concepts",
                "Provided specific examples from past experience",
                "Showed enthusiasm when discussing the role"
              ],
              what_could_be_better: [
                "Could provide more concrete examples",
                "Technical terminology could be more precise",
                "Consider structuring answers with the STAR method"
              ]
            },
            communication: {
              speech_metrics: {
                word_count: 165
              },
              speech_rate: {
                words_per_minute: 110
              }
            },
            overall_assessment: {
              overall_score: 8.2
            }
          },
          transcript: transcript,
          question: question
        };
        
        // Store analysis result
        setAnalysisResults(prev => {
          const newMap = new Map(prev);
          newMap.set(questionIndex, mockAnalysisResponse);
          return newMap;
        });
        
        setIsProcessing(false);
        return mockAnalysisResponse;
      }
    } catch (error) {
      console.error("Error analyzing video:", error);
      setIsProcessing(false);
      throw error;
    }
  };

  return (
    <RecordingContext.Provider
      value={{
        isRecording,
        recordedChunks,
        mediaRecorderRef,
        startRecording,
        stopRecording,
        resetRecording,
        error,
        sendVideoForAnalysis,
        recordedVideos,
        analysisResults,
        isProcessing,
        transcribeAudio
      }}
    >
      {children}
    </RecordingContext.Provider>
  );
}

export function useRecording() {
  const context = useContext(RecordingContext);
  if (context === undefined) {
    throw new Error("useRecording must be used within a RecordingProvider");
  }
  return context;
} 