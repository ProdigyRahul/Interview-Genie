"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";
import { FileText, Plus, Upload, Clock, Star, Eye } from "lucide-react";
import { useRouter } from "next/navigation";

// Mock data - replace with API call
const previousResumes = [
  {
    id: 1,
    title: "Software Engineer Resume",
    lastUpdated: "2 days ago",
    score: 92,
  },
  {
    id: 2,
    title: "Full Stack Developer Resume",
    lastUpdated: "1 week ago",
    score: 88,
  },
];

const loadingStates = [
  { text: "Analyzing your information..." },
  { text: "Preparing resume structure..." },
  { text: "Optimizing for ATS..." },
  { text: "Applying professional formatting..." },
  { text: "Finalizing your resume..." },
];

export default function ResumeBuilderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    jobTitle: "",
    experience: "",
    skills: "",
  });

  const handleCreateNew = () => {
    setShowDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowDialog(false);
    setLoading(true);
    
    // Simulate a longer loading process for better UX
    setTimeout(() => {
      setLoading(false);
      router.push("/document-preparation/resume-builder/editor");
    }, 4000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Resume Builder</h2>
        <p className="text-muted-foreground">
          Create a professional resume with AI assistance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Create New Resume Card */}
        <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
          <button 
            onClick={handleCreateNew}
            className="relative w-full block p-8 h-full"
          >
            <div className="h-full space-y-6">
              <div className="flex items-center justify-center h-32">
                <div className="p-6 rounded-full bg-background border-2 border-primary/20 group-hover:border-primary group-hover:scale-110 transition-all duration-300">
                  <Plus className="h-10 w-10 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-xl">Create New Resume</h3>
                <p className="text-sm text-muted-foreground">
                  Start fresh with our AI-powered resume builder
                </p>
              </div>
            </div>
          </button>
        </Card>

        {/* Previous Resumes */}
        {previousResumes.map((resume) => (
          <Card key={resume.id} className="group relative overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
            <div className="relative p-8 h-full flex flex-col">
              <div className="flex-1 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-background border-2 border-primary/20 group-hover:border-primary transition-all duration-300">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 text-yellow-500 font-medium">
                    <Star className="h-4 w-4 fill-current" />
                    <span>{resume.score}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-xl group-hover:text-primary transition-colors">
                    {resume.title}
                  </h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    {resume.lastUpdated}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 mt-6 border-t border-border">
                <Button 
                  variant="outline" 
                  className="w-full group-hover:border-primary group-hover:bg-primary/5 transition-colors"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Update
                </Button>
                <Button className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Resume Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Resume</DialogTitle>
            <DialogDescription>
              Fill in your basic information to get started with your professional resume
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Contact Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Your phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  placeholder="Senior Software Engineer"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  id="experience"
                  type="number"
                  placeholder="5"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skills">Key Skills</Label>
                <Input
                  id="skills"
                  placeholder="React, Node.js, TypeScript"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="min-w-[120px]">
                Generate Resume
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <MultiStepLoader 
        loadingStates={loadingStates} 
        loading={loading} 
        duration={800}
      />
    </div>
  );
} 