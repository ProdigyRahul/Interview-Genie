"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";
import { 
  FileText, 
  Upload, 
  XCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { ResumeAnalysisResult } from "@/lib/gemini";

const loadingStates = [
  { text: "Uploading your resume..." },
  { text: "Analyzing content..." },
  { text: "Generating feedback..." },
  { text: "Preparing results..." },
];

export default function ResumeOptimizerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ResumeAnalysisResult | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
      await handleAnalyze(droppedFile);
    } else {
      toast.error("Please upload a PDF file");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      await handleAnalyze(selectedFile);
      e.target.value = '';
    } else {
      toast.error("Please upload a PDF file");
    }
  };

  const handleAnalyze = async (fileToAnalyze: File) => {
    try {
      setIsAnalyzing(true);

      const formData = new FormData();
      formData.append("resume", fileToAnalyze);

      const response = await fetch("/api/resumes", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to analyze resume");
      }

      const analysis = await response.json();
      setResult(analysis);
      toast.success("Analysis completed successfully!");
    } catch (error) {
      console.error("Error analyzing resume:", error);
      toast.error(error instanceof Error ? error.message : "Failed to analyze resume. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isAnalyzing) {
    return (
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Resume Optimizer</h2>
            <p className="text-muted-foreground">
              Analyzing your resume for better results
            </p>
          </div>

          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <MultiStepLoader
              loadingStates={loadingStates}
              loading={true}
              duration={2000}
              loop={true}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Resume Analysis Results</h2>
            <p className="text-muted-foreground">
              Here&apos;s a detailed analysis of your resume with suggestions for improvement
            </p>
          </div>

          {/* Score Overview */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Overall ATS Score</h3>
                <div className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-semibold",
                  result.ats_analysis.total_score >= 80 ? "bg-green-500/10 text-green-500" :
                  result.ats_analysis.total_score >= 60 ? "bg-yellow-500/10 text-yellow-500" :
                  "bg-red-500/10 text-red-500"
                )}>
                  {result.ats_analysis.total_score}/100
                </div>
              </div>

              {/* Section Scores */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(result.ats_analysis.section_scores).map(([key, score]) => (
                  <div key={key} className="space-y-2">
                    <p className="text-sm text-muted-foreground capitalize">{key}</p>
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all",
                            score >= 16 ? "bg-green-500" :
                            score >= 12 ? "bg-yellow-500" :
                            "bg-red-500"
                          )}
                          style={{ width: `${(score / 20) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{score}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* High Priority Improvements */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">High Priority Improvements</h3>
            <div className="space-y-3">
              {result.improvement_suggestions.high_priority.map((suggestion, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="p-1.5 rounded-full bg-red-500/10">
                    <XCircle className="h-4 w-4 text-red-500" />
                  </div>
                  <p className="text-sm">{suggestion}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <Button onClick={() => setResult(null)}>
              Upload Another Resume
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Resume Optimizer</h2>
          <p className="text-muted-foreground">
            Upload your resume and we&apos;ll help you optimize it for better results
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card
            className={cn(
              "p-12 border-2 border-dashed transition-colors duration-200",
              isDragging ? "border-primary/50 bg-primary/5" : "border-border"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="p-4 rounded-full bg-primary/10">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Upload your resume</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Drag and drop your resume PDF here, or click to browse
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="resume-upload"
                />
                <Button
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => document.getElementById('resume-upload')?.click()}
                >
                  Browse Files
                </Button>
              </div>
              {file && !isAnalyzing && (
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4" />
                  <span>{file.name}</span>
                </div>
              )}
              <div className="flex items-center text-sm text-muted-foreground mt-4">
                <Sparkles className="h-4 w-4 mr-2 text-yellow-500" />
                Uses 30 credits
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
} 