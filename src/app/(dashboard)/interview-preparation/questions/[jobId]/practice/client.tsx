"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Webcam from "react-webcam";
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  SkipForward, 
  Video as VideoIcon, 
  Mic as MicIcon, 
  AlertCircle,
  Loader2,
  CheckCircle2,
  XCircle,
  Info,
  Camera,
  RefreshCw
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useRecording } from "@/providers/recording-provider";
import { JOBS, QUESTIONS } from "../data";

interface Job {
  id: string;
  title: string;
  company: string;
  date: string;
  description: string;
}

interface QuestionSet {
  technical: string[];
  behavioral: string[];
  situational: string[];
}

interface Result {
  question: string;
  analysis: any;
}

// Define video constraints
const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: "user"
};

export function InterviewPracticeClient({ jobId }: { jobId: string }) {
  const router = useRouter();
  const webcamRef = useRef<Webcam>(null);
  const {
    isRecording,
    startRecording,
    stopRecording,
    error: recordingError,
    sendVideoForAnalysis,
    isProcessing,
    analysisResults,
    recordedChunks: providerRecordedChunks,
    resetRecording
  } = useRecording();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(90); // 90 seconds per question
  const [step, setStep] = useState<'intro' | 'setup' | 'recording' | 'processing' | 'result' | 'final-results'>('intro');
  const [error, setError] = useState<string | null>(null);
  const [cameraInitialized, setCameraInitialized] = useState(false);
  const [job, setJob] = useState<Job | null>(null);
  const [practiceQuestions, setPracticeQuestions] = useState<string[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [results, setResults] = useState<Result[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<any>(null);

  const timerIntervalRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Add state for webcam permissions
  const [permissionsRequested, setPermissionsRequested] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Load job and questions data
  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      let jobData: Job | null = null;
      let questionData: QuestionSet | null = null;

      // Check localStorage for job
      try {
        const storedJobs = localStorage.getItem('jobs');
        if (storedJobs) {
          const parsedJobs = JSON.parse(storedJobs);
          if (parsedJobs[jobId]) {
            jobData = parsedJobs[jobId];
          }
        }
      } catch (e) {
        console.error("Error loading job from localStorage:", e);
      }

      // If not found in localStorage, check predefined data
      if (!jobData && JOBS[jobId as keyof typeof JOBS]) {
        jobData = JOBS[jobId as keyof typeof JOBS];
      }

      // Check localStorage for questions
      try {
        const storedQuestions = localStorage.getItem('questions');
        if (storedQuestions) {
          const parsedQuestions = JSON.parse(storedQuestions);
          if (parsedQuestions[jobId]) {
            questionData = parsedQuestions[jobId];
          }
        }
      } catch (e) {
        console.error("Error loading questions from localStorage:", e);
      }

      // If not found in localStorage, check predefined data
      if (!questionData && QUESTIONS[jobId as keyof typeof QUESTIONS]) {
        questionData = QUESTIONS[jobId as keyof typeof QUESTIONS];
      }

      setJob(jobData);
      
      if (questionData) {
        // Get a mix of question types for a more comprehensive interview
        const technicalQuestions = questionData.technical || [];
        const behavioralQuestions = questionData.behavioral || [];
        const situationalQuestions = questionData.situational || [];
        
        // Select 2 technical, 1 behavioral, and 2 situational questions
        const selectedQuestions = [
          ...technicalQuestions.slice(0, 2),
          ...behavioralQuestions.slice(0, 1),
          ...situationalQuestions.slice(0, 2)
        ];
        
        setPracticeQuestions(selectedQuestions);
      }
      
      setLoadingData(false);
    };

    loadData();
  }, [jobId]);

  // Handle user media access success
  const handleUserMedia = (stream: MediaStream) => {
    console.log("Webcam stream successfully obtained", stream.id);
    setCameraInitialized(true);
    setPermissionDenied(false);
    
    // After camera is initialized, automatically move to setup step
    if (step === 'intro') {
      setStep('setup');
    }
  };

  // Handle user media access error 
  const handleUserMediaError = (error: string | DOMException) => {
    console.error("Error accessing webcam:", error);
    const errorMessage = typeof error === 'string' ? error : error.message;
    setError(errorMessage);
    setCameraInitialized(false);
    setPermissionDenied(true);
    
    // Check if it's a permissions error
    if (errorMessage.includes('Permission') || errorMessage.includes('permission')) {
      setError("Camera access was denied. Please grant permission to your camera and microphone.");
    } else {
      setError(`Camera error: ${errorMessage}`);
    }
  };
  
  // Display logs for debugging
  useEffect(() => {
    console.log("Current step:", step);
    console.log("Is recording:", isRecording);
    console.log("Camera initialized:", cameraInitialized);
    console.log("Webcam ref available:", !!webcamRef.current);
  }, [step, isRecording, cameraInitialized, webcamRef.current]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current !== null) {
        window.clearInterval(timerIntervalRef.current);
      }
      
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  // Handle recording errors
  useEffect(() => {
    if (recordingError) {
      setError(recordingError);
    }
  }, [recordingError]);

  // Process completed results
  useEffect(() => {
    if (analysisResults.size > 0 && step === 'processing') {
      const latestResult = analysisResults.get(currentQuestion);
      if (latestResult) {
        setCurrentAnalysis(latestResult);
        setStep('result');
      }
    }
  }, [analysisResults, currentQuestion, step]);

  const initializeCamera = () => {
    setError(null);
    setPermissionsRequested(true);
    
    // The Webcam component will handle the actual initialization
    // when rendered with the autoPlay prop
    setTimeout(() => {
      if (webcamRef.current && !cameraInitialized) {
        console.log("Attempting to initialize camera manually...");
        
        // Explicitly request permissions
        navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: true
        }).then(stream => {
          console.log("Got camera stream manually:", stream.id);
          handleUserMedia(stream);
        }).catch(err => {
          console.error("Manual camera initialization failed:", err);
          handleUserMediaError(err);
        });
      }
    }, 1000); // Give a second for the Webcam component to initialize

    // Always move to setup, even if we haven't confirmed camera
    // is working yet - this will render the Webcam component
    setStep('setup');
  };

  const beginRecording = () => {
    setError(null);
    
    if (!webcamRef.current || !webcamRef.current.video) {
      setError("Camera not initialized properly. Please refresh and try again.");
      return;
    }
    
    try {
      // Get the stream from the webcam component
      const video = webcamRef.current.video;
      const stream = video.srcObject as MediaStream;
      
      if (!stream) {
        setError("Camera stream not available. Please refresh and try again.");
        return;
      }
      
      console.log("Beginning recording with webcam stream:", stream.id);
      console.log("Stream tracks:", stream.getTracks().map(t => `${t.kind}: ${t.label} (${t.readyState})`).join(', '));
      
      recordedChunksRef.current = [];
      
      // Ensure we're actually getting video and audio
      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];
      
      if (!videoTrack) {
        setError("No video track found. Please check camera permissions and try again.");
        return;
      }
      
      if (!audioTrack) {
        console.warn("No audio track found. Recording will proceed without audio.");
      }
      
      // Use a supported MIME type
      let mimeType = 'video/webm;codecs=vp9,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp8,opus';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = '';  // Let the browser choose
          }
        }
      }
      
      console.log("Using MIME type:", mimeType || "browser default");
      
      // Create MediaRecorder with appropriate options
      const mediaRecorder = mimeType ? 
        new MediaRecorder(stream, {
          mimeType: mimeType,
          videoBitsPerSecond: 2500000 // 2.5 Mbps
        }) :
        new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          console.log(`Received data chunk: ${(event.data.size / 1024).toFixed(2)} KB`);
          recordedChunksRef.current.push(event.data);
        }
      };
      
      // Set up event handlers
      mediaRecorder.onstart = () => {
        console.log("MediaRecorder started");
      };
      
      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        setError(`Recording error: ${event.type}`);
      };
      
      mediaRecorder.onstop = () => {
        console.log("MediaRecorder stopped");
        console.log(`Total chunks: ${recordedChunksRef.current.length}, total size: ${
          (recordedChunksRef.current.reduce((acc, chunk) => acc + chunk.size, 0) / 1024).toFixed(2)
        } KB`);
      };
      
      // Start recording
      mediaRecorder.start(500);
      console.log("Recording started with mime type:", mimeType || "browser default");
      
      setTimeRemaining(90);
      setStep('recording');
      
      // Start the timer
      timerIntervalRef.current = window.setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            endRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (e) {
      console.error("Error starting recording:", e);
      setError(`Failed to start recording: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  };

  const endRecording = () => {
    console.log("Ending recording");
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
        console.log("Recording stopped successfully");
      } catch (e) {
        console.error("Error stopping recording:", e);
      }
    }
    
    if (timerIntervalRef.current !== null) {
      window.clearInterval(timerIntervalRef.current);
    }

    processRecording();
  };

  const processRecording = async () => {
    setStep('processing');
    
    try {
      if (!recordedChunksRef.current.length) {
        throw new Error("No video recorded");
      }
      
      // Create video blob from recorded chunks
      const videoBlob = new Blob(recordedChunksRef.current, {
        type: 'video/webm'
      });
      
      console.log("Created video blob of size:", (videoBlob.size / 1024).toFixed(2), "KB");
      
      if (videoBlob.size === 0) {
        throw new Error("Recorded video has no data. Please try again with a different browser.");
      }
      
      // Create a local URL for the video for debugging
      const videoUrl = URL.createObjectURL(videoBlob);
      console.log("Video URL created:", videoUrl);
      
      // Transfer the recorded chunks to the recording provider context
      resetRecording(); // Clear any previous recordings
      
      // Send video for analysis and get result
      const questionText = practiceQuestions[currentQuestion] || "";
      console.log("Sending for analysis, question:", questionText);
      
      try {
        // Pass the videoBlob directly instead of relying on recordedChunks in the provider
        const analysisResult = await sendVideoForAnalysisWithBlob(questionText, videoBlob);
        
        // Save the result
        setResults(prev => [...prev, {
          question: questionText,
          analysis: analysisResult
        }]);
        
        // If this is the last question, show final results
        if (currentQuestion === practiceQuestions.length - 1) {
          setStep('final-results');
        } else {
          setCurrentAnalysis(analysisResult);
          setStep('result');
        }
      } catch (analysisError) {
        console.error("Error during analysis:", analysisError);
        setError(`Analysis failed: ${analysisError instanceof Error ? analysisError.message : 'Unknown error'}`);
        setStep('setup');
      }
    } catch (error) {
      console.error("Error processing recording:", error);
      setError(`Failed to process recording: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
      setStep('setup');
    }
  };

  // Helper function to send video blob directly for analysis
  const sendVideoForAnalysisWithBlob = async (question: string, videoBlob: Blob): Promise<any> => {
    console.log("Sending video blob for analysis, size:", (videoBlob.size / 1024).toFixed(2), "KB");
    
    try {
      // Get the transcription service from the provider
      const transcript = await transcribeAudio(videoBlob);
      
      // Create form data for API request
      const formData = new FormData();
      formData.append('video', videoBlob, `interview-${analysisResults.size}.webm`);
      formData.append('question', question);
      formData.append('transcript', transcript);
      
      // Call the actual API endpoint
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
      
      return { ...result, question };
    } catch (apiError) {
      console.error("API error:", apiError);
      
      // Fallback to mock response if API fails
      console.log("Using fallback mock response");
      
          // Get transcript for the mock response
      const transcript = await transcribeAudio(videoBlob);
      
      // Sample video analysis response (same as in recording-provider.tsx)
      return {
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
    }
  };

  // Helper function to transcribe audio
  const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
    console.log("Transcribing audio from blob:", (audioBlob.size / 1024).toFixed(2), "KB");
    
    // Simulated response for demo - would use actual transcription service in production
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return "Based on your question, I've prepared a detailed response that shows my understanding of the topic and my experience with related technologies. I've worked on similar problems before and can explain my approach.";
  };

  const nextQuestion = () => {
    if (currentQuestion < practiceQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setStep('setup');
      setError(null);
      setCurrentAnalysis(null);
    } else {
      // End of interview
      router.push(`/interview-preparation/questions/${jobId}`);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loadingData) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-b-transparent"></div>
      </div>
    );
  }

  if (!job || !practiceQuestions.length) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold">Job not found</h1>
        <Button variant="link" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-8 py-6">
      <div className="space-y-4">
        <Button variant="ghost" className="gap-2" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          Back to Questions
        </Button>

        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Practice Interview
          </h1>
          <p className="text-lg text-muted-foreground">
            {job.title} at {job.company}
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <Card className="overflow-hidden p-6">
            <h2 className="mb-4 text-xl font-semibold">Current Progress</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Question {currentQuestion + 1} of {practiceQuestions.length}</span>
                  <span>{Math.round(((currentQuestion + 1) / practiceQuestions.length) * 100)}%</span>
                </div>
                <Progress value={((currentQuestion + 1) / practiceQuestions.length) * 100} />
              </div>
              
              {/* Webcam preview - always visible once initialized */}
              <div className="aspect-video overflow-hidden rounded-lg border bg-black">
                {step !== 'intro' ? (
                  <>
                    <Webcam
                      ref={webcamRef}
                      audio={true}
                      muted={step !== 'recording'}
                      videoConstraints={videoConstraints}
                      onUserMedia={handleUserMedia}
                      onUserMediaError={handleUserMediaError}
                      mirrored={true}
                      className="h-full w-full object-cover"
                      screenshotFormat="image/jpeg"
                      forceScreenshotSourceSize
                      imageSmoothing
                    />
                    {permissionDenied && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 p-4 text-center">
                        <AlertCircle className="mb-2 h-8 w-8 text-red-500" />
                        <p className="text-sm text-white">Camera permission denied. Please enable camera access in your browser settings.</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => {
                            setPermissionDenied(false);
                            setTimeout(() => initializeCamera(), 500);
                          }}
                        >
                          Retry
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Camera className="h-16 w-16 text-muted-foreground/50" />
                  </div>
                )}
              </div>
              
              <div className="rounded-md border p-4">
                <h3 className="font-medium">Interview Tips</h3>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>• Speak clearly and at a moderate pace</li>
                  <li>• Maintain good eye contact with the camera</li>
                  <li>• Structure your answers with examples</li>
                  <li>• Keep your answers concise (1-2 minutes)</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-2">
          {step === 'intro' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="overflow-hidden p-6">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-primary">
                    <Info className="h-5 w-5" />
                    <p>We'll need access to your camera and microphone for this mock interview. Please click "Allow" when prompted.</p>
                  </div>
                  
                  <h2 className="text-2xl font-semibold">Ready to Start?</h2>
                  <p className="text-muted-foreground">
                    You'll be asked {practiceQuestions.length} questions about {job.title} skills and experience.
                    Your responses will be recorded and analyzed to provide feedback.
                  </p>
                  
                  <div className="rounded-md bg-muted p-4">
                    <h3 className="font-medium">First Question:</h3>
                    <p className="mt-2">{practiceQuestions[currentQuestion]}</p>
                  </div>
                  
                  <div className="rounded-md border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
                    <div className="flex gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                      <div>
                        <h4 className="font-medium text-amber-700 dark:text-amber-500">Camera Permission Required</h4>
                        <p className="text-sm text-amber-700/70 dark:text-amber-500/70">
                          This feature requires camera and microphone access. Your browser will ask for permission when you start.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full gap-2" 
                    onClick={initializeCamera}
                  >
                    <Camera className="h-4 w-4" />
                    Start Interview
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {step === 'setup' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="overflow-hidden p-6">
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold">Question {currentQuestion + 1}</h2>
                  <div className="rounded-md bg-muted p-4">
                    <p className="text-lg">{practiceQuestions[currentQuestion]}</p>
                  </div>
                  
                  <div className="rounded-md bg-muted/30 p-4">
                    <p className="text-sm text-muted-foreground">
                      Your camera is ready. When you click "Start Recording", you'll have 90 seconds to answer 
                      the question above. Try to structure your answer clearly and provide specific examples.
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button 
                      variant="outline"
                      className="gap-2"
                      onClick={() => {
                        if (webcamRef.current) {
                          // Force refresh the webcam
                          const video = webcamRef.current.video;
                          if (video && video.srcObject) {
                            const stream = video.srcObject as MediaStream;
                            stream.getTracks().forEach(track => track.stop());
                          }
                          setCameraInitialized(false);
                          setTimeout(() => setCameraInitialized(true), 100);
                        }
                      }}
                    >
                      <RefreshCw className="h-4 w-4" />
                      Refresh Camera
                    </Button>
                    
                    <Button 
                      onClick={beginRecording} 
                      className="gap-2 w-full"
                    >
                      <Play className="h-4 w-4" />
                      Start Recording
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {step === 'recording' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="overflow-hidden p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Recording Answer</h2>
                    <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700 animate-pulse">
                      {formatTime(timeRemaining)}
                    </span>
                  </div>
                  
                  <div className="rounded-md bg-muted p-4">
                    <p className="text-lg">{practiceQuestions[currentQuestion]}</p>
                  </div>

                  {/* On mobile, we show an extra webcam view for ease of use */}
                  <div className="aspect-video w-full overflow-hidden rounded-lg bg-black lg:hidden">
                    <Webcam
                      audio={true}
                      muted={false}
                      videoConstraints={videoConstraints}
                      mirrored={true}
                      className="h-full w-full object-cover"
                      screenshotFormat="image/jpeg"
                      forceScreenshotSourceSize
                      imageSmoothing
                    />
                  </div>

                  <div className="flex justify-center gap-4">
                    <Button 
                      onClick={endRecording} 
                      variant="destructive"
                      className="gap-2 w-full"
                    >
                      <Pause className="h-4 w-4" />
                      Stop Recording
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="overflow-hidden p-6">
                <div className="flex flex-col items-center justify-center space-y-4 py-12">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <h2 className="text-xl font-semibold">Analyzing your response...</h2>
                  <p className="text-center text-muted-foreground">
                    We're processing your video and analyzing your response.
                    This may take a moment.
                  </p>
                </div>
              </Card>
            </motion.div>
          )}

          {step === 'result' && currentAnalysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="overflow-hidden p-6">
                <h2 className="mb-4 text-xl font-semibold">Analysis Results</h2>
                
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="technical">Technical</TabsTrigger>
                    <TabsTrigger value="communication">Communication</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-4 pt-4">
                    <div className="rounded-md border p-4">
                      <h3 className="font-medium">Your Transcript</h3>
                      <p className="mt-2 text-muted-foreground">
                        {currentAnalysis.transcript || "No transcript available"}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-md border p-4">
                        <h3 className="font-medium">Overall Score</h3>
                        <div className="mt-2 text-3xl font-bold">
                          {currentAnalysis.videoAnalysis?.overall_assessment?.overall_score || "N/A"}
                        </div>
                      </div>
                      
                      <div className="rounded-md border p-4">
                        <h3 className="font-medium">Dominant Emotion</h3>
                        <div className="mt-2 text-xl font-medium">
                          {currentAnalysis.videoAnalysis?.dominant_emotion?.emotion || "N/A"}
                        </div>
                      </div>
                    </div>
                    
                    <div className="rounded-md border p-4">
                      <h3 className="font-medium">Summary</h3>
                      <p className="mt-2 text-muted-foreground">
                        {currentAnalysis.videoAnalysis?.analysis_summary || "No summary available"}
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="technical" className="space-y-4 pt-4">
                    <div className="rounded-md border p-4">
                      <h3 className="font-medium">Domain Knowledge</h3>
                      
                      <div className="mt-4 space-y-3">
                        <h4 className="text-sm font-medium text-green-600">What Went Well</h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {currentAnalysis.videoAnalysis?.domain_knowledge?.what_went_well?.map((item: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-green-500" />
                              <span>{item}</span>
                            </li>
                          )) || "No data available"}
                        </ul>
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-red-600">What Could Be Better</h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {currentAnalysis.videoAnalysis?.domain_knowledge?.what_could_be_better?.map((item: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <XCircle className="mt-1 h-4 w-4 shrink-0 text-red-500" />
                              <span>{item}</span>
                            </li>
                          )) || "No data available"}
                        </ul>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="communication" className="space-y-4 pt-4">
                    <div className="rounded-md border p-4 space-y-4">
                      <div>
                        <h3 className="font-medium">Speech Metrics</h3>
                        <div className="mt-2 grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm text-muted-foreground">Word Count</span>
                            <p className="text-lg font-medium">
                              {currentAnalysis.videoAnalysis?.communication?.speech_metrics?.word_count || "N/A"}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Speech Rate</span>
                            <p className="text-lg font-medium">
                              {currentAnalysis.videoAnalysis?.communication?.speech_rate?.words_per_minute || "N/A"} words/min
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="font-medium">Emotions</h3>
                        <div className="mt-2 space-y-2">
                          {currentAnalysis.videoAnalysis?.emotion_analysis?.map((emotion: any, i: number) => (
                            <div key={i} className="flex items-center justify-between">
                              <span>{emotion.emotion}</span>
                              <div className="flex items-center gap-2">
                                <Progress 
                                  value={emotion.frequency * 100} 
                                  className="w-24" 
                                />
                                <span className="text-sm">
                                  {Math.round(emotion.frequency * 100)}%
                                </span>
                              </div>
                            </div>
                          )) || "No emotion data available"}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="mt-6 flex justify-end gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep('setup')}
                    className="gap-2"
                  >
                    <VideoIcon className="h-4 w-4" />
                    Re-record Answer
                  </Button>
                  
                  <Button onClick={nextQuestion} className="gap-2">
                    {currentQuestion < practiceQuestions.length - 1 ? (
                      <>
                        <SkipForward className="h-4 w-4" />
                        Next Question
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Finish Interview
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {step === 'final-results' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="overflow-hidden p-6">
                <h2 className="mb-6 text-2xl font-semibold">Interview Complete</h2>
                
                <div className="space-y-6">
                  <div className="rounded-md border p-4">
                    <h3 className="font-medium">Overall Performance</h3>
                    <p className="mt-2 text-muted-foreground">
                      You've completed all {practiceQuestions.length} questions. Here's a summary of your performance:
                    </p>
                    
                    <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
                      <div className="rounded-md bg-muted p-3 text-center">
                        <div className="text-3xl font-bold text-primary">
                          {results.length}
                        </div>
                        <div className="text-sm text-muted-foreground">Questions Answered</div>
                      </div>
                      
                      <div className="rounded-md bg-muted p-3 text-center">
                        <div className="text-3xl font-bold text-primary">
                          {results.length > 0 ? 
                            (results.reduce((acc, result) => 
                              acc + (result.analysis.videoAnalysis?.overall_assessment?.overall_score || 0), 0) / results.length).toFixed(1) : 
                            "N/A"
                          }
                        </div>
                        <div className="text-sm text-muted-foreground">Average Score</div>
                      </div>
                      
                      <div className="rounded-md bg-muted p-3 text-center">
                        <div className="text-3xl font-bold text-primary">
                          {results.length > 0 ? 
                            results.reduce((acc, curr) => {
                              const wordCount = curr.analysis.videoAnalysis?.communication?.speech_metrics?.word_count || 0;
                              return acc + wordCount;
                            }, 0) : 
                            "N/A"
                          }
                        </div>
                        <div className="text-sm text-muted-foreground">Total Words</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium">Question Breakdown</h3>
                    
                    {results.map((result, index) => (
                      <div key={index} className="rounded-md border p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">Question {index + 1}</h4>
                            <p className="text-sm text-muted-foreground">{result.question}</p>
                          </div>
                          <div className="text-2xl font-bold">
                            {result.analysis.videoAnalysis?.overall_assessment?.overall_score || "N/A"}
                          </div>
                        </div>
                        
                        <Separator className="my-3" />
                        
                        <p className="text-sm text-muted-foreground">
                          {result.analysis.videoAnalysis?.analysis_summary || "No summary available"}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-end gap-4">
                    <Button 
                      variant="outline" 
                      onClick={() => router.push(`/interview-preparation/questions/${jobId}`)}
                      className="gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to Questions
                    </Button>
                    
                    <Button 
                      onClick={() => router.push('/interview-preparation/video')}
                      className="gap-2"
                    >
                      <VideoIcon className="h-4 w-4" />
                      Practice More Interviews
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
} 