"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CalendarClock,
  Upload,
  Search,
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { UploadJobDescriptionDialog } from "@/components/job-description/upload-dialog";
import { JOBS } from "../questions/[jobId]/data";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
};

interface Job {
  id: string;
  title: string;
  company: string;
  date: string;
  description: string;
}

export default function JobDescriptionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [localJobs, setLocalJobs] = useState<Record<string, Job>>({});
  const router = useRouter();

  // On component mount, check for jobs in localStorage
  useEffect(() => {
    const storedJobs = localStorage.getItem('jobs');
    if (storedJobs) {
      try {
        setLocalJobs(JSON.parse(storedJobs));
      } catch (e) {
        console.error("Error parsing stored jobs:", e);
      }
    }
  }, []);

  // Combine default jobs with any from localStorage
  const allJobs = { ...JOBS, ...localJobs };
  
  // Convert the combined jobs object to an array for filtering
  const jobsArray = Object.values(allJobs);

  // Filter jobs based on search query
  const filteredJobs = jobsArray.filter((job) =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto space-y-8 py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Job Descriptions</h1>
        <p className="text-lg text-muted-foreground">
          Generate interview questions based on job descriptions
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by job title or company"
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <UploadJobDescriptionDialog />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {filteredJobs.length === 0 ? (
          <div className="col-span-full rounded-lg border border-dashed p-10 text-center">
            <h3 className="text-lg font-medium">No job descriptions found</h3>
            <p className="mt-2 text-muted-foreground">
              Try a different search or upload a new job description
            </p>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <motion.div key={job.id} variants={item}>
              <Card className="group overflow-hidden hover:shadow-md">
                <div className="border-b p-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                      <h3 className="text-xl font-semibold">{job.title}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      <span>{job.company}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarClock className="h-4 w-4" />
                      <span>Added on {job.date}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    <p className="line-clamp-3 text-sm text-muted-foreground">
                      {job.description}
                    </p>
                    <div className="space-y-3 pt-4">
                      <Button
                        variant="outline"
                        className="group/button relative w-full transition-all duration-300 hover:border-primary/50 hover:bg-background/80"
                        onClick={() =>
                          router.push(
                            `/interview-preparation/questions/${job.id}`,
                          )
                        }
                      >
                        Practice Interview Questions
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover/button:translate-x-1" />
                      </Button>
                      <Button
                        className="relative w-full bg-primary transition-all duration-300 hover:bg-primary/90"
                        onClick={() =>
                          router.push(
                            `/interview-preparation/questions/${job.id}/practice`,
                          )
                        }
                      >
                        Start Mock Interview
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
}
