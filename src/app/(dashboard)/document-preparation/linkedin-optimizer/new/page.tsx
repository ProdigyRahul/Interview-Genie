"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  FileText,
  Sparkles,
  Upload,
  FileSpreadsheet,
  Linkedin,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const loadingStates = [
  { text: "Analyzing your LinkedIn profile..." },
  { text: "Evaluating content quality..." },
  { text: "Checking keyword optimization..." },
  { text: "Analyzing profile structure..." },
  { text: "Generating improvement suggestions..." },
  { text: "Preparing optimization report..." },
];

interface FormData {
  profileUrl: string;
  profileName: string;
  headline: string;
  summary: string;
  position: string;
  industry: string;
  uploadedFile?: File | null;
}

export default function NewLinkedInOptimizerPage() {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("url");
  const [isDragging, setIsDragging] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    profileUrl: "",
    profileName: "",
    headline: "",
    summary: "",
    position: "",
    industry: "",
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
      icon: Sparkles,
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
      setIsAnalyzing(true);

      // Validate form data based on active tab
      if (activeTab === "url") {
        if (!formData.profileUrl) {
          toast.error("Please enter your LinkedIn profile URL");
          setIsAnalyzing(false);
          return;
        }
        if (!formData.profileName) {
          toast.error("Please enter your name");
          setIsAnalyzing(false);
          return;
        }
      } else if (activeTab === "manual") {
        if (!formData.profileName || !formData.headline) {
          toast.error("Please fill in at least your name and headline");
          setIsAnalyzing(false);
          return;
        }
      } else if (activeTab === "upload") {
        if (!formData.uploadedFile) {
          toast.error("Please upload your LinkedIn profile PDF");
          setIsAnalyzing(false);
          return;
        }
      }

      // In a real implementation, you would send the form data to your API
      // For demo purposes, we'll simulate an API call
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
          <Tabs defaultValue="url" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="url">LinkedIn URL</TabsTrigger>
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
              <TabsTrigger value="upload">Upload PDF</TabsTrigger>
            </TabsList>
            
            <TabsContent value="url" className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>LinkedIn Profile URL</Label>
                  <Input
                    placeholder="https://www.linkedin.com/in/yourusername"
                    value={formData.profileUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, profileUrl: e.target.value })
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter the full URL to your LinkedIn profile
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Your Name</Label>
                  <Input
                    placeholder="John Doe"
                    value={formData.profileName}
                    onChange={(e) =>
                      setFormData({ ...formData, profileName: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Input
                    placeholder="e.g., Software Development, Marketing, Finance"
                    value={formData.industry}
                    onChange={(e) =>
                      setFormData({ ...formData, industry: e.target.value })
                    }
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="manual" className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Your Name</Label>
                  <Input
                    placeholder="John Doe"
                    value={formData.profileName}
                    onChange={(e) =>
                      setFormData({ ...formData, profileName: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Headline</Label>
                  <Input
                    placeholder="Senior Software Engineer at Company XYZ"
                    value={formData.headline}
                    onChange={(e) =>
                      setFormData({ ...formData, headline: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Current Position</Label>
                  <Input
                    placeholder="Software Engineer, Marketing Manager, etc."
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({ ...formData, position: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Input
                    placeholder="e.g., Software Development, Marketing, Finance"
                    value={formData.industry}
                    onChange={(e) =>
                      setFormData({ ...formData, industry: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Profile Summary</Label>
                  <Textarea
                    placeholder="Enter your LinkedIn profile summary or 'About' section..."
                    className="h-32"
                    value={formData.summary}
                    onChange={(e) =>
                      setFormData({ ...formData, summary: e.target.value })
                    }
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="upload" className="space-y-6">
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
                      Export your LinkedIn profile as PDF and upload it here for analysis
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
                    <Sparkles className="mr-2 h-4 w-4 text-yellow-500" />
                    PDF export provides the most accurate analysis
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="pt-6 mt-6 border-t">
            <Button 
              onClick={handleOptimize}
              className="w-full"
              size="lg"
            >
              <Sparkles className="mr-2 h-4 w-4" />
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
              <h4 className="font-medium mb-2">Industry Specificity</h4>
              <p className="text-sm text-muted-foreground">
                Providing your specific industry helps our AI generate more tailored recommendations for keywords and improvements relevant to your field.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
} 