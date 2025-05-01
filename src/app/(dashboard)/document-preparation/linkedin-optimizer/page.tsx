"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  Plus,
  Download,
  Eye,
  Clock,
  FileSpreadsheet,
  Linkedin,
} from "lucide-react";
import { toast } from "sonner";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface LinkedInProfile {
  id: string;
  title: string;
  profileUrl: string;
  profileName: string;
  optimizationScore: number;
  analysisResults: any;
  createdAt: string;
  fileUrl: string;
}

const loadingStates = [
  { text: "Fetching your LinkedIn profiles..." },
  { text: "Preparing data..." },
  { text: "Almost ready..." },
];

export default function LinkedInOptimizerPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<LinkedInProfile[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setIsLoadingProfiles(true);
        // Replace this with a real API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        const response = await fetch("/api/linkedin-profiles");
        if (!response.ok) {
          throw new Error("Failed to fetch profiles");
        }
        
        const data = await response.json();
        if (data.success) {
          setProfiles(data.profiles);
        }
      } catch (error) {
        console.error("Error fetching LinkedIn profiles:", error);
        toast.error("Failed to load LinkedIn profiles");
      } finally {
        setIsLoadingProfiles(false);
      }
    };

    // Fix floating promise by using void operator
    void fetchProfiles();
  }, []);

  const handleCreateNew = () => {
    router.push("/document-preparation/linkedin-optimizer/new");
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-500";
    if (score >= 70) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBackgroundColor = (score: number) => {
    if (score >= 85) return "bg-green-500/10";
    if (score >= 70) return "bg-yellow-500/10";
    return "bg-red-500/10";
  };

  const handleView = (id: string) => {
    router.push(`/document-preparation/linkedin-optimizer/${id}/view`);
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
      
      toast.success("LinkedIn optimization report downloaded successfully!");
    } catch (error) {
      console.error("Error downloading report:", error);
      toast.error("Failed to download report. Please try again.");
    }
  };

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

  if (isLoadingProfiles) {
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

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            LinkedIn Profile Optimizer
          </h2>
          <p className="text-muted-foreground">
            Enhance your LinkedIn profile with AI-powered optimization and professional recommendations
          </p>
        </div>
        <Button onClick={handleCreateNew} className="sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Create New Optimization
        </Button>
      </div>

      <Breadcrumb
        items={[
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
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {profiles.length === 0 ? (
          <Card className="group h-full transition-all hover:border-primary/40 hover:shadow-lg">
            <div className="flex flex-col items-center justify-center p-8 text-center h-full space-y-4">
              <div className="rounded-full bg-muted/60 p-6 mb-2">
                <Linkedin className="h-12 w-12 text-muted-foreground/60" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">No Optimizations Yet</h3>
                <p className="text-muted-foreground max-w-sm">
                  Upload your LinkedIn profile PDF to receive AI-powered optimization recommendations and improve your professional presence.
                </p>
                <Button 
                  className="mt-4" 
                  onClick={handleCreateNew}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Optimization
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          profiles.map((profile) => (
            <Card
              key={profile.id}
              className="group transition-all hover:border-primary/40 hover:shadow-lg"
            >
              <div className="flex justify-between p-5 border-b">
                <div className="flex items-center">
                  <div
                    className={cn(
                      "mr-3 flex h-10 w-10 items-center justify-center rounded-full",
                      getScoreBackgroundColor(profile.optimizationScore)
                    )}
                  >
                    <span
                      className={cn(
                        "text-base font-semibold",
                        getScoreColor(profile.optimizationScore)
                      )}
                    >
                      {profile.optimizationScore}%
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold line-clamp-1">
                      {profile.profileName}
                    </h3>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      {formatDate(profile.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="flex items-start">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDownload(profile.fileUrl, profile.title)}
                    title="Download PDF"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-5">
                <h4 className="text-base font-semibold mb-4">
                  {profile.title}
                </h4>
                <div className="space-y-4 mb-5">
                  {profile.analysisResults.quick_wins.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium mb-2">Quick Wins:</h5>
                      <ul className="text-sm space-y-1 ml-5 list-disc">
                        {profile.analysisResults.quick_wins
                          .slice(0, 2)
                          .map((win: any, index: number) => (
                            <li key={index} className="text-muted-foreground">
                              {win.action}
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>
                <Button
                  className="w-full"
                  onClick={() => handleView(profile.id)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Report
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 