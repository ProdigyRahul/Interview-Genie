"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Briefcase, Building2, MessageSquare, ThumbsUp } from "lucide-react";
import { useRouter } from "next/navigation";

// Dummy data - replace with real data later
const JOB_DATA = {
  title: "Senior Frontend Developer",
  company: "Tech Corp",
  description: "We are looking for a senior frontend developer...",
};

const QUESTIONS = {
  technical: [
    "Explain the difference between React's useState and useEffect hooks",
    "How do you handle state management in large React applications?",
    "Describe your experience with TypeScript and its benefits",
  ],
  behavioral: [
    "Tell me about a challenging project you worked on",
    "How do you handle conflicts in a team?",
    "Describe your ideal work environment",
  ],
  situational: [
    "How would you handle a tight deadline with competing priorities?",
    "What would you do if you disagreed with a team member's approach?",
    "How would you onboard a new team member?",
  ],
};

export function InterviewQuestionsClient() {
  const router = useRouter();

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="space-y-4">
        <Button
          variant="ghost"
          className="gap-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
            <Briefcase className="h-8 w-8 text-primary" />
            {JOB_DATA.title}
          </h1>
          <p className="text-xl text-muted-foreground flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {JOB_DATA.company}
          </p>
        </div>
      </div>

      <Tabs defaultValue="technical" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-[400px]">
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="behavioral">Behavioral</TabsTrigger>
          <TabsTrigger value="situational">Situational</TabsTrigger>
        </TabsList>

        <div className="grid gap-6">
          <TabsContent value="technical" className="space-y-6">
            {QUESTIONS.technical.map((question, index) => (
              <QuestionCard key={index} question={question} index={index} />
            ))}
          </TabsContent>

          <TabsContent value="behavioral" className="space-y-6">
            {QUESTIONS.behavioral.map((question, index) => (
              <QuestionCard key={index} question={question} index={index} />
            ))}
          </TabsContent>

          <TabsContent value="situational" className="space-y-6">
            {QUESTIONS.situational.map((question, index) => (
              <QuestionCard key={index} question={question} index={index} />
            ))}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function QuestionCard({ question, index }: { question: string; index: number }) {
  return (
    <Card className="group relative overflow-hidden border bg-card hover:shadow-xl transition-all">
      <CardHeader>
        <CardTitle className="text-xl flex items-start gap-4">
          <span className="text-primary">Q{index + 1}.</span>
          {question}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Practice Answer
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <ThumbsUp className="w-4 h-4" />
            View Sample Answer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 