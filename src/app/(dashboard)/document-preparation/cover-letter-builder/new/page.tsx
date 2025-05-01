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
  Download,
  Eye,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const loadingStates = [
  { text: "Analyzing your information..." },
  { text: "Crafting your cover letter..." },
  { text: "Adding professional touches..." },
  { text: "Almost ready..." },
];

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  jobTitle: string;
  hiringManager: string;
  keyPoints: string[];
  customization: {
    tone: string;
    style: string;
    length: string;
  };
}

export default function NewCoverLetterPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    companyName: "",
    jobTitle: "",
    hiringManager: "",
    keyPoints: [],
    customization: {
      tone: "professional",
      style: "modern",
      length: "medium",
    },
  });

  const breadcrumbItems = [
    {
      href: "/document-preparation",
      label: "Document Preparation",
      icon: FileSpreadsheet,
    },
    {
      href: "/document-preparation/cover-letter-builder",
      label: "Cover Letter Builder",
      icon: FileText,
    },
    {
      href: "/document-preparation/cover-letter-builder/new",
      label: "New Cover Letter",
      icon: FileText,
    },
  ];

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);

      // Validate form data before sending
      if (!formData.fullName || !formData.email || !formData.phone) {
        toast.error("Please fill in all personal information fields");
        setIsGenerating(false);
        return;
      }

      if (!formData.companyName || !formData.jobTitle) {
        toast.error("Please fill in company and job information");
        setIsGenerating(false);
        return;
      }

      if (!formData.keyPoints || formData.keyPoints.length === 0) {
        toast.error("Please add at least one key point");
        setIsGenerating(false);
        return;
      }

      const response = await fetch("/api/cover-letter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate cover letter");
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to generate cover letter");
      }

      toast.success("Cover letter generated successfully!");
      
      // Redirect to the view page for the new cover letter
      router.push(`/document-preparation/cover-letter-builder/${data.id}/view`);
    } catch (error) {
      console.error("Error generating cover letter:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to generate cover letter. Please try again.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
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
              Cover Letter Builder
            </h2>
            <p className="text-muted-foreground">
              Creating your personalized cover letter...
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
            Create New Cover Letter
          </h2>
          <p className="text-muted-foreground">
            We&apos;ll help you create a compelling cover letter tailored to
            your job application
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Input Form */}
          <Card className="space-y-6 p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input
                  placeholder="Company Inc."
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData({ ...formData, companyName: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Job Title</Label>
                <Input
                  placeholder="Senior Software Engineer"
                  value={formData.jobTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, jobTitle: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Hiring Manager&apos;s Name</Label>
                <Input
                  placeholder="Jane Smith"
                  value={formData.hiringManager}
                  onChange={(e) =>
                    setFormData({ ...formData, hiringManager: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Key Points (One per line)</Label>
                <Textarea
                  placeholder="Enter key points you'd like to highlight in your cover letter..."
                  className="h-24"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      keyPoints: e.target.value.split("\n").filter(Boolean),
                    })
                  }
                />
              </div>

              <div className="space-y-4">
                <Label>Customization</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Tone</Label>
                    <select
                      className="w-full rounded-md border border-input bg-background p-2"
                      value={formData.customization.tone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          customization: {
                            ...formData.customization,
                            tone: e.target.value,
                          },
                        })
                      }
                    >
                      <option value="professional">Professional</option>
                      <option value="friendly">Friendly</option>
                      <option value="confident">Confident</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Style</Label>
                    <select
                      className="w-full rounded-md border border-input bg-background p-2"
                      value={formData.customization.style}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          customization: {
                            ...formData.customization,
                            style: e.target.value,
                          },
                        })
                      }
                    >
                      <option value="modern">Modern</option>
                      <option value="traditional">Traditional</option>
                      <option value="creative">Creative</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Length</Label>
                    <select
                      className="w-full rounded-md border border-input bg-background p-2"
                      value={formData.customization.length}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          customization: {
                            ...formData.customization,
                            length: e.target.value,
                          },
                        })
                      }
                    >
                      <option value="short">Short</option>
                      <option value="medium">Medium</option>
                      <option value="long">Long</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleGenerate}
              className="w-full"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Cover Letter
            </Button>
          </Card>

          {/* Instructions */}
          <Card className="space-y-6 p-6">
            <h3 className="text-lg font-semibold">Cover Letter Tips</h3>
            
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <h4 className="font-medium mb-2">Personalize Your Letter</h4>
                <p className="text-sm text-muted-foreground">Address the hiring manager by name whenever possible. Research the company to tailor your letter to their specific needs and culture.</p>
              </div>
              
              <div className="rounded-lg bg-muted p-4">
                <h4 className="font-medium mb-2">Highlight Relevant Skills</h4>
                <p className="text-sm text-muted-foreground">Focus on skills and experiences most relevant to the position. Use the key points section to list specific achievements and qualifications.</p>
              </div>
              
              <div className="rounded-lg bg-muted p-4">
                <h4 className="font-medium mb-2">Keep It Concise</h4>
                <p className="text-sm text-muted-foreground">A great cover letter is typically 250-400 words. Be clear and direct about why you're a good fit for the role.</p>
              </div>
              
              <div className="rounded-lg bg-muted p-4">
                <h4 className="font-medium mb-2">Show Enthusiasm</h4>
                <p className="text-sm text-muted-foreground">Express genuine interest in the role and organization. Explain why you want to work for this specific company.</p>
              </div>
              
              <div className="rounded-lg bg-muted p-4">
                <h4 className="font-medium mb-2">Proofread Carefully</h4>
                <p className="text-sm text-muted-foreground">Check for spelling, grammar, and formatting errors before submitting your cover letter.</p>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  );
} 