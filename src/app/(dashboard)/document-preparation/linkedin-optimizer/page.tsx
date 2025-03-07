"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  Upload,
  Sparkles,
  BarChart3,
  Layout,
  Target,
  Lightbulb,
  ScrollText,
  FileSpreadsheet,
  Linkedin,
  Users,
  MessageSquare,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const loadingStates = [
  { text: "Uploading your LinkedIn profile...", duration: 3000 },
  { text: "Extracting profile content...", duration: 4000 },
  { text: "Analyzing profile structure...", duration: 4000 },
  { text: "Evaluating content quality...", duration: 4000 },
  { text: "Checking engagement metrics...", duration: 3000 },
  { text: "Assessing network strength...", duration: 3000 },
  { text: "Analyzing keyword optimization...", duration: 3000 },
  { text: "Generating improvement suggestions...", duration: 4000 },
  { text: "Preparing final results...", duration: 2000 },
];

const sections = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "profile", label: "Profile Structure", icon: Layout },
  { id: "content", label: "Content Quality", icon: ScrollText },
  { id: "engagement", label: "Engagement", icon: Users },
  { id: "networking", label: "Networking", icon: Share2 },
  { id: "improvements", label: "Improvements", icon: Lightbulb },
];

export default function LinkedInOptimizerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");

  const breadcrumbItems = [
    {
      href: "/document-preparation",
      label: "Document Preparation",
      icon: FileSpreadsheet,
    },
    {
      href: "/document-preparation/linkedin-optimizer",
      label: "LinkedIn Optimizer",
      icon: Linkedin,
    },
  ];

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
      e.target.value = "";
    } else {
      toast.error("Please upload a PDF file");
    }
  };

  const handleAnalyze = async (fileToAnalyze: File) => {
    try {
      setIsAnalyzing(true);
      // Simulating analysis for frontend demo
      await new Promise((resolve) => setTimeout(resolve, 30000));
      toast.success("Analysis completed successfully!");
    } catch (error) {
      console.error("Error analyzing LinkedIn profile:", error);
      toast.error("Failed to analyze LinkedIn profile. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8">
      <Breadcrumb items={breadcrumbItems} className="mb-6" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            LinkedIn Optimizer
          </h2>
          <p className="text-muted-foreground">
            Upload your LinkedIn profile and we&apos;ll help you optimize it for better
            visibility and engagement
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid gap-6 md:grid-cols-12">
              <div className="md:col-span-8">
                <Card className="h-full border-0">
                  {!isAnalyzing && !file && (
                    <div
                      className={cn(
                        "flex h-full flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                        isDragging
                          ? "border-primary bg-primary/5"
                          : "border-muted-foreground/25",
                      )}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                        <div className="rounded-full bg-primary/10 p-4">
                          <Upload className="h-8 w-8 text-primary" />
                        </div>
                        <div className="mt-4 space-y-2">
                          <h3 className="text-lg font-semibold">
                            Drop your PDF here or click to upload
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Export your LinkedIn profile as PDF and upload it here for
                            analysis
                          </p>
                        </div>
                        <Button
                          onClick={() =>
                            document.querySelector<HTMLInputElement>("#file-upload")?.click()
                          }
                          className="mt-4"
                        >
                          Choose File
                        </Button>
                        <input
                          id="file-upload"
                          type="file"
                          accept=".pdf"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                        <div className="mt-4 flex items-center text-sm text-muted-foreground">
                          <Sparkles className="mr-2 h-4 w-4 text-yellow-500" />
                          Uses 40 credits
                        </div>
                      </div>
                    </div>
                  )}

                  {isAnalyzing && (
                    <div className="space-y-6 p-6">
                      <MultiStepLoader loadingStates={loadingStates} />
                    </div>
                  )}

                  {!isAnalyzing && file && (
                    <Card className="p-6">
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h2 className="text-xl font-semibold">Analysis Results</h2>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setFile(null);
                            }}
                          >
                            Analyze Another Profile
                          </Button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                          {sections.map((section) => (
                            <Button
                              key={section.id}
                              variant={activeSection === section.id ? "default" : "outline"}
                              className="justify-start"
                              onClick={() => setActiveSection(section.id)}
                            >
                              <section.icon className="mr-2 h-4 w-4" />
                              {section.label}
                            </Button>
                          ))}
                        </div>

                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="profile-strength">
                            <AccordionTrigger className="text-lg font-semibold">
                              Profile Strength Score
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="grid gap-4 md:grid-cols-2">
                                <Card className="p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">Overall Score</span>
                                    <span className="text-emerald-500 font-semibold">85%</span>
                                  </div>
                                  <div className="w-full bg-secondary rounded-full h-2">
                                    <div
                                      className="bg-emerald-500 h-2 rounded-full"
                                      style={{ width: "85%" }}
                                    />
                                  </div>
                                </Card>
                              </div>
                            </AccordionContent>
                          </AccordionItem>

                          <AccordionItem value="improvement-suggestions">
                            <AccordionTrigger className="text-lg font-semibold">
                              Improvement Suggestions
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-4">
                                <Card className="p-4">
                                  <h4 className="font-medium mb-2">High Priority</h4>
                                  <ul className="list-disc list-inside space-y-2 text-sm">
                                    <li>Add a professional profile photo</li>
                                    <li>Complete the &quot;About&quot; section with relevant keywords</li>
                                    <li>Add more relevant skills to your profile</li>
                                  </ul>
                                </Card>
                              </div>
                            </AccordionContent>
                          </AccordionItem>

                          <AccordionItem value="engagement-metrics">
                            <AccordionTrigger className="text-lg font-semibold">
                              Engagement Metrics
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="grid gap-4 md:grid-cols-2">
                                <Card className="p-4">
                                  <h4 className="font-medium mb-2">Profile Views</h4>
                                  <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-lg font-semibold">152</span>
                                    <span className="text-sm text-emerald-500">+12%</span>
                                  </div>
                                </Card>
                                <Card className="p-4">
                                  <h4 className="font-medium mb-2">Post Engagement</h4>
                                  <div className="flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-lg font-semibold">48</span>
                                    <span className="text-sm text-emerald-500">+8%</span>
                                  </div>
                                </Card>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    </Card>
                  )}
                </Card>
              </div>

              {/* Sidebar */}
              <div className="md:col-span-4">
                <Card className="h-full p-6">
                  <div className="space-y-6">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-primary/10 p-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold">Tips for Success</h3>
                    </div>
                    <ul className="space-y-4">
                      <li className="group flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                        <div className="rounded-lg bg-primary/10 p-2">
                          <Sparkles className="h-5 w-5 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium">Professional Photo</p>
                          <p className="text-sm text-muted-foreground">
                            Use a high-quality, professional headshot
                          </p>
                        </div>
                      </li>
                      <li className="group flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                        <div className="rounded-lg bg-primary/10 p-2">
                          <Target className="h-5 w-5 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium">Headline Optimization</p>
                          <p className="text-sm text-muted-foreground">
                            Include keywords relevant to your industry
                          </p>
                        </div>
                      </li>
                      <li className="group flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                        <div className="rounded-lg bg-primary/10 p-2">
                          <ScrollText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium">Compelling Summary</p>
                          <p className="text-sm text-muted-foreground">
                            Write an engaging &quot;About&quot; section
                          </p>
                        </div>
                      </li>
                      <li className="group flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                        <div className="rounded-lg bg-primary/10 p-2">
                          <Share2 className="h-5 w-5 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium">Active Networking</p>
                          <p className="text-sm text-muted-foreground">
                            Regularly engage with your network
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </Card>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
} 