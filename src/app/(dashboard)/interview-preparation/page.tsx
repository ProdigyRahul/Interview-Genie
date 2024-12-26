"use client";

import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Video, Mic, Brain, Users, FileText } from "lucide-react";
import Link from "next/link";

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

const interviewTypes = [
  {
    icon: FileText,
    title: "Job Description",
    description: "Generate interview questions based on job descriptions",
    href: "/interview-preparation/job-descriptions",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    gradientFrom: "group-hover:from-blue-500/5",
    gradientTo: "group-hover:to-purple-500/5",
  },
  {
    icon: Video,
    title: "Video Interview",
    description: "Practice with video interviews",
    href: "/interview-preparation/video",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    gradientFrom: "group-hover:from-purple-500/5",
    gradientTo: "group-hover:to-pink-500/5",
  },
  {
    icon: Mic,
    title: "Audio Interview",
    description: "Practice with audio interviews",
    href: "/interview-preparation/audio",
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    gradientFrom: "group-hover:from-pink-500/5",
    gradientTo: "group-hover:to-rose-500/5",
  },
  {
    icon: Brain,
    title: "Technical Interview",
    description: "Practice coding interviews",
    href: "/interview-preparation/technical",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    gradientFrom: "group-hover:from-green-500/5",
    gradientTo: "group-hover:to-emerald-500/5",
  },
  {
    icon: Users,
    title: "Behavioral Interview",
    description: "Practice behavioral questions",
    href: "/interview-preparation/behavioral",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    gradientFrom: "group-hover:from-orange-500/5",
    gradientTo: "group-hover:to-yellow-500/5",
  },
];

export default function InterviewPreparationPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-4xl font-bold tracking-tight">Interview Preparation</h1>
        <p className="text-muted-foreground text-lg">
          Choose an interview type to practice
        </p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {interviewTypes.map((type) => {
          const Icon = type.icon;
          return (
            <motion.div key={type.title} variants={item}>
              <Link href={type.href} className="block">
                <Card className="group relative overflow-hidden border bg-card hover:shadow-xl transition-all duration-300">
                  <div className="relative z-10 p-6">
                    <div className="flex flex-col space-y-4">
                      <div className={`${type.bgColor} w-12 h-12 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 relative z-10`}>
                        <Icon className={`w-6 h-6 ${type.color}`} />
                      </div>
                      <div className="space-y-2">
                        <h2 className={`text-2xl font-semibold tracking-tight transition-colors duration-300 ${type.color}`}>
                          {type.title}
                        </h2>
                        <p className="text-muted-foreground">
                          {type.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-transparent transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:scale-110 blur-sm">
                    <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${type.gradientFrom} ${type.gradientTo}`} />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-transparent transition-all duration-300 group-hover:scale-105">
                    <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${type.gradientFrom} ${type.gradientTo}`} />
                  </div>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
} 