"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  FileText,
  Video,
  BookOpen,
  BarChart,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const features = [
  {
    title: "Document Preparation",
    description: "Create and optimize your resume, LinkedIn profile, and more",
    icon: FileText,
    href: "/document-preparation",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    hoverColor: "group-hover:bg-blue-500/20",
    items: [
      "AI Resume Builder",
      "Resume Optimizer",
      "LinkedIn Profile Creator",
      "Cover Letter Generator",
    ],
  },
  {
    title: "Interview Preparation",
    description: "Practice with AI-powered mock interviews and get instant feedback",
    icon: Video,
    href: "/interview-preparation",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    hoverColor: "group-hover:bg-purple-500/20",
    items: [
      "Video Interviews",
      "Audio Interviews",
      "Technical Interviews",
      "Behavioral Interviews",
    ],
  },
  {
    title: "Resources",
    description: "Access curated learning materials and interview guides",
    icon: BookOpen,
    href: "/resources",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    hoverColor: "group-hover:bg-green-500/20",
    items: [
      "Interview Questions",
      "Company Guides",
      "Industry Insights",
      "Career Tips",
    ],
  },
  {
    title: "Progress & Analytics",
    description: "Track your performance and improvement over time",
    icon: BarChart,
    href: "/progress",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    hoverColor: "group-hover:bg-orange-500/20",
    items: [
      "Performance Analytics",
      "Interview History",
      "Skill Assessment",
      "Certificates",
    ],
  },
];

export function FeatureNav() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
      {features.map((feature) => (
        <Link key={feature.title} href={feature.href} className="block">
          <Card className="group h-full transition-all hover:border-primary hover:shadow-lg">
            <div className="relative h-full p-4 md:p-6">
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg" />
              
              <div className="relative space-y-4">
                <div className="flex items-center justify-between">
                  <div className={cn(
                    "p-2.5 w-fit rounded-lg transition-colors duration-300",
                    feature.bgColor,
                    feature.hoverColor
                  )}>
                    <feature.icon className={cn(
                      "h-6 w-6 transition-transform group-hover:scale-110",
                      feature.color
                    )} />
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-1.5">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {feature.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {feature.items.map((item) => (
                    <div
                      key={item}
                      className="flex items-center text-sm text-muted-foreground group-hover:text-muted-foreground/80"
                    >
                      <Sparkles className={cn("h-3.5 w-3.5 mr-1.5", feature.color)} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
} 