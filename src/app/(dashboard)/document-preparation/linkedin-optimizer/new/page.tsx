"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  FileText,
  Sparkle,
  Upload,
  FileSpreadsheet,
  Linkedin,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const loadingStates = [
  { text: "Analyzing your LinkedIn profile..." },
  { text: "Evaluating content quality..." },
  { text: "Checking keyword optimization..." },
  { text: "Analyzing profile structure..." },
  { text: "Generating improvement suggestions..." },
  { text: "Preparing optimization report..." },
];

interface FormData {
  profileName: string;
  uploadedFile?: File | null;
}

export default function NewLinkedInOptimizerPage() {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    profileName: "",
    uploadedFile: null,
  });

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
      href: "/document-preparation/linkedin-optimizer/new",
      label: "New Optimization",
      icon: Sparkle,
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
      setFormData({
        ...formData,
        uploadedFile: droppedFile,
      });
    } else {
      toast.error("Please upload a PDF file");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFormData({
        ...formData,
        uploadedFile: selectedFile,
      });
      e.target.value = "";
    } else {
      toast.error("Please upload a PDF file");
    }
  };

  const handleOptimize = async () => {
    try {
      if (!formData.uploadedFile) {
        toast.error("Please upload your LinkedIn profile PDF");
        return;
      }

      setIsAnalyzing(true);

      // In a real implementation, you would send the form data to your API
      // 1. Upload the PDF file to your server or storage
      // 2. Process the PDF with Gemini API or similar AI service
      // 3. Generate optimization recommendations
      
      // Implementation with Gemini API would look like:
      // - Convert PDF to image or use Gemini's PDF processing capabilities
      // - Send to Gemini API with appropriate prompts for LinkedIn profile analysis
      // - Gemini can process the PDF natively and understand both text and visual content
      // - Extract structured data about the profile (headline, summary, experience, etc.)
      // - Generate improvement suggestions based on best practices
      // - Calculate an optimization score based on completeness and quality
      
      // Simulate API call and processing
      await new Promise((resolve) => setTimeout(resolve, 6000));

      // Simulate response with a generated ID
      const mockResult = {
        success: true,
        id: `linkedin-${Math.random().toString(36).substring(2, 10)}`,
      };

      toast.success("LinkedIn profile optimization completed successfully!");
      
      // Redirect to the view page for the new optimization
      router.push(`/document-preparation/linkedin-optimizer/${mockResult.id}/view`);
    } catch (error) {
      console.error("Error optimizing LinkedIn profile:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to optimize LinkedIn profile. Please try again.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isAnalyzing) {
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
              LinkedIn Profile Optimizer
            </h2>
            <p className="text-muted-foreground">
              Analyzing your LinkedIn profile...
            </p>
          </div>

          <div className="flex min-h-[60vh] flex-col items-center justify-center">
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
      <Breadcrumb items={breadcrumbItems} className="mb-6" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Optimize Your LinkedIn Profile
          </h2>
          <p className="text-muted-foreground">
            Get professional recommendations to enhance your LinkedIn presence and visibility
          </p>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Upload LinkedIn Profile PDF</h3>
          
          <div
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25"
            }`}
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
                  {formData.uploadedFile 
                    ? `File selected: ${formData.uploadedFile.name}` 
                    : "Drop your PDF here or click to upload"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Upload your LinkedIn profile PDF for AI-powered analysis and optimization
                </p>
              </div>
              <Button
                onClick={() =>
                  document.querySelector<HTMLInputElement>("#file-upload")?.click()
                }
                className="mt-4"
                variant={formData.uploadedFile ? "outline" : "default"}
              >
                {formData.uploadedFile ? "Choose Different File" : "Choose File"}
              </Button>
              <input
                id="file-upload"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="mt-4 flex items-center text-sm text-muted-foreground">
                <Sparkle className="mr-2 h-4 w-4 text-yellow-500" />
                Our AI will analyze your profile and provide tailored recommendations
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t">
            <Button 
              onClick={handleOptimize}
              className="w-full"
              size="lg"
              disabled={!formData.uploadedFile}
            >
              <Sparkle className="mr-2 h-4 w-4" />
              Optimize LinkedIn Profile
            </Button>
          </div>
        </Card>

        {/* Tips Card */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">How To Get The Best Results</h3>
          
          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <h4 className="font-medium mb-2">Complete Your Profile</h4>
              <p className="text-sm text-muted-foreground">
                For the most accurate analysis, ensure your LinkedIn profile is as complete as possible, including your experience, education, skills, and achievements.
              </p>
            </div>
            
            <div className="rounded-lg bg-muted p-4">
              <h4 className="font-medium mb-2">PDF Export Instructions</h4>
              <p className="text-sm text-muted-foreground">
                To export your LinkedIn profile as PDF: Go to your profile → Click "More" button → Select "Save to PDF" → Upload the saved file here.
              </p>
            </div>
            
            <div className="rounded-lg bg-muted p-4">
              <h4 className="font-medium mb-2">AI-Powered Analysis</h4>
              <p className="text-sm text-muted-foreground">
                Our advanced AI will analyze your LinkedIn profile PDF to provide tailored recommendations for optimization, focusing on content quality, keyword effectiveness, and profile structure.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
} 