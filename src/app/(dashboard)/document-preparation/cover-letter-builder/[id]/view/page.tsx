"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { FileText, Download, ArrowLeft, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";
import { format } from "date-fns";

interface CoverLetter {
  id: string;
  title: string;
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  jobTitle: string;
  hiringManager: string | null;
  content: string;
  fileUrl: string;
  createdAt: string;
}

const loadingStates = [
  { text: "Loading your cover letter..." },
  { text: "Retrieving content..." },
  { text: "Preparing document..." },
  { text: "Almost ready..." },
];

export default function ViewCoverLetterPage() {
  const params = useParams();
  const router = useRouter();
  const [letter, setLetter] = useState<CoverLetter | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      href: `/document-preparation/cover-letter-builder/${params.id}/view`,
      label: "View Cover Letter",
      icon: FileText,
    },
  ];

  useEffect(() => {
    fetchCoverLetter();
  }, [params.id]);

  const fetchCoverLetter = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/cover-letter/${params.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch cover letter");
      }

      setLetter(data.coverLetter);
    } catch (error) {
      console.error("Error fetching cover letter:", error);
      toast.error("Failed to load cover letter");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!letter) return;
    
    try {
      // Create a link element to download the file
      const link = document.createElement('a');
      link.href = letter.fileUrl;
      link.download = `${letter.title.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Cover letter downloaded successfully!");
    } catch (error) {
      console.error("Error downloading cover letter:", error);
      toast.error("Failed to download cover letter. Please try again.");
    }
  };

  const handleBack = () => {
    router.push("/document-preparation/cover-letter-builder");
  };

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

  if (!letter) {
    return (
      <div className="space-y-8">
        <Breadcrumb items={breadcrumbItems} className="mb-6" />
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
            <div className="rounded-full bg-muted p-4">
              <FileText className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold">Cover Letter Not Found</h3>
            <p className="text-muted-foreground">
              The cover letter you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button onClick={handleBack} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Cover Letters
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
            <h2 className="text-3xl font-bold tracking-tight">{letter.title}</h2>
            <p className="text-muted-foreground">
              Created on {format(new Date(letter.createdAt), "MMMM d, yyyy")}
            </p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>

        <Card className="p-8 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-900 min-h-full font-serif">
            {/* Header section */}
            <div className="mb-6">
              <h1 className="text-xl font-bold mb-1">{letter.fullName}</h1>
              <p className="text-sm">{letter.email}</p>
              <p className="text-sm">{letter.phone}</p>
              <p className="text-sm">{format(new Date(letter.createdAt), "MMMM d, yyyy")}</p>
            </div>
            
            {/* Recipient */}
            <div className="mb-6">
              <p className="font-medium">{letter.hiringManager || "Hiring Manager"}</p>
              <p>{letter.companyName}</p>
              <p>[Company Address, if known, otherwise omit]</p>
            </div>
            
            {/* Salutation */}
            <p className="mb-4">Dear {letter.hiringManager || "Hiring Manager"},</p>
            
            {/* Letter body - properly formatted paragraphs */}
            <div className="space-y-4 text-justify">
              {letter.content.split("\n\n").map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
            
            {/* Closing */}
            <div className="mt-6">
              <p className="mb-4">Sincerely,</p>
              <p className="font-bold">{letter.fullName}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 