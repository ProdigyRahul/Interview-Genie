"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { 
  FileText, 
  Download, 
  ArrowLeft, 
  FileSpreadsheet, 
  Linkedin, 
  Star, 
  CheckCircle, 
  Info,
  Sparkle
} from "lucide-react";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface LinkedInOptimization {
  id: string;
  profileName: string;
  title: string;
  profileUrl: string;
  optimizationScore: number;
  createdAt: string;
  fileUrl: string;
  analysisResults: {
    optimization_suggestions: {
      headline_improvements: Array<{
        current_text: string;
        issue: string;
        suggestion: string;
        impact: string;
      }>;
      summary_improvements: Array<{
        current_text: string;
        issue: string;
        suggestion: string;
        impact: string;
      }>;
      experience_improvements: Array<{
        current_text: string;
        issue: string;
        suggestion: string;
        impact: string;
      }>;
      education_improvements: Array<{
        current_text: string;
        issue: string;
        suggestion: string;
        impact: string;
      }>;
      skills_improvements: Array<{
        current_text: string;
        issue: string;
        suggestion: string;
        impact: string;
      }>;
    };
    section_priorities: Array<{
      section: string;
      priority: "high" | "medium" | "low";
      reason: string;
      potential_impact: string;
    }>;
    quick_wins: Array<{
      action: string;
      effort: "low" | "medium" | "high";
      impact: string;
    }>;
  };
}

const loadingStates = [
  { text: "Loading optimization results..." },
  { text: "Retrieving suggestions..." },
  { text: "Preparing visualization..." },
  { text: "Almost ready..." },
];

