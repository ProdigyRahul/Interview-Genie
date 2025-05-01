"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  FileText,
  Plus,
  Download,
  Eye,
  Clock,
  FileSpreadsheet,
  Linkedin,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface LinkedInProfile {
  id: string;
  title: string;
  profileUrl: string;
  profileName: string;
  optimizationScore?: number;
  analysisResults: any;
  createdAt: string;
  fileUrl?: string;
}

const loadingStates = [
  { text: "Fetching your LinkedIn optimizations...", duration: 2000 },
  { text: "Loading profile analyses...", duration: 2000 },
  { text: "Preparing your workspace...", duration: 2000 },
  { text: "Almost ready...", duration: 2000 },
];

export default function LinkedInOptimizerPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<LinkedInProfile[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);

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

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setIsLoadingProfiles(true);
      // In a real implementation, this would fetch profiles processed by the Gemini API
      const response = await fetch("/api/linkedin-profiles");
      const data = await response.json();

      if (data.success) {
        setProfiles(data.profiles);
      } else {
        console.error("Failed to fetch LinkedIn profiles:", data.error);
        setProfiles([]);
      }
    } catch (error) {
      console.error("Error fetching LinkedIn profiles:", error);
      // For now, set to empty array for demo purposes
      setProfiles([]);
    } finally {
      setIsLoadingProfiles(false);
    }
  };

  const handleCreateNew = () => {
    router.push("/document-preparation/linkedin-optimizer/new");
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
            Enhance your LinkedIn profile with AI-powered optimization and professional recommendations
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Create New LinkedIn Optimization Card */}
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
                    <h3 className="text-xl font-semibold">Create New Optimization</h3>
                    <p className="text-sm text-muted-foreground">
                      Get professional recommendations to enhance your LinkedIn profile
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </Card>

          {/* Previous Profiles */}
          {profiles.length === 0 ? (
            <Card className="flex items-center justify-center p-8">
              <div className="text-center text-muted-foreground">
                <Linkedin className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p>No LinkedIn profiles optimized yet</p>
                <p className="text-sm">
                  Upload your LinkedIn profile PDF to get started
                </p>
              </div>
            </Card>
          ) : (
            profiles.map((profile) => (
              <Card
                key={profile.id}
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
                          <Linkedin className="h-8 w-8 text-primary" />
                        </div>
                        {profile.optimizationScore && (
                          <div className="flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1.5 font-medium text-blue-500 backdrop-blur-sm">
                            <span>{profile.optimizationScore}%</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold transition-colors group-hover:text-primary">
                          {profile.profileName}
                        </h3>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="mr-2 h-4 w-4" />
                          {formatDate(profile.createdAt)}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {profile.title}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-6">
                      {profile.fileUrl && (
                        <Button
                          variant="outline"
                          className="w-full backdrop-blur-sm transition-colors group-hover:border-primary/40 group-hover:bg-primary/5"
                          onClick={() => handleDownload(profile.fileUrl!, profile.title)}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Report
                        </Button>
                      )}
                      <Button
                        className="w-full backdrop-blur-sm"
                        onClick={() =>
                          router.push(
                            `/document-preparation/linkedin-optimizer/${profile.id}/view`,
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