"use client";

import { useState, useEffect } from "react";
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
  ArrowRight,
  Loader2,
  FileSpreadsheet,
  Edit,
  Clock,
  Trash,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const loadingStates = [
  { text: "Fetching your cover letters...", duration: 2000 },
  { text: "Loading templates...", duration: 2000 },
  { text: "Preparing your workspace...", duration: 2000 },
  { text: "Almost ready...", duration: 2000 },
];

interface CoverLetter {
  id: string;
  title: string;
  companyName: string;
  jobTitle: string;
  content: string;
  fileUrl: string;
  createdAt: string;
}

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

export default function CoverLetterBuilderPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [selectedLetter, setSelectedLetter] = useState<CoverLetter | null>(null);
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

  const formatDate = (date: string) => {
    const now = new Date();
    const d = new Date(date);
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  };

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
  ];

  useEffect(() => {
    fetchCoverLetters();
  }, []);

  const fetchCoverLetters = async () => {
    try {
      setIsLoadingHistory(true);
      const response = await fetch("/api/cover-letter");
      const data = await response.json();

      if (data.success) {
        setCoverLetters(data.coverLetters);
      } else {
        console.error("Failed to fetch cover letters:", data.error);
        setCoverLetters([]);
      }
    } catch (error) {
      console.error("Error fetching cover letter history:", error);
      setCoverLetters([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

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

      // Set the preview with the full letter
      setPreview(data.content.full_letter);
      toast.success("Cover letter generated successfully!");
      
      // Refresh the cover letter list
      await fetchCoverLetters();
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

  const handleViewLetter = (letter: CoverLetter) => {
    setSelectedLetter(letter);
    setPreview(letter.content);
  };

  const handleDownload = async (fileUrl: string, title: string) => {
    try {
      // Create a link element to download the file
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = `${title.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Cover letter downloaded successfully!");
    } catch (error) {
      console.error("Error downloading cover letter:", error);
      toast.error("Failed to download cover letter. Please try again.");
    }
  };

  const handleCreateNew = () => {
    router.push("/document-preparation/cover-letter-builder/new");
  };

  if (isLoadingHistory) {
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
            Cover Letter Builder
          </h2>
          <p className="text-muted-foreground">
            Create compelling cover letters tailored to your job applications
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Create New Cover Letter Card */}
          <Card className="group h-full transition-all hover:border-primary hover:shadow-lg">
            <div className="relative h-full">
              {/* Animated gradient background */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/5 via-primary/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              <button
                onClick={handleCreateNew}
                className="relative block h-full w-full p-8"
              >
                <div className="h-full space-y-6">
                  <div className="flex h-32 items-center justify-center">
                    <div
                      className={cn(
                        "rounded-full bg-background/80 p-6 backdrop-blur-sm",
                        "border-2 border-primary/20 group-hover:border-primary/40",
                        "transition-all duration-300 group-hover:scale-110",
                      )}
                    >
                      <Plus className="h-10 w-10 text-primary transition-transform duration-300 group-hover:scale-110" />
                    </div>
                  </div>

                  <div className="space-y-2 text-center">
                    <h3 className="text-xl font-semibold">Create New Cover Letter</h3>
                    <p className="text-sm text-muted-foreground">
                      Build a personalized cover letter for your job application
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </Card>

          {/* Previous Cover Letters */}
          {coverLetters.length === 0 ? (
            <Card className="flex items-center justify-center p-8">
              <div className="text-center text-muted-foreground">
                <FileText className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p>No cover letters created yet</p>
                <p className="text-sm">
                  Create your first cover letter to get started
                </p>
              </div>
            </Card>
          ) : (
            coverLetters.map((letter) => (
              <Card
                key={letter.id}
                className="group h-full transition-all hover:border-primary hover:shadow-lg"
              >
                <div className="relative h-full">
                  {/* Animated gradient background */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/5 via-primary/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                  <div className="relative flex h-full flex-col p-8">
                    <div className="flex-1 space-y-6">
                      <div className="flex items-center justify-between">
                        <div
                          className={cn(
                            "rounded-xl bg-background/80 p-3 backdrop-blur-sm",
                            "border-2 border-primary/20 group-hover:border-primary/40",
                            "transition-all duration-300",
                          )}
                        >
                          <FileText className="h-8 w-8 text-primary" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold transition-colors group-hover:text-primary">
                          {letter.title}
                        </h3>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="mr-2 h-4 w-4" />
                          {formatDate(letter.createdAt)}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {letter.companyName} • {letter.jobTitle}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-6">
                      <Button
                        variant="outline"
                        className="w-full backdrop-blur-sm transition-colors group-hover:border-primary/40 group-hover:bg-primary/5"
                        onClick={() => handleDownload(letter.fileUrl, letter.title)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                      <Button
                        className="w-full backdrop-blur-sm"
                        onClick={() =>
                          router.push(
                            `/document-preparation/cover-letter-builder/${letter.id}/view`,
                          )
                        }
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