export default function ViewLinkedInOptimizationPage() {
  const params = useParams();
  const router = useRouter();
  const [optimization, setOptimization] = useState<LinkedInOptimization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    {
      href: `/document-preparation/linkedin-optimizer/${params.id}/view`,
      label: "View Results",
      icon: FileText,
    },
  ];

  const fetchOptimization = async () => {
    try {
      setIsLoading(true);
      // Replace mock data with actual API call
      const response = await fetch(`/api/linkedin-profiles/${params.id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch LinkedIn profile");
      }
      
      const data = await response.json();
      
      if (!data.success || !data.profile) {
        throw new Error("Failed to load profile data");
      }
      
      // Use the actual profile data
      setOptimization({
        id: data.profile.id,
        profileName: data.profile.profileName,
        title: data.profile.title,
        profileUrl: data.profile.profileUrl,
        optimizationScore: data.profile.optimizationScore,
        createdAt: data.profile.createdAt,
        fileUrl: data.profile.fileUrl,
        analysisResults: data.profile.analysisResults
      });
    } catch (error) {
      console.error("Error fetching LinkedIn optimization:", error);
      toast.error("Failed to load optimization results");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Fix floating promise by using void operator
    void fetchOptimization();
  }, [params.id]); // params.id is stable between renders

  const handleDownload = async () => {
    if (!optimization) return;
    
    try {
      // In a real implementation, this would download a PDF report
      toast.success("Download functionality would be implemented in production");
    } catch (error) {
      console.error("Error downloading report:", error);
      toast.error("Failed to download report. Please try again.");
    }
  };

  const handleBack = () => {
    router.push("/document-preparation/linkedin-optimizer");
  };

  const isPriorityHigh = (priority: string) => priority === "high";
  const isPriorityMedium = (priority: string) => priority === "medium";

  if (isLoading) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center p-4">
        <MultiStepLoader
          loadingStates={loadingStates}
          loading={true}
          duration={2000}
          loop={true}
        />
      </div>
    );
  }

  if (!optimization) {
    return (
      <div className="space-y-8">
        <Breadcrumb items={breadcrumbItems} className="mb-6" />
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
            <div className="rounded-full bg-muted p-4">
              <FileText className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold">Optimization Not Found</h3>
            <p className="text-muted-foreground">
              The LinkedIn profile optimization you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
            </p>
            <Button onClick={handleBack} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Optimizer
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Breadcrumb items={breadcrumbItems} className="mb-6" />
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">LinkedIn Profile Optimization</h2>
            <p className="text-muted-foreground">
              Analysis for {optimization.profileName} • Created on {format(new Date(optimization.createdAt), "MMMM d, yyyy")}
            </p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          </div>
        </div>

        {/* Optimization Score Card */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h3 className="text-xl font-semibold">Profile Optimization Score</h3>
              <p className="text-muted-foreground">Based on analysis of your LinkedIn profile content and structure</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-4xl font-bold text-primary">{optimization.optimizationScore}%</div>
              <div className="w-40">
                <Progress value={optimization.optimizationScore} className="h-3" />
              </div>
            </div>
          </div>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="improvements">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="improvements">Improvements</TabsTrigger>
            <TabsTrigger value="priorities">Priority Areas</TabsTrigger>
            <TabsTrigger value="quickwins">Quick Wins</TabsTrigger>
          </TabsList>
          
          {/* Improvements Tab */}
          <TabsContent value="improvements" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Suggested Improvements</h3>
              
              <Accordion type="multiple" className="w-full">
                {/* Headline Section */}
                {optimization.analysisResults.optimization_suggestions.headline_improvements.length > 0 && (
                  <AccordionItem value="headline">
                    <AccordionTrigger className="text-base font-medium">
                      Headline Improvements
                      <Badge className="ml-2 bg-blue-500 hover:bg-blue-600">
                        {optimization.analysisResults.optimization_suggestions.headline_improvements.length}
                      </Badge>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        {optimization.analysisResults.optimization_suggestions.headline_improvements.map((item, index) => (
                          <Card key={index} className="p-4 border-l-4 border-l-blue-500">
                            <div className="space-y-3">
                              <div>
                                <h4 className="font-medium text-sm text-muted-foreground">Current</h4>
                                <p className="bg-muted p-2 rounded text-sm mt-1">{item.current_text}</p>
                              </div>
                              <div>
                                <h4 className="font-medium text-sm text-muted-foreground">Issue</h4>
                                <p className="text-sm mt-1">{item.issue}</p>
                              </div>
                              <div>
                                <h4 className="font-medium text-sm text-muted-foreground mb-1">Suggestion</h4>
                                <p className="bg-primary/5 p-2 rounded border border-primary/20 text-sm">{item.suggestion}</p>
                              </div>
                              <div className="flex items-start gap-2">
                                <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                                <p className="text-sm flex-1"><span className="font-medium">Impact:</span> {item.impact}</p>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* Summary Section */}
                {optimization.analysisResults.optimization_suggestions.summary_improvements.length > 0 && (
                  <AccordionItem value="summary">
                    <AccordionTrigger className="text-base font-medium">
                      Summary/About Improvements
                      <Badge className="ml-2 bg-blue-500 hover:bg-blue-600">
                        {optimization.analysisResults.optimization_suggestions.summary_improvements.length}
                      </Badge>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        {optimization.analysisResults.optimization_suggestions.summary_improvements.map((item, index) => (
                          <Card key={index} className="p-4 border-l-4 border-l-blue-500">
                            <div className="space-y-3">
                              <div>
                                <h4 className="font-medium text-sm text-muted-foreground">Current</h4>
                                <p className="bg-muted p-2 rounded text-sm mt-1">{item.current_text}</p>
                              </div>
                              <div>
                                <h4 className="font-medium text-sm text-muted-foreground">Issue</h4>
                                <p className="text-sm mt-1">{item.issue}</p>
                              </div>
                              <div>
                                <h4 className="font-medium text-sm text-muted-foreground mb-1">Suggestion</h4>
                                <p className="bg-primary/5 p-2 rounded border border-primary/20 text-sm">{item.suggestion}</p>
                              </div>
                              <div className="flex items-start gap-2">
                                <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                                <p className="text-sm flex-1"><span className="font-medium">Impact:</span> {item.impact}</p>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* Experience Section */}
                {optimization.analysisResults.optimization_suggestions.experience_improvements.length > 0 && (
                  <AccordionItem value="experience">
                    <AccordionTrigger className="text-base font-medium">
                      Experience Improvements
                      <Badge className="ml-2 bg-blue-500 hover:bg-blue-600">
                        {optimization.analysisResults.optimization_suggestions.experience_improvements.length}
                      </Badge>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        {optimization.analysisResults.optimization_suggestions.experience_improvements.map((item, index) => (
                          <Card key={index} className="p-4 border-l-4 border-l-blue-500">
                            <div className="space-y-3">
                              <div>
                                <h4 className="font-medium text-sm text-muted-foreground">Current</h4>
                                <p className="bg-muted p-2 rounded text-sm mt-1">{item.current_text}</p>
                              </div>
                              <div>
                                <h4 className="font-medium text-sm text-muted-foreground">Issue</h4>
                                <p className="text-sm mt-1">{item.issue}</p>
                              </div>
                              <div>
                                <h4 className="font-medium text-sm text-muted-foreground mb-1">Suggestion</h4>
                                <p className="bg-primary/5 p-2 rounded border border-primary/20 text-sm">{item.suggestion}</p>
                              </div>
                              <div className="flex items-start gap-2">
                                <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                                <p className="text-sm flex-1"><span className="font-medium">Impact:</span> {item.impact}</p>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* Skills Section */}
                {optimization.analysisResults.optimization_suggestions.skills_improvements.length > 0 && (
                  <AccordionItem value="skills">
                    <AccordionTrigger className="text-base font-medium">
                      Skills Improvements
                      <Badge className="ml-2 bg-blue-500 hover:bg-blue-600">
                        {optimization.analysisResults.optimization_suggestions.skills_improvements.length}
                      </Badge>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        {optimization.analysisResults.optimization_suggestions.skills_improvements.map((item, index) => (
                          <Card key={index} className="p-4 border-l-4 border-l-blue-500">
                            <div className="space-y-3">
                              <div>
                                <h4 className="font-medium text-sm text-muted-foreground">Current</h4>
                                <p className="bg-muted p-2 rounded text-sm mt-1">{item.current_text}</p>
                              </div>
                              <div>
                                <h4 className="font-medium text-sm text-muted-foreground">Issue</h4>
                                <p className="text-sm mt-1">{item.issue}</p>
                              </div>
                              <div>
                                <h4 className="font-medium text-sm text-muted-foreground mb-1">Suggestion</h4>
                                <p className="bg-primary/5 p-2 rounded border border-primary/20 text-sm">{item.suggestion}</p>
                              </div>
                              <div className="flex items-start gap-2">
                                <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                                <p className="text-sm flex-1"><span className="font-medium">Impact:</span> {item.impact}</p>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </Card>
          </TabsContent>
          
          {/* Priorities Tab */}
          <TabsContent value="priorities" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Priority Areas</h3>
              <div className="space-y-4">
                {optimization.analysisResults.section_priorities.map((priority, index) => (
                  <Card 
                    key={index} 
                    className={`p-4 border-l-4 ${
                      isPriorityHigh(priority.priority) ? 'border-l-red-500' : 
                      isPriorityMedium(priority.priority) ? 'border-l-orange-500' : 
                      'border-l-yellow-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{priority.section}</h4>
                      <Badge 
                        className={`${
                          isPriorityHigh(priority.priority) ? 'bg-red-500 hover:bg-red-600' : 
                          isPriorityMedium(priority.priority) ? 'bg-orange-500 hover:bg-orange-600' : 
                          'bg-yellow-500 hover:bg-yellow-600'
                        }`}
                      >
                        {priority.priority.toUpperCase()} PRIORITY
                      </Badge>
                    </div>
                    <p className="text-sm mb-2">{priority.reason}</p>
                    <div className="flex items-start gap-2 mt-3">
                      <Star className="h-4 w-4 text-yellow-500 mt-0.5" />
                      <p className="text-sm flex-1"><span className="font-medium">Potential Impact:</span> {priority.potential_impact}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>
          
          {/* Quick Wins Tab */}
          <TabsContent value="quickwins" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Wins</h3>
              <p className="text-muted-foreground mb-6">Simple changes that can have a significant impact on your profile&apos;s effectiveness</p>
              
              <div className="space-y-4">
                {optimization.analysisResults.quick_wins.map((win, index) => (
                  <Card key={index} className="p-4 border-l-4 border-l-green-500">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {win.action}
                      </h4>
                      <Badge 
                        className={`${
                          win.effort === 'low' ? 'bg-green-500 hover:bg-green-600' : 
                          win.effort === 'medium' ? 'bg-orange-500 hover:bg-orange-600' : 
                          'bg-red-500 hover:bg-red-600'
                        }`}
                      >
                        {win.effort.toUpperCase()} EFFORT
                      </Badge>
                    </div>
                    <div className="flex items-start gap-2 mt-2">
                      <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                      <p className="text-sm flex-1"><span className="font-medium">Impact:</span> {win.impact}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
            
            <Card className="p-6 bg-muted/30">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-primary/10 p-2 mt-1">
                  <Sparkle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Pro Tip</h3>
                  <p className="text-sm text-muted-foreground">
                    Focus on these quick wins first to boost your profile&apos;s visibility before making more significant changes. 
                    These simple adjustments can significantly improve how recruiters and connections perceive your profile.
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 