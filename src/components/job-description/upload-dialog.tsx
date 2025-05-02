"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, Sparkles, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { motion, AnimatePresence } from "framer-motion";

// Function to generate a formatted date string
const formatDate = () => {
  const today = new Date();
  return `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
};

export function UploadJobDescriptionDialog() {
  const router = useRouter();
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async () => {
    if (!jobTitle.trim() || !companyName.trim() || !jobDescription.trim()) {
      return;
    }

    setIsGenerating(true);

    try {
      // This would typically be an API call to generate questions with Gemini
      // For now, we'll simulate it with a timeout
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Create a job ID
      const jobId = uuidv4();
      
      // Normally you would save this to a database via an API call
      // For now we'll use local storage to simulate persistence
      const job = {
        id: jobId,
        title: jobTitle,
        company: companyName,
        description: jobDescription,
        date: formatDate(),
      };
      
      // Generate questions (in a real app this would be done by Gemini)
      const questions = {
        technical: [
          `Explain your experience with ${jobTitle.split(' ').pop()} development.`,
          `What recent technologies have you used in your ${jobTitle} role?`,
          `How do you approach testing in your ${jobTitle} work?`,
          `Describe your process for optimizing application performance.`,
          `What are your favorite development tools and why?`,
        ],
        behavioral: [
          "Tell me about a challenging project you worked on recently.",
          "How do you handle disagreements with team members?",
          "Describe a situation where you had to learn a new technology quickly.",
          "How do you prioritize tasks when working on multiple projects?",
          "Tell me about a time you had to deal with a tight deadline.",
        ],
        situational: [
          "How would you handle a situation where requirements change mid-project?",
          `What would you do if you discovered a critical bug in a ${jobTitle} project?`,
          "How would you approach mentoring a junior developer?",
          "What would you do if you disagreed with a design decision?",
          "How would you handle technical debt in a fast-paced environment?",
        ],
      };
      
      // Save to local storage
      const jobs = JSON.parse(localStorage.getItem('jobs') ?? '{}');
      jobs[jobId] = job;
      localStorage.setItem('jobs', JSON.stringify(jobs));
      
      const allQuestions = JSON.parse(localStorage.getItem('questions') ?? '{}');
      allQuestions[jobId] = questions;
      localStorage.setItem('questions', JSON.stringify(allQuestions));
      
      setIsComplete(true);
      
      // Give time for success animation before redirecting
      setTimeout(() => {
        setIsOpen(false);
        router.push(`/interview-preparation/questions/${jobId}`);
        
        // Reset form after a delay
        setTimeout(() => {
          setJobTitle("");
          setCompanyName("");
          setJobDescription("");
          setIsGenerating(false);
          setIsComplete(false);
        }, 500);
      }, 1500);
      
    } catch (error) {
      console.error("Error generating questions:", error);
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild id="addJobBtn">
        <Button className="gap-2" variant="outline">
          <Upload className="h-4 w-4" />
          Upload Description
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-5 w-5 text-primary" />
            Create Interview Questions
          </DialogTitle>
          <DialogDescription>
            Upload a job description to generate tailored interview questions using AI.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="jobTitle" className="text-sm font-medium">
                Job Title
              </label>
              <input
                id="jobTitle"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Senior Frontend Developer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                disabled={isGenerating}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="companyName" className="text-sm font-medium">
                Company Name
              </label>
              <input
                id="companyName"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Tech Corp"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={isGenerating}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="jobDescription" className="text-sm font-medium">
              Job Description
            </label>
            <Textarea
              id="jobDescription"
              className="min-h-[200px] resize-none"
              placeholder="Paste the full job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              disabled={isGenerating}
            />
          </div>
        </div>
        
        <DialogFooter>
          <AnimatePresence mode="wait">
            {isComplete ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-green-500"
              >
                <Check className="h-5 w-5" />
                <span>Questions generated successfully!</span>
              </motion.div>
            ) : (
              <motion.div key="buttons" className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isGenerating}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={!jobTitle || !companyName || !jobDescription || isGenerating}
                  className="gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating Questions...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Questions
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
