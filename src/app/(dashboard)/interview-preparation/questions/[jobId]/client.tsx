"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  MessageSquare,
  ThumbsUp,
  CalendarClock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { JOBS, QUESTIONS } from "./data";
import { motion } from "framer-motion";

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

interface QuestionSet {
  technical: string[];
  behavioral: string[];
  situational: string[];
}

export function InterviewQuestionsClient({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [questions, setQuestions] = useState<QuestionSet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to get job from localStorage first
    const loadData = () => {
      setLoading(true);
      let jobData: Job | null = null;
      let questionData: QuestionSet | null = null;

      // Check localStorage for job
      try {
        const storedJobs = localStorage.getItem('jobs');
        if (storedJobs) {
          const parsedJobs = JSON.parse(storedJobs);
          if (parsedJobs[jobId]) {
            jobData = parsedJobs[jobId];
          }
        }
      } catch (e) {
        console.error("Error loading job from localStorage:", e);
      }

      // If not found in localStorage, check predefined data
      if (!jobData && JOBS[jobId as keyof typeof JOBS]) {
        jobData = JOBS[jobId as keyof typeof JOBS];
      }

      // Check localStorage for questions
      try {
        const storedQuestions = localStorage.getItem('questions');
        if (storedQuestions) {
          const parsedQuestions = JSON.parse(storedQuestions);
          if (parsedQuestions[jobId]) {
            questionData = parsedQuestions[jobId];
          }
        }
      } catch (e) {
        console.error("Error loading questions from localStorage:", e);
      }

      // If not found in localStorage, check predefined data
      if (!questionData && QUESTIONS[jobId as keyof typeof QUESTIONS]) {
        questionData = QUESTIONS[jobId as keyof typeof QUESTIONS];
      }

      setJob(jobData);
      setQuestions(questionData);
      setLoading(false);
    };

    loadData();
  }, [jobId]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-b-transparent"></div>
      </div>
    );
  }

  if (!job || !questions) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold">Job not found</h1>
        <Button variant="link" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-8 py-6">
      <div className="space-y-4">
        <Button variant="ghost" className="gap-2" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="flex flex-col gap-2">
          <h1 className="flex items-center gap-3 text-4xl font-bold tracking-tight">
            <Briefcase className="h-8 w-8 text-primary" />
            {job.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xl text-muted-foreground">
            <span className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {job.company}
            </span>
            <span className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5" />
              Added on {job.date}
            </span>
          </div>
        </div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        <Card className="overflow-hidden bg-muted/30 p-6">
          <div className="flex justify-between">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Practice This Interview</h2>
              <p className="text-muted-foreground">
                Put your skills to the test with a simulated interview
              </p>
            </div>
            <Button 
              className="gap-2"
              onClick={() => router.push(`/interview-preparation/questions/${jobId}/practice`)}
            >
              Start Mock Interview
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        <Tabs defaultValue="technical" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="technical">Technical</TabsTrigger>
            <TabsTrigger value="behavioral">Behavioral</TabsTrigger>
            <TabsTrigger value="situational">Situational</TabsTrigger>
          </TabsList>

          <div className="grid gap-6">
            <TabsContent value="technical" className="space-y-6 mt-0">
              <motion.div variants={container} initial="hidden" animate="show">
                {questions.technical.map((question, index) => (
                  <motion.div key={index} variants={item}>
                    <QuestionCard question={question} index={index} />
                  </motion.div>
                ))}
              </motion.div>
            </TabsContent>

            <TabsContent value="behavioral" className="space-y-6 mt-0">
              <motion.div variants={container} initial="hidden" animate="show">
                {questions.behavioral.map((question, index) => (
                  <motion.div key={index} variants={item}>
                    <QuestionCard question={question} index={index} />
                  </motion.div>
                ))}
              </motion.div>
            </TabsContent>

            <TabsContent value="situational" className="space-y-6 mt-0">
              <motion.div variants={container} initial="hidden" animate="show">
                {questions.situational.map((question, index) => (
                  <motion.div key={index} variants={item}>
                    <QuestionCard question={question} index={index} />
                  </motion.div>
                ))}
              </motion.div>
            </TabsContent>
          </div>
        </Tabs>
      </motion.div>
    </div>
  );
}

function QuestionCard({
  question,
  index,
}: {
  question: string;
  index: number;
}) {
  return (
    <Card className="group relative overflow-hidden border bg-card transition-all hover:shadow-md">
      <CardHeader>
        <CardTitle className="flex items-start gap-4 text-xl">
          <span className="text-primary">Q{index + 1}.</span>
          {question}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Practice Answer
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <ThumbsUp className="h-4 w-4" />
            View Sample Answer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
