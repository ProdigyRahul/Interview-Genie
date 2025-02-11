"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";
import { 
  FileText, 
  Upload, 
  Download, 
  CheckCircle2, 
  XCircle,
  Sparkles,
  ArrowRight,
  Eye,
  Clock,
  TrendingUp
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const loadingStates = [
  { text: "Analyzing your resume..." },
  { text: "Checking formatting..." },
  { text: "Evaluating content..." },
  { text: "Generating improvements..." },
  { text: "Preparing results..." },
];

interface AnalysisResult {
  score: number;
  improvements: {
    category: string;
    suggestions: string[];
    severity: "high" | "medium" | "low";
  }[];
  enhancedResume?: string;
}

const mockAnalysisResult: AnalysisResult = {
  score: 75,
  improvements: [
    {
      category: "Content",
      suggestions: [
        "Add more quantifiable achievements",
        "Include relevant keywords from the job description",
      ],
      severity: "high",
    },
    {
      category: "Formatting",
      suggestions: [
        "Improve section spacing",
        "Use consistent font sizes",
      ],
      severity: "medium",
    },
    {
      category: "Language",
      suggestions: [
        "Replace passive voice with active voice",
        "Remove redundant phrases",
      ],
      severity: "low",
    },
  ],
};

// Add mock previous resumes data
const mockPreviousResumes = [
  {
    id: 1,
    name: "Software_Engineer_Resume.pdf",
    score: 85,
    uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    improvements: 3,
  },
  {
    id: 2,
    name: "Frontend_Developer_Resume.pdf",
    score: 72,
    uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    improvements: 5,
  },
  {
    id: 3,
    name: "Technical_Lead_Resume.pdf",
    score: 92,
    uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    improvements: 2,
  },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function ResumeOptimizerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

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
      await handleAnalyze(droppedFile); // Await the promise
    } else {
      toast.error("Please upload a PDF file");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      await handleAnalyze(selectedFile); // Await the promise
      // Clear the input
      e.target.value = '';
    } else {
      toast.error("Please upload a PDF file");
    }
  };

  const handleAnalyze = async (fileToAnalyze: File) => {
    try {
      setIsAnalyzing(true);
      // Simulate API call with the file
      await new Promise(resolve => setTimeout(resolve, 3000));
      setResult(mockAnalysisResult);
      toast.success("Analysis completed successfully!");
    } catch (error) {
      console.error("Error analyzing resume:", error);
      toast.error("Failed to analyze resume. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownload = async () => {
    try {
      // TODO: Implement download logic
      toast.success("Enhanced resume downloaded successfully!");
    } catch (error) {
      console.error("Error downloading resume:", error);
      toast.error("Failed to download resume. Please try again.");
    }
  };

  // Function to format relative time
  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
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
              Upload your resume and we&apos;ll help you optimize it for better results
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

        {/* Previous Resumes Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Previous Optimizations</h3>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {mockPreviousResumes.map((resume) => (
                <motion.div
                  key={resume.id}
                  variants={itemVariants}
                  layout
                  className="group"
                >
                  <Card className="relative overflow-hidden border-border/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 group-hover:border-primary/50">
                    {/* Premium Gradient Effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 pointer-events-none" />
                    
                    <div className="relative p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-full bg-primary/10">
                              <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <span className="font-medium text-sm truncate max-w-[180px]">
                              {resume.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              <span>{getRelativeTime(resume.uploadedAt)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <TrendingUp className="h-3.5 w-3.5" />
                              <span>{resume.improvements} improvements</span>
                            </div>
                          </div>
                        </div>
                        <div className={cn(
                          "px-2.5 py-1 rounded-full text-xs font-semibold",
                          resume.score >= 80 ? "bg-green-500/10 text-green-500" :
                          resume.score >= 60 ? "bg-yellow-500/10 text-yellow-500" :
                          "bg-red-500/10 text-red-500"
                        )}>
                          {resume.score}/100
                        </div>
                      </div>

                      <div className="pt-3 flex items-center gap-3 border-t border-border/50">
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="w-full bg-primary hover:bg-primary/90"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1.5" />
                          View Details
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full hover:border-primary/50 hover:bg-primary/5"
                        >
                          <Download className="h-3.5 w-3.5 mr-1.5" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
} 