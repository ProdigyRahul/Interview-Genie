"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UploadJobDescriptionDialog } from "@/components/job-description/upload-dialog";
import { Search, ArrowRight, Plus, Briefcase } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

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

  return (
    <div className="container mx-auto py-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4"
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Job Descriptions</h1>
            <p className="text-muted-foreground mt-2">
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
              <Card className="group relative overflow-hidden border bg-card hover:shadow-xl transition-all duration-300">
                <div className="relative z-10 p-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 relative z-10">
                        <Briefcase className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-semibold tracking-tight text-primary transition-colors duration-300">
                          {job.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {job.company}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Added on {new Date(job.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3 pt-4">
                      <Button
                        variant="outline"
                        className="w-full group/button relative z-10 hover:bg-background/80 hover:border-primary/50 transition-all duration-300"
                        onClick={() => router.push(`/interview-preparation/questions/${job.id}`)}
                      >
                        Practice Interview Questions
                        <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover/button:translate-x-1" />
                      </Button>
                      <Button
                        className="w-full relative z-10 bg-primary hover:bg-primary/90 transition-all duration-300"
                        onClick={() => router.push(`/interview-preparation/questions/${job.id}/practice`)}
                      >
                        Start Mock Interview
                        <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-transparent transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:scale-110 blur-sm">
                  <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 group-hover:from-primary/5 group-hover:via-purple-500/5 group-hover:to-blue-500/5" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-transparent transition-all duration-300 group-hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 group-hover:from-primary/5 group-hover:via-purple-500/5 group-hover:to-blue-500/5" />
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