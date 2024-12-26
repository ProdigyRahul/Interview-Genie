"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  BookText,
  BriefcaseIcon,
  GraduationCap,
  Award,
  Heart,
  Brain,
  Users,
  Star,
  FileText,
  ArrowRight,
  CheckCircle,
  Plus,
  Trash2,
  ExternalLink,
  Medal,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Animation variants
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

const tabs = [
  {
    id: "personal",
    label: "Personal",
    icon: BookText,
    required: true,
  },
  {
    id: "experience",
    label: "Experience",
    icon: BriefcaseIcon,
    required: false,
  },
  {
    id: "projects",
    label: "Projects",
    icon: Star,
    required: false,
  },
  {
    id: "education",
    label: "Education",
    icon: GraduationCap,
    required: true,
  },
  {
    id: "certifications",
    label: "Certifications",
    icon: Award,
    required: false,
  },
  {
    id: "achievements",
    label: "Achievements",
    icon: Medal,
    required: false,
  },
  {
    id: "volunteering",
    label: "Volunteering",
    icon: Heart,
    required: false,
  },
  {
    id: "skills",
    label: "Skills",
    icon: Brain,
    required: false,
  },
  {
    id: "references",
    label: "References",
    icon: Users,
    required: false,
  },
  {
    id: "summary",
    label: "Summary",
    icon: FileText,
    required: false,
  },
  {
    id: "finish",
    label: "Finish Up",
    icon: CheckCircle,
    required: true,
  },
];

