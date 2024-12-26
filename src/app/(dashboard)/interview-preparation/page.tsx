"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Video, Mic, Brain, Target } from "lucide-react";

const interviewTypes = [
  {
    title: "Video Interview",
    description: "Practice with video interviews",
    icon: Video,
    href: "/interview-preparation/video",
  },
  {
    title: "Audio Interview",
    description: "Practice with audio interviews",
    icon: Mic,
    href: "/interview-preparation/audio",
  },
  {
    title: "Technical Interview",
    description: "Practice coding interviews",
    icon: Brain,
    href: "/interview-preparation/technical",
  },
  {
    title: "Behavioral Interview",
    description: "Practice behavioral questions",
    icon: Target,
    href: "/interview-preparation/behavioral",
  },
];

export default function InterviewPreparationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Interview Preparation</h2>
        <p className="text-muted-foreground">Choose an interview type to practice</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {interviewTypes.map((type) => (
          <Link key={type.title} href={type.href}>
            <Card className="p-6 hover:bg-muted/50">
              <div className="space-y-2">
                <type.icon className="h-8 w-8 text-primary" />
                <h3 className="font-semibold">{type.title}</h3>
                <p className="text-sm text-muted-foreground">{type.description}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
} 