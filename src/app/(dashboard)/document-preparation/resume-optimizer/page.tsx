"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";
import { 
  FileText, 
  Upload, 
  XCircle,
  Sparkles,
  BarChart3,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  BookOpen,
  Languages,
  Layout,
  Target,
  Award,
  Lightbulb,
  ScrollText,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { ResumeAnalysisResult } from "@/lib/gemini";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

const loadingStates = [
  { text: "Uploading your resume...", duration: 3000 },
  { text: "Extracting resume content...", duration: 4000 },
  { text: "Analyzing format and structure...", duration: 4000 },
  { text: "Evaluating content quality...", duration: 4000 },
  { text: "Checking language and communication...", duration: 3000 },
  { text: "Assessing core competencies...", duration: 3000 },
  { text: "Analyzing keyword optimization...", duration: 3000 },
  { text: "Generating improvement suggestions...", duration: 4000 },
  { text: "Preparing final results...", duration: 2000 }
];

const sections = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'format', label: 'Format & Structure', icon: Layout },
  { id: 'content', label: 'Content Quality', icon: ScrollText },
  { id: 'language', label: 'Language', icon: Languages },
  { id: 'competencies', label: 'Core Competencies', icon: Target },
  { id: 'improvements', label: 'Improvements', icon: Lightbulb },
];

