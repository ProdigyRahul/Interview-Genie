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
  Download,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

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
  profileUrl: string;
  title: string;
  uploadedFile?: File | null;
}

export default function NewLinkedInOptimizerPage() {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    profileName: "",
    profileUrl: "",
    title: "",
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleOptimize = async () => {
    try {
      if (!formData.uploadedFile) {
        toast.error("Please upload your LinkedIn profile PDF");
        return;
      }

      if (!formData.profileName) {
        toast.error("Please enter your LinkedIn profile name");
        return;
      }

      setIsAnalyzing(true);

      // Create form data object
      const apiFormData = new FormData();
      apiFormData.append("file", formData.uploadedFile);
      apiFormData.append("profileName", formData.profileName);
      apiFormData.append("profileUrl", formData.profileUrl);
      apiFormData.append("title", formData.title || `${formData.profileName}'s LinkedIn Profile`);

      // Send to API
      const response = await fetch("/api/linkedin-profiles/upload", {
        method: "POST",
        body: apiFormData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to optimize LinkedIn profile");
      }

      toast.success("LinkedIn profile optimization completed successfully!");
      
      // Redirect to the view page for the new optimization
      router.push(`/document-preparation/linkedin-optimizer/${result.profile.id}/view`);
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
          
          <div className="space-y-6">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="profileName" className="text-sm font-medium">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="profileName"
                  name="profileName"
                  value={formData.profileName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="profileUrl" className="text-sm font-medium">
                  LinkedIn Profile URL
                </label>
                <Input
                  id="profileUrl"
                  name="profileUrl"
                  value={formData.profileUrl}
                  onChange={handleInputChange}
                  placeholder="https://linkedin.com/in/johndoe"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Optimization Title
                </label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Software Engineer Profile"
                />
                <p className="text-xs text-muted-foreground">
                  Optional: Give this optimization a descriptive title
                </p>
              </div>
            </div>
            
            <div
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-10 text-center transition-all ${
                isDragging
                  ? "border-primary bg-primary/5 shadow-lg"
                  : "border-muted-foreground/25 hover:border-primary/40 hover:bg-muted/30"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              
                {formData.uploadedFile ? (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="rounded-full bg-green-500/10 p-5">
                      <FileText className="h-10 w-10 text-green-500" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-semibold text-green-600 flex items-center gap-2">
                        <Check className="h-5 w-5" />
                        File Selected
                      </h3>
                      <p className="text-base font-medium">{formData.uploadedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(formData.uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <div className="absolute -inset-1 rounded-full bg-primary/20 blur-md" />
                      <div className="relative rounded-full bg-primary/10 p-5">
                        <Upload className="h-10 w-10 text-primary" />
                      </div>
                    </div>
                    <div className="mt-5 space-y-2">
                      <h3 className="text-xl font-semibold">
                        Drop your LinkedIn PDF here
                      </h3>
                      <p className="text-base text-muted-foreground">
                        or click to browse files from your device
                      </p>
                    </div>
                  </>
                )}
                
                <Button
                  onClick={() =>
                    document.querySelector<HTMLInputElement>("#file-upload")?.click()
                  }
                  className={`mt-6 ${formData.uploadedFile ? 'bg-muted/80 hover:bg-muted text-foreground' : ''}`}
                  variant={formData.uploadedFile ? "outline" : "default"}
                  size="lg"
                >
                  {formData.uploadedFile ? "Choose Different File" : "Select PDF File"}
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
                
                {!formData.uploadedFile && (
                  <div className="mt-5 flex items-center text-sm text-muted-foreground">
                    <Sparkle className="mr-2 h-4 w-4 text-yellow-500" />
                    Our AI will analyze your profile and provide tailored recommendations
                  </div>
                )}
            </div>
          </div>

          <div className="pt-6 mt-6 border-t">
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center p-4">
                <MultiStepLoader 
                  loadingStates={loadingStates} 
                  loading={true} 
                  duration={1500} 
                  loop={true}
                />
              </div>
            ) : (
              <Button 
                onClick={handleOptimize}
                className="w-full"
                size="lg"
                disabled={!formData.uploadedFile || !formData.profileName}
              >
                <Sparkle className="mr-2 h-4 w-4" />
                Optimize LinkedIn Profile
              </Button>
            )}
          </div>
        </Card>

        {/* Tips Card */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-full bg-primary/10 p-2.5">
              <Sparkle className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">How To Get The Best Results</h3>
          </div>
          
          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <h4 className="text-lg font-medium mb-2">Complete Your Profile</h4>
              <p className="text-sm text-muted-foreground">
                For the most accurate analysis, ensure your LinkedIn profile is as complete as possible, including your experience, education, skills, and achievements.
              </p>
            </div>
            
            <div className="rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Download className="h-5 w-5 text-primary" />
              </div>
              <h4 className="text-lg font-medium mb-2">PDF Export Instructions</h4>
              <p className="text-sm text-muted-foreground">
                To export your LinkedIn profile as PDF: Go to your profile → Click &quot;More&quot; button → Select &quot;Save to PDF&quot; → Upload the saved file here.
              </p>
            </div>
            
            <div className="rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Linkedin className="h-5 w-5 text-primary" />
              </div>
              <h4 className="text-lg font-medium mb-2">Optimization Benefits</h4>
              <p className="text-sm text-muted-foreground">
                An optimized LinkedIn profile can increase your visibility to recruiters by up to 40%, improve connection request acceptance, and boost engagement on your posts.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
} 