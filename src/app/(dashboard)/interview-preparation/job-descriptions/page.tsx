"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UploadJobDescriptionDialog } from "@/components/job-description/upload-dialog";
import { Search, ArrowRight, Plus, Briefcase } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const DUMMY_DATA = [
  {
    id: "1",
    title: "Senior Frontend Developer",
    company: "Tech Corp",
    description: "We are looking for a senior frontend developer...",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Full Stack Engineer",
    company: "Startup Inc",
    description: "Join our fast-growing team...",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "React Developer",
    company: "Innovation Labs",
    description: "Help us build the next generation...",
    createdAt: new Date().toISOString(),
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

export default function JobDescriptionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading] = useState(false);
  const router = useRouter();

  const filteredJobs = DUMMY_DATA.filter(
    (job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4"
      >
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Job Descriptions</h1>
            <p className="text-muted-foreground">
              Manage your job descriptions and prepare for interviews
            </p>
          </div>
          <Button className="gap-2 bg-primary hover:bg-primary/90" onClick={() => document.getElementById('addJobBtn')?.click()}>
            <Plus className="w-4 h-4" />
            Add Job Description
          </Button>
        </div>
      </motion.div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search job descriptions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 max-w-md bg-background"
        />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {isLoading ? (
          <div className="col-span-full flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filteredJobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full text-center py-12"
          >
            <p className="text-xl text-muted-foreground">No job descriptions found</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setSearchQuery("")}
            >
              Clear search
            </Button>
          </motion.div>
        ) : (
          filteredJobs.map((job) => (
            <motion.div key={job.id} variants={item}>
              <Card className="group h-full transition-all hover:border-primary hover:shadow-lg">
                <div className="relative h-full p-6">
                  {/* Animated gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg" />
                  
                  <div className="relative space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={cn(
                        "p-2.5 w-fit rounded-lg transition-colors duration-300",
                        "bg-primary/10",
                        "group-hover:bg-primary/20"
                      )}>
                        <Briefcase className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-2xl font-semibold mb-2">{job.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {job.company}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Added on {formatDate(job.createdAt)}
                      </p>
                    </div>

                    <div className="space-y-3 pt-4">
                      <Button
                        variant="outline"
                        className="w-full group/button relative hover:bg-background/80 hover:border-primary/50 transition-all duration-300"
                        onClick={() => router.push(`/interview-preparation/questions/${job.id}`)}
                      >
                        Practice Interview Questions
                        <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover/button:translate-x-1" />
                      </Button>
                      <Button
                        className="w-full relative bg-primary hover:bg-primary/90 transition-all duration-300"
                        onClick={() => router.push(`/interview-preparation/questions/${job.id}/practice`)}
                      >
                        Start Mock Interview
                        <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </motion.div>
      <div className="hidden">
        <UploadJobDescriptionDialog />
      </div>
    </div>
  );
} 