export default function ResumeEditorPage() {
  const [activeTab, setActiveTab] = useState("personal");
  const [experiences, setExperiences] = useState([{ id: 1 }]);
  const [projects, setProjects] = useState([{ id: 1 }]);
  const [education, setEducation] = useState([{ id: 1 }]);
  const [certifications, setCertifications] = useState([{ id: 1 }]);
  const [achievements, setAchievements] = useState([{ id: 1 }]);
  const [volunteering, setVolunteering] = useState([{ id: 1 }]);
  const [references, setReferences] = useState([{ id: 1 }]);

  const addItem = (section: string) => {
    const newItem = { id: Date.now() };
    switch (section) {
      case "experience":
        setExperiences([...experiences, newItem]);
        break;
      case "projects":
        setProjects([...projects, newItem]);
        break;
      case "education":
        setEducation([...education, newItem]);
        break;
      case "certifications":
        setCertifications([...certifications, newItem]);
        break;
      case "achievements":
        setAchievements([...achievements, newItem]);
        break;
      case "volunteering":
        setVolunteering([...volunteering, newItem]);
        break;
      case "references":
        setReferences([...references, newItem]);
        break;
    }
  };

  const removeItem = (section: string, id: number) => {
    switch (section) {
      case "experience":
        setExperiences(experiences.filter(item => item.id !== id));
        break;
      case "projects":
        setProjects(projects.filter(item => item.id !== id));
        break;
      case "education":
        setEducation(education.filter(item => item.id !== id));
        break;
      case "certifications":
        setCertifications(certifications.filter(item => item.id !== id));
        break;
      case "achievements":
        setAchievements(achievements.filter(item => item.id !== id));
        break;
      case "volunteering":
        setVolunteering(volunteering.filter(item => item.id !== id));
        break;
      case "references":
        setReferences(references.filter(item => item.id !== id));
        break;
    }
  };

  const renderSectionHeader = (title: string, description: string) => (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );

  const renderAddButton = (section: string, label: string) => (
    <Button
      variant="outline"
      className="w-full group hover:border-primary"
      onClick={() => addItem(section)}
    >
      <Plus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
      {label}
    </Button>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Resume Editor</h2>
        <p className="text-muted-foreground">
          Fill in your details to create a professional resume
        </p>
      </div>

      <Card>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="p-4 border-b">
            <TabsList className="w-full h-full grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={cn(
                    "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                    "flex items-center gap-2 py-2 group transition-all",
                    "hover:bg-primary/10"
                  )}
                >
                  <tab.icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span>{tab.label}</span>
                  {tab.required && (
                    <span className="text-[10px] text-red-500">*</span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={fadeIn}
                transition={{ duration: 0.3 }}
              >
                {/* Personal Tab */}
                <TabsContent value="personal" className="space-y-6">
                  {renderSectionHeader(
                    "Personal Information",
                    "Add your personal details and contact information"
                  )}
                  <Card className="p-4">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input placeholder="John Doe" />
                      </div>
                      <div className="space-y-2">
                        <Label>Professional Title</Label>
                        <Input placeholder="Senior Software Engineer" />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input type="email" placeholder="john@example.com" />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input placeholder="+1 234 567 8900" />
                      </div>
                      <div className="space-y-2">
                        <Label>Location</Label>
                        <Input placeholder="City, Country" />
                      </div>
                      <div className="space-y-2">
                        <Label>LinkedIn</Label>
                        <div className="flex gap-2">
                          <Input placeholder="linkedin.com/in/johndoe" />
                          <Button variant="outline" size="icon">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Portfolio Website</Label>
                        <div className="flex gap-2">
                          <Input placeholder="johndoe.com" />
                          <Button variant="outline" size="icon">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </TabsContent>

                {/* Summary Tab */}
                <TabsContent value="summary" className="space-y-6">
                  {renderSectionHeader(
                    "Professional Summary",
                    "Write a compelling summary of your professional background and goals"
                  )}
                  <Card className="p-4">
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Write a compelling professional summary..."
                        className="min-h-[200px] resize-none"
                      />
                      <div className="text-sm text-muted-foreground space-y-2">
                        <p>Tips for a great summary:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Keep it concise (3-5 sentences)</li>
                          <li>Highlight your key professional strengths</li>
                          <li>Mention your years of experience</li>
                          <li>Include your career goals</li>
                          <li>Use industry-specific keywords</li>
                        </ul>
                      </div>
                    </div>
                  </Card>
                </TabsContent>

                {/* Volunteering Tab */}
                <TabsContent value="volunteering" className="space-y-6">
                  {renderSectionHeader(
                    "Volunteer Experience",
                    "Add your volunteer work and community service"
                  )}
                  <div className="space-y-6">
                    <AnimatePresence>
                      {volunteering.map((vol, index) => (
                        <motion.div
                          key={vol.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Card className="p-4 group hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center gap-2">
                                <Heart className="h-5 w-5 text-muted-foreground" />
                                <span className="font-medium">Volunteer Experience {index + 1}</span>
                              </div>
                              {volunteering.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => removeItem("volunteering", vol.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              )}
                            </div>
                            <div className="grid gap-6 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label>Organization</Label>
                                <Input placeholder="Organization Name" />
                              </div>
                              <div className="space-y-2">
                                <Label>Role</Label>
                                <Input placeholder="Your role" />
                              </div>
                              <div className="space-y-2">
                                <Label>Start Date</Label>
                                <Input type="date" />
                              </div>
                              <div className="space-y-2">
                                <Label>End Date</Label>
                                <Input type="date" />
                              </div>
                              <div className="space-y-2 md:col-span-2">
                                <Label>Description</Label>
                                <Textarea
                                  placeholder="Describe your volunteer work and impact..."
                                  className="h-32"
                                />
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {renderAddButton("volunteering", "Add Another Volunteer Experience")}
                  </div>
                </TabsContent>

                {/* References Tab */}
                <TabsContent value="references" className="space-y-6">
                  {renderSectionHeader(
                    "Professional References",
                    "Add references who can vouch for your work"
                  )}
                  <div className="space-y-6">
                    <AnimatePresence>
                      {references.map((ref, index) => (
                        <motion.div
                          key={ref.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Card className="p-4 group hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-muted-foreground" />
                                <span className="font-medium">Reference {index + 1}</span>
                              </div>
                              {references.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => removeItem("references", ref.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              )}
                            </div>
                            <div className="grid gap-6 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label>Full Name</Label>
                                <Input placeholder="Reference's name" />
                              </div>
                              <div className="space-y-2">
                                <Label>Position</Label>
                                <Input placeholder="Current position" />
                              </div>
                              <div className="space-y-2">
                                <Label>Company</Label>
                                <Input placeholder="Company name" />
                              </div>
                              <div className="space-y-2">
                                <Label>Relationship</Label>
                                <Input placeholder="e.g., Former Manager" />
                              </div>
                              <div className="space-y-2">
                                <Label>Email</Label>
                                <Input type="email" placeholder="reference@company.com" />
                              </div>
                              <div className="space-y-2">
                                <Label>Phone</Label>
                                <Input placeholder="+1 234 567 8900" />
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {renderAddButton("references", "Add Another Reference")}
                  </div>
                </TabsContent>

                {/* Finish Tab */}
                <TabsContent value="finish" className="space-y-6">
                  {renderSectionHeader(
                    "Finish Up",
                    "Review and generate your resume"
                  )}
                  <Card className="p-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Resume Title</Label>
                        <Input placeholder="My Professional Resume" />
                      </div>
                      <div className="space-y-2">
                        <Label>Template Style</Label>
                        <div className="grid grid-cols-3 gap-4">
                          {["Modern", "Classic", "Creative"].map((style) => (
                            <Card
                              key={style}
                              className="p-4 cursor-pointer hover:border-primary transition-colors group"
                            >
                              <div className="text-center space-y-2">
                                <div className="w-full aspect-[3/4] bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                  <FileText className="h-8 w-8 text-primary" />
                                </div>
                                <span className="text-sm font-medium">{style}</span>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Sparkles className="h-4 w-4 mr-2 text-yellow-500" />
                      This will use 50 credits
                    </div>
                    <div className="flex gap-4">
                      <Button variant="outline">
                        Preview
                      </Button>
                      <Button>
                        Generate Resume
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>

              </motion.div>
            </AnimatePresence>
          </div>
        </Tabs>
      </Card>
    </div>
  );
} 