// Add ResumeAnalysis type
interface ResumeAnalysis {
  id: string;
  originalFilename: string;
  fileUrl: string;
  totalScore: number;
  sectionScores: {
    format: number;
    content: number;
    language: number;
    competencies: number;
    keywords: number;
  };
  detailedBreakdown: {
    format_analysis: {
      length_depth_score: number;
      bullet_usage_score: number;
      bullet_length_score: number;
      page_density_score: number;
      formatting_score: number;
    };
    content_analysis: {
      impact_score: number;
      achievements_score: number;
      relevance_score: number;
      technical_depth_score: number;
    };
    language_analysis: {
      verb_strength: number;
      tense_consistency: number;
      clarity: number;
      spelling_grammar: number;
      professional_tone: number;
    };
    competencies_analysis: {
      leadership_initiative: number;
      problem_solving: number;
      collaboration: number;
      results_orientation: number;
    };
  };
  keywordMatchRate: string;
  missingKeywords: string[];
  improvements: {
    high_priority: string[];
    content: Array<{
      current: string;
      suggested: string;
      impact: string;
      section: string;
    }>;
    format: Array<{
      current?: string;
      suggested?: string;
      reason?: string;
    }>;
    language: Array<{
      original: string;
      improved: string;
      reason: string;
    }>;
    keywords: string[];
    details: {
      bullet_points: Array<{
        original: string;
        improved: string;
        reason: string;
      }>;
      achievements: Array<{
        section: string;
        current: string;
        suggested: string;
        impact: string;
      }>;
      skills: Array<{
        skill_area: string;
        current: string;
        improved: string;
        explanation: string;
      }>;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export default function ResumeOptimizerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ResumeAnalysisResult & { metadata: { file_url?: string } } | null>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [analyses, setAnalyses] = useState<ResumeAnalysis[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    fetchResumeHistory();
  }, []);

  const fetchResumeHistory = async () => {
    try {
      const response = await fetch('/api/resumes');
      const data = await response.json();
      
      if (data.success) {
        setAnalyses(data.analyses);
      } else {
        setAnalyses([]);
      }
    } catch (error) {
      console.error('Error fetching resume history:', error);
      setAnalyses([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

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
      setResult({
        success: true,
        ats_analysis: {
          total_score: analysis.ats_analysis.total_score,
          section_scores: analysis.ats_analysis.section_scores,
          detailed_breakdown: analysis.ats_analysis.detailed_breakdown,
          keyword_match_rate: analysis.ats_analysis.keyword_match_rate,
          missing_keywords: analysis.ats_analysis.missing_keywords || []
        },
        improvement_suggestions: analysis.improvement_suggestions,
        improvement_details: analysis.improvement_details,
        metadata: {
          file_url: analysis.metadata.file_url,
          filename: analysis.metadata.filename,
          job_description_provided: analysis.metadata.job_description_provided,
          timestamp: analysis.metadata.timestamp
        }
      });
      toast.success("Analysis completed successfully!");
    } catch (error) {
      console.error("Error analyzing resume:", error);
      toast.error(error instanceof Error ? error.message : "Failed to analyze resume. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderScoreCard = (title: string, score: number) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium capitalize">{title.replace(/_/g, ' ')}</p>
        <span className={cn(
          "text-sm font-semibold",
          score >= 80 ? "text-green-500" :
          score >= 60 ? "text-yellow-500" :
          "text-red-500"
        )}>
          {score}/100
        </span>
      </div>
      <Progress 
        value={score} 
        className={cn(
          "h-2",
          score >= 80 ? "bg-green-500" :
          score >= 60 ? "bg-yellow-500" :
          "bg-red-500"
        )}
      />
    </div>
  );

  const renderDetailedBreakdown = (title: string, data: Record<string, number>) => (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold">{title}</h4>
      <div className="space-y-3">
        {Object.entries(data).map(([key, score]) => (
          <div key={key} className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground capitalize">
                {key.replace(/_/g, ' ')}
              </p>
              <span className={cn(
                "text-sm font-medium",
                score >= 80 ? "text-green-500" :
                score >= 60 ? "text-yellow-500" :
                "text-red-500"
              )}>
                {score}/100
              </span>
            </div>
            <Progress 
              value={score} 
              className={cn(
                "h-1.5",
                score >= 80 ? "bg-green-500" :
                score >= 60 ? "bg-yellow-500" :
                "bg-red-500"
              )}
            />
          </div>
        ))}
      </div>
    </div>
  );

  const renderImprovementSection = (title: string, items: any[]) => (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold">{title}</h4>
      <div className="space-y-4">
        {items.map((item, index) => (
          <Card key={index} className="p-4 space-y-3">
            {item.current && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Pencil className="h-4 w-4" />
                  <span>Current</span>
                </div>
                <p className="text-sm">{item.current}</p>
              </div>
            )}
            {item.suggested && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-green-500">
                  <CheckCircle className="h-4 w-4" />
                  <span>Suggested</span>
                </div>
                <p className="text-sm">{item.suggested}</p>
              </div>
            )}
            {item.impact && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-blue-500">
                  <ArrowUpRight className="h-4 w-4" />
                  <span>Impact</span>
                </div>
                <p className="text-sm">{item.impact}</p>
              </div>
            )}
            {item.reason && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-purple-500">
                  <BookOpen className="h-4 w-4" />
                  <span>Reason</span>
                </div>
                <p className="text-sm">{item.reason}</p>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );

  const renderHistory = () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Previous Analyses</h3>
      {isLoadingHistory ? (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : analyses.length === 0 ? (
        <p className="text-muted-foreground text-sm">No previous analyses found</p>
      ) : (
        <div className="space-y-4">
          {analyses.map((analysis) => (
            <Card 
              key={analysis.id} 
              className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => {
                setResult({
                  success: true,
                  ats_analysis: {
                    total_score: analysis.totalScore,
                    section_scores: analysis.sectionScores,
                    detailed_breakdown: analysis.detailedBreakdown,
                    keyword_match_rate: analysis.keywordMatchRate || "0%",
                    missing_keywords: analysis.missingKeywords || []
                  },
                  improvement_suggestions: {
                    high_priority: analysis.improvements?.high_priority || [],
                    content: analysis.improvements?.content || [],
                    format: analysis.improvements?.format || [],
                    language: analysis.improvements?.language || [],
                    keywords: analysis.improvements?.keywords || []
                  },
                  improvement_details: {
                    bullet_points: analysis.improvements?.details?.bullet_points || [],
                    achievements: analysis.improvements?.details?.achievements || [],
                    skills: analysis.improvements?.details?.skills || []
                  },
                  metadata: {
                    file_url: analysis.fileUrl,
                    filename: analysis.originalFilename,
                    job_description_provided: false,
                    timestamp: analysis.createdAt
                  }
                });
              }}
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">{analysis.originalFilename}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(analysis.createdAt), 'PPP')}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-semibold",
                    analysis.totalScore >= 80 ? "bg-green-500/10 text-green-500" :
                    analysis.totalScore >= 60 ? "bg-yellow-500/10 text-yellow-500" :
                    "bg-red-500/10 text-red-500"
                  )}>
                    {analysis.totalScore}/100
                  </div>
                  <a
                    href={analysis.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FileText className="h-4 w-4" />
                    View
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Card>
  );

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
              loop={false}
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

          <div className="grid grid-cols-12 gap-6">
            {/* Sidebar Navigation */}
            <Card className="col-span-2 p-4">
              <div className="space-y-4">
                {sections.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveSection(id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                      activeSection === id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
            </Card>

            {/* Main Content */}
            <div className="col-span-6 space-y-6">
              {/* Overview Section */}
              {activeSection === 'overview' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {/* Total Score */}
                  <Card className="p-6 bg-gradient-to-br from-background via-muted/50 to-background border-muted-foreground/20">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="text-lg font-semibold">Overall ATS Score</h3>
                          <p className="text-sm text-muted-foreground">
                            Based on industry standard evaluation criteria
                          </p>
                        </div>
                        <div className={cn(
                          "px-4 py-2 rounded-full text-lg font-semibold flex items-center gap-2",
                          result.ats_analysis.total_score >= 80 ? "bg-green-500/10 text-green-500" :
                          result.ats_analysis.total_score >= 60 ? "bg-yellow-500/10 text-yellow-500" :
                          "bg-red-500/10 text-red-500"
                        )}>
                          <span>{result.ats_analysis.total_score}</span>
                          <span className="text-sm text-muted-foreground">/100</span>
                        </div>
                      </div>

                      {/* Section Scores */}
                      <div className="grid gap-4">
                        {Object.entries(result.ats_analysis.section_scores).map(([key, score]) => 
                          renderScoreCard(key, score)
                        )}
                      </div>
                    </div>
                  </Card>

                  {/* High Priority Improvements */}
                  <Card className="p-6 bg-gradient-to-br from-background via-muted/50 to-background border-muted-foreground/20">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="text-lg font-semibold">High Priority Improvements</h3>
                          <p className="text-sm text-muted-foreground">
                            Critical areas that need immediate attention
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {result.improvement_suggestions.high_priority.map((suggestion, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                            <div className="p-1.5 rounded-full bg-destructive/10">
                              <AlertCircle className="h-4 w-4 text-destructive" />
                            </div>
                            <p className="text-sm">{suggestion}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Format Section */}
              {activeSection === 'format' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <Card className="p-6 bg-gradient-to-br from-background via-muted/50 to-background border-muted-foreground/20">
                    {renderDetailedBreakdown(
                      'Format Analysis',
                      result.ats_analysis.detailed_breakdown.format_analysis
                    )}
                  </Card>
                  {result.improvement_suggestions.format.length > 0 && (
                    <Card className="p-6 bg-gradient-to-br from-background via-muted/50 to-background border-muted-foreground/20">
                      {renderImprovementSection('Format Improvements', result.improvement_suggestions.format)}
                    </Card>
                  )}
                </motion.div>
              )}

              {/* Content Section */}
              {activeSection === 'content' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <Card className="p-6 bg-gradient-to-br from-background via-muted/50 to-background border-muted-foreground/20">
                    {renderDetailedBreakdown(
                      'Content Analysis',
                      result.ats_analysis.detailed_breakdown.content_analysis
                    )}
                  </Card>
                  {result.improvement_suggestions.content.length > 0 && (
                    <Card className="p-6 bg-gradient-to-br from-background via-muted/50 to-background border-muted-foreground/20">
                      {renderImprovementSection('Content Improvements', result.improvement_suggestions.content)}
                    </Card>
                  )}
                </motion.div>
              )}

              {/* Language Section */}
              {activeSection === 'language' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <Card className="p-6 bg-gradient-to-br from-background via-muted/50 to-background border-muted-foreground/20">
                    {renderDetailedBreakdown(
                      'Language Analysis',
                      result.ats_analysis.detailed_breakdown.language_analysis
                    )}
                  </Card>
                  {result.improvement_suggestions.language.length > 0 && (
                    <Card className="p-6 bg-gradient-to-br from-background via-muted/50 to-background border-muted-foreground/20">
                      {renderImprovementSection('Language Improvements', result.improvement_suggestions.language)}
                    </Card>
                  )}
                </motion.div>
              )}

              {/* Competencies Section */}
              {activeSection === 'competencies' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <Card className="p-6 bg-gradient-to-br from-background via-muted/50 to-background border-muted-foreground/20">
                    {renderDetailedBreakdown(
                      'Core Competencies Analysis',
                      result.ats_analysis.detailed_breakdown.competencies_analysis
                    )}
                  </Card>
                </motion.div>
              )}

              {/* Improvements Section */}
              {activeSection === 'improvements' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {/* High Priority */}
                  <Card className="p-6 bg-gradient-to-br from-background via-muted/50 to-background border-muted-foreground/20">
                    <h3 className="text-lg font-semibold mb-4">High Priority Improvements</h3>
                    <div className="space-y-3">
                      {result.improvement_suggestions.high_priority.map((suggestion, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                          <div className="p-1.5 rounded-full bg-destructive/10">
                            <AlertCircle className="h-4 w-4 text-destructive" />
                          </div>
                          <p className="text-sm">{suggestion}</p>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Detailed Improvements */}
                  {result.improvement_details.bullet_points.length > 0 && (
                    <Card className="p-6 bg-gradient-to-br from-background via-muted/50 to-background border-muted-foreground/20">
                      {renderImprovementSection('Bullet Point Improvements', result.improvement_details.bullet_points)}
                    </Card>
                  )}
                  {result.improvement_details.achievements.length > 0 && (
                    <Card className="p-6 bg-gradient-to-br from-background via-muted/50 to-background border-muted-foreground/20">
                      {renderImprovementSection('Achievement Improvements', result.improvement_details.achievements)}
                    </Card>
                  )}
                  {result.improvement_details.skills.length > 0 && (
                    <Card className="p-6 bg-gradient-to-br from-background via-muted/50 to-background border-muted-foreground/20">
                      {renderImprovementSection('Skills Improvements', result.improvement_details.skills)}
                    </Card>
                  )}
                </motion.div>
              )}
            </div>

            {/* Resume Preview */}
            <div className="col-span-4">
              <Card className="p-4 h-[calc(100vh-12rem)] sticky top-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Resume Preview</h3>
                  {result?.metadata?.file_url && (
                    <a 
                      href={result.metadata.file_url}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      Open PDF
                    </a>
                  )}
                </div>
                <div className="w-full h-full rounded-lg overflow-hidden border bg-white">
                  {result?.metadata?.file_url ? (
                    <iframe
                      src={result.metadata.file_url}
                      className="w-full h-full"
                      title="Resume Preview"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <FileText className="h-8 w-8 mr-2" />
                      No preview available
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <Button onClick={() => setResult(null)}>
              Upload Another Resume
            </Button>
          </div>
        </motion.div>

        {renderHistory()}
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

        <div className="grid grid-cols-1 gap-6">
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

          {renderHistory()}
        </div>
      </motion.div>
    </div>
  );
} 