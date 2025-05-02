"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CalendarClock,
  Video,
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
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

export default function VideoInterviewPage() {
  const router = useRouter();
  const [jobsArray, setJobsArray] = useState<any[]>([]);

  useEffect(() => {
    // Merge jobs from local storage with predefined jobs
    let allJobs = {};
    
    // Get jobs from localStorage
    try {
      const storedJobs = localStorage.getItem('jobs');
      if (storedJobs) {
        const parsedJobs = JSON.parse(storedJobs);
        allJobs = { ...parsedJobs };
      }
    } catch (e) {
      console.error("Error loading jobs from localStorage:", e);
    }
    
    // Merge with predefined jobs (but give priority to localStorage jobs)
    allJobs = { ...JOBS, ...allJobs };
    
    // Convert to array
    setJobsArray(Object.values(allJobs));
  }, []);

  return (
    <div className="container mx-auto space-y-8 py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Video Interviews</h1>
        <p className="text-lg text-muted-foreground">
          Practice with AI video interviews with posture and expression analysis
        </p>
      </div>

      {jobsArray.length === 0 ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="text-center">
            <p className="mb-4 text-muted-foreground">No job descriptions found. Add one to get started.</p>
            <Button onClick={() => router.push('/interview-preparation/job-descriptions')}>
              Add Job Description
            </Button>
          </div>
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {jobsArray.map((job) => (
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
                    <Button
                      className="relative w-full bg-primary transition-all duration-300 hover:bg-primary/90 gap-2"
                      onClick={() =>
                        router.push(
                          `/interview-preparation/questions/${job.id}/practice`,
                        )
                      }
                    >
                      <Video className="h-4 w-4" />
                      Start Video Interview
                      <ArrowRight className="ml-auto h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
} 