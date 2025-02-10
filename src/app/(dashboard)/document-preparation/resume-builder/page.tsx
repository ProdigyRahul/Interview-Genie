"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";
import { FileText, Plus, Upload, Clock, Star, Eye, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { generateResumeContent } from "@/lib/gemini";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { SkillsInput } from "@/components/ui/skills-input";

interface Resume {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  atsScore?: number | null;
}

const loadingStates = [
  { text: "Analyzing your information..." },
  { text: "Preparing resume structure..." },
  { text: "Optimizing for ATS..." },
  { text: "Applying professional formatting..." },
  { text: "Finalizing your resume..." },
];

interface FormData {
  name: string;
  email: string;
  phone: string;
  jobTitle: string;
  experience: string;
  skills: string[];
  location: string;
  linkedIn: string;
  portfolio: string;
}

export default function ResumeBuilderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({});
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoadingResumes, setIsLoadingResumes] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    jobTitle: "",
    experience: "",
    skills: [],
    location: "",
    linkedIn: "",
    portfolio: "",
  });

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        setIsLoadingResumes(true);
        const response = await fetch('/api/resumes');
        if (!response.ok) {
          throw new Error('Failed to fetch resumes');
        }
        const data = await response.json();
        setResumes(data);
      } catch (error) {
        console.error('Error fetching resumes:', error);
        toast.error('Failed to load resumes');
      } finally {
        setIsLoadingResumes(false);
      }
    };

    fetchResumes();
  }, []);

  const handleCreateNew = () => {
    setShowDialog(true);
  };

  const handleGenerateAI = async (field: string) => {
    try {
      setIsGenerating({ ...isGenerating, [field]: true });
      const context = {
        jobTitle: field === 'jobTitle' ? '' : formData.jobTitle,
        experience: formData.experience,
        skills: formData.skills
      };

      const response = await generateResumeContent(field, context);
      if (response.content) {
        setFormData({ ...formData, [field]: response.content });
        toast.success('Content generated successfully!');
      } else {
        toast.error('Failed to generate content. Please try again.');
      }
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating({ ...isGenerating, [field]: false });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowDialog(false);
    setLoading(true);
    
    try {
      const response = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.name,
          email: formData.email,
          phoneNumber: formData.phone,
          jobTitle: formData.jobTitle,
          yearsOfExperience: formData.experience,
          keySkills: formData.skills.join(", "),
          location: formData.location,
          linkedIn: formData.linkedIn,
          portfolio: formData.portfolio
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create resume');
      }

      const result = await response.json();
      toast.success('Resume created successfully!');
      router.push(`/document-preparation/resume-builder/editor/${result.id}`);
    } catch (error) {
      console.error('Error creating resume:', error);
      toast.error('Failed to create resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    const now = new Date();
    const d = new Date(date);
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
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
        <Card className="group h-full transition-all hover:border-primary hover:shadow-lg">
          <div className="relative h-full">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg" />
            
            <button 
              onClick={handleCreateNew}
              className="relative w-full block p-8 h-full"
            >
              <div className="h-full space-y-6">
                <div className="flex items-center justify-center h-32">
                  <div className={cn(
                    "p-6 rounded-full bg-background/80 backdrop-blur-sm",
                    "border-2 border-primary/20 group-hover:border-primary/40",
                    "group-hover:scale-110 transition-all duration-300"
                  )}>
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
          </div>
        </Card>

        {/* Previous Resumes */}
        {isLoadingResumes ? (
          <Card className="p-8 flex items-center justify-center">
            <div className="animate-spin">
              <FileText className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </Card>
        ) : resumes.length === 0 ? (
          <Card className="p-8 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No resumes created yet</p>
              <p className="text-sm">Create your first resume to get started</p>
            </div>
          </Card>
        ) : (
          resumes.map((resume) => (
            <Card key={resume.id} className="group h-full transition-all hover:border-primary hover:shadow-lg">
              <div className="relative h-full">
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg" />
                
                <div className="relative p-8 h-full flex flex-col">
                  <div className="flex-1 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className={cn(
                        "p-3 rounded-xl bg-background/80 backdrop-blur-sm",
                        "border-2 border-primary/20 group-hover:border-primary/40",
                        "transition-all duration-300"
                      )}>
                        <FileText className="h-8 w-8 text-primary" />
                      </div>
                      {resume.atsScore && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 text-yellow-500 font-medium backdrop-blur-sm">
                          <Star className="h-4 w-4 fill-current" />
                          <span>{resume.atsScore}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-semibold text-xl group-hover:text-primary transition-colors">
                        {resume.title}
                      </h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-2" />
                        {formatDate(resume.updatedAt)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-6 mt-6 border-t border-border">
                    <Button 
                      variant="outline" 
                      className="w-full group-hover:border-primary/40 group-hover:bg-primary/5 transition-colors backdrop-blur-sm"
                      onClick={() => router.push(`/document-preparation/resume-builder/editor/${resume.id}`)}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Update
                    </Button>
                    <Button 
                      className="w-full backdrop-blur-sm"
                      onClick={() => router.push(`/document-preparation/resume-builder/view/${resume.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
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
                <Label htmlFor="jobTitle">Professional Title</Label>
                <Input
                  id="jobTitle"
                  placeholder="Senior Software Engineer"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
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
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 234 567 8900"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="City, Country"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
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
                <Label htmlFor="linkedIn">LinkedIn</Label>
                <Input
                  id="linkedIn"
                  placeholder="linkedin.com/in/johndoe"
                  value={formData.linkedIn}
                  onChange={(e) => setFormData({ ...formData, linkedIn: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="portfolio">Portfolio Website</Label>
                <Input
                  id="portfolio"
                  placeholder="johndoe.com"
                  value={formData.portfolio}
                  onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="skills">Key Skills</Label>
                <SkillsInput
                  value={formData.skills}
                  onChange={(skills) => setFormData({ ...formData, skills })}
                  placeholder="Type skills and press Enter or comma (e.g. React, Node.js)"
                />
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="min-w-[120px]" disabled={loading}>
                {loading ? "Creating..." : "Generate Resume"}
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