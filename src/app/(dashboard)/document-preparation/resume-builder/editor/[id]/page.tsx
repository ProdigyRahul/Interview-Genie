"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { generateResumeContent } from "@/lib/gemini";
import { toast } from "sonner";
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
import { SkillsInput } from "@/components/ui/skills-input";

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

interface ExperienceData {
  companyName: string;
  jobTitle: string;
  startDate: string;
  endDate: string;
  description: string;
  technologies: string[];
}

interface ProjectData {
  name: string;
  url: string;
  startDate: string;
  endDate: string;
  description: string;
  technologies: string[];
}

interface EducationData {
  school: string;
  degree: string;
  fieldOfStudy: string;
  gpa: string;
  startDate: string;
  endDate: string;
  achievements: string;
}

interface CertificationData {
  name: string;
  issuingOrg: string;
  issueDate: string;
  expiryDate: string;
  credentialId: string;
  credentialUrl: string;
}

interface AchievementData {
  title: string;
  date: string;
  description: string;
}

interface VolunteerData {
  organization: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface FormState {
  name: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedIn: string;
  portfolio: string;
  summary: string;
  skills: {
    technical: string[];
    soft: string[];
    tools: string[];
  };
  experiences: Record<number, Partial<ExperienceData>>;
  projects: Record<number, Partial<ProjectData>>;
  education: Record<number, Partial<EducationData>>;
  certifications: Record<number, Partial<CertificationData>>;
  achievements: Record<number, Partial<AchievementData>>;
  volunteering: Record<number, Partial<VolunteerData>>;
}

export default function ResumeEditorPage() {
  const params = useParams();
  const resumeId = params.id as string;
  const [activeTab, setActiveTab] = useState("personal");
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({});
  const [experiences, setExperiences] = useState([{ id: 1 }]);
  const [projects, setProjects] = useState([{ id: 1 }]);
  const [education, setEducation] = useState([{ id: 1 }]);
  const [certifications, setCertifications] = useState([{ id: 1 }]);
  const [achievements, setAchievements] = useState([{ id: 1 }]);
  const [volunteering, setVolunteering] = useState([{ id: 1 }]);
  const [references, setReferences] = useState([{ id: 1 }]);
  const [loading, setLoading] = useState(true);

  // Add form data state for each section
  const [formData, setFormData] = useState<FormState>({
    name: '',
    jobTitle: '',
    email: '',
    phone: '',
    location: '',
    linkedIn: '',
    portfolio: '',
    summary: '',
    experiences: {},
    projects: {},
    education: {},
    certifications: {},
    achievements: {},
    volunteering: {},
    skills: {
      technical: [],
      soft: [],
      tools: []
    }
  });

  const [completedSections, setCompletedSections] = useState<Record<string, boolean>>({
    personal: false,
    experience: false,
    projects: false,
    education: false,
    certifications: false,
    achievements: false,
    skills: false,
    summary: false
  });

  useEffect(() => {
    const fetchResumeData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/resumes/${resumeId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch resume data');
        }
        const data = await response.json();
        
        // Update form data with fetched resume data
        setFormData(prevState => ({
          ...prevState,
          name: data.personalInfo?.fullName || '',
          jobTitle: data.personalInfo?.jobTitle || '',
          email: data.personalInfo?.email || '',
          phone: data.personalInfo?.phoneNumber || '',
          location: data.personalInfo?.location || '',
          linkedIn: data.personalInfo?.linkedIn || '',
          portfolio: data.personalInfo?.portfolio || '',
          summary: data.summary?.content || '',
          experiences: data.experiences?.reduce((acc: any, exp: any) => {
            acc[exp.id] = {
              companyName: exp.companyName,
              jobTitle: exp.jobTitle,
              startDate: exp.startDate,
              endDate: exp.endDate,
              description: exp.description,
              technologies: Array.isArray(exp.technologies) ? exp.technologies : 
                (typeof exp.technologies === 'string' ? exp.technologies.split(',').map((t: string) => t.trim()).filter(Boolean) : [])
            };
            return acc;
          }, {}) || {},
          projects: data.projects?.reduce((acc: any, proj: any) => {
            acc[proj.id] = {
              name: proj.name,
              url: proj.url,
              startDate: proj.startDate,
              endDate: proj.endDate,
              description: proj.description,
              technologies: Array.isArray(proj.technologies) ? proj.technologies : 
                (typeof proj.technologies === 'string' ? proj.technologies.split(',').map((t: string) => t.trim()).filter(Boolean) : [])
            };
            return acc;
          }, {}) || {},
          education: data.education?.reduce((acc: any, edu: any) => {
            acc[edu.id] = {
              school: edu.school,
              degree: edu.degree,
              fieldOfStudy: edu.fieldOfStudy,
              gpa: edu.gpa,
              startDate: edu.startDate,
              endDate: edu.endDate,
              achievements: edu.achievements
            };
            return acc;
          }, {}) || {},
          certifications: data.certifications?.reduce((acc: any, cert: any) => {
            acc[cert.id] = {
              name: cert.name,
              issuingOrg: cert.issuingOrg,
              issueDate: cert.issueDate,
              expiryDate: cert.expiryDate,
              credentialId: cert.credentialId,
              credentialUrl: cert.credentialUrl
            };
            return acc;
          }, {}) || {},
          achievements: data.achievements?.reduce((acc: any, ach: any) => {
            acc[ach.id] = {
              title: ach.title,
              date: ach.date,
              description: ach.description
            };
            return acc;
          }, {}) || {},
          volunteering: data.volunteering?.reduce((acc: any, vol: any) => {
            acc[vol.id] = {
              organization: vol.organization,
              role: vol.role,
              startDate: vol.startDate,
              endDate: vol.endDate,
              description: vol.description
            };
            return acc;
          }, {}) || {},
          skills: {
            technical: data.skills?.technical?.split(',').map((s: string) => s.trim()) || [],
            soft: data.skills?.soft?.split(',').map((s: string) => s.trim()) || [],
            tools: data.skills?.tools?.split(',').map((s: string) => s.trim()) || []
          }
        }));

        // Update section items with the correct IDs
        if (data.experiences?.length) setExperiences(data.experiences.map((exp: any) => ({ id: exp.id })));
        if (data.projects?.length) setProjects(data.projects.map((proj: any) => ({ id: proj.id })));
        if (data.education?.length) setEducation(data.education.map((edu: any) => ({ id: edu.id })));
        if (data.certifications?.length) setCertifications(data.certifications.map((cert: any) => ({ id: cert.id })));
        if (data.achievements?.length) setAchievements(data.achievements.map((ach: any) => ({ id: ach.id })));
        if (data.volunteering?.length) setVolunteering(data.volunteering.map((vol: any) => ({ id: vol.id })));
        if (data.references?.length) setReferences(data.references.map((ref: any) => ({ id: ref.id })));

        // Update completion status
        const newCompletedSections = { ...completedSections };
        if (data.personalInfo?.fullName) newCompletedSections.personal = true;
        if (data.experiences?.length) newCompletedSections.experience = true;
        if (data.education?.length) newCompletedSections.education = true;
        if (data.skills) newCompletedSections.skills = true;
        if (data.summary?.content) newCompletedSections.summary = true;
        setCompletedSections(newCompletedSections);

      } catch (error) {
        console.error('Error fetching resume data:', error);
        toast.error('Failed to load resume data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (resumeId) {
      fetchResumeData();
    }
  }, [resumeId]);

  const handleGenerateAI = async (section: string, id: number, field: string) => {
    setIsGenerating({ ...isGenerating, [`${section}-${id}-${field}`]: true });
    try {
      let context = {};
      
      // Build context based on section
      switch (section) {
        case 'summary':
          context = {
            jobTitle: formData.jobTitle,
            experience: formData.experiences ? Object.keys(formData.experiences).length : 0,
            skills: formData.skills,
            existingContent: formData.summary || ''
          };
          break;
        case 'experience_description':
          context = {
            title: formData.experiences[id]?.jobTitle,
            company: formData.experiences[id]?.companyName,
            technologies: formData.experiences[id]?.technologies?.join(', ') || '',
            description: formData.experiences[id]?.description || ''
          };
          break;
        case 'project_description':
          context = {
            title: formData.projects[id]?.name,
            technologies: formData.projects[id]?.technologies?.join(', ') || '',
            description: formData.projects[id]?.description || ''
          };
          break;
        case 'achievement_description':
          context = {
            title: formData.achievements[id]?.title,
            company: formData.experiences ? Object.values(formData.experiences)[0]?.companyName : undefined,
            description: formData.achievements[id]?.description || ''
          };
          break;
        case 'volunteer_description':
          context = {
            role: formData.volunteering[id]?.role,
            organization: formData.volunteering[id]?.organization,
            description: formData.volunteering[id]?.description || ''
          };
          break;
      }

      const response = await generateResumeContent(section, context);
      
      if (response.content) {
        setFormData((prev: FormState) => {
          switch (section) {
            case 'summary':
              return {
                ...prev,
                summary: response.content
              };
            case 'experience_description':
              return {
                ...prev,
                experiences: {
                  ...prev.experiences,
                  [id]: {
                    ...prev.experiences[id],
                    description: response.content
                  }
                }
              };
            case 'project_description':
              return {
                ...prev,
                projects: {
                  ...prev.projects,
                  [id]: {
                    ...prev.projects[id],
                    description: response.content
                  }
                }
              };
            case 'achievement_description':
              return {
                ...prev,
                achievements: {
                  ...prev.achievements,
                  [id]: {
                    ...prev.achievements[id],
                    description: response.content
                  }
                }
              };
            case 'volunteer_description':
              return {
                ...prev,
                volunteering: {
                  ...prev.volunteering,
                  [id]: {
                    ...prev.volunteering[id],
                    description: response.content
                  }
                }
              };
            default:
              return prev;
          }
        });
        toast.success('Content generated successfully!');
      } else {
        toast.error('Failed to generate content. Please try again.');
      }
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating({ ...isGenerating, [`${section}-${id}-${field}`]: false });
    }
  };

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

  const handleInputChange = (section: keyof FormState, id: number, field: string, value: string | string[]) => {
    setFormData((prev: FormState) => {
      if (section === 'skills') {
        const newState: FormState = Object.assign({}, prev, {
          skills: Object.assign({}, prev.skills, { [field]: value })
        });
        return newState;
      }

      const updatedSection = Object.assign({}, prev[section] as Record<number, Record<string, any>>);
      if (!updatedSection[id]) {
        updatedSection[id] = {};
      }
      updatedSection[id] = Object.assign({}, updatedSection[id], { [field]: value });

      // Check if section is complete
      const sectionData = updatedSection[id];
      const isComplete = Object.values(sectionData).every(val => 
        (Array.isArray(val) ? val.length > 0 : typeof val === 'string' && val.trim() !== '')
      );
      
      // Update completion status
      const completionUpdate = { [section]: isComplete };
      setCompletedSections(prevState => Object.assign({}, prevState, completionUpdate));

      // Update form data
      const formUpdate = { [section]: updatedSection };
      return Object.assign({}, prev, formUpdate) as FormState;
    });
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

  const renderTabTrigger = (tab: typeof tabs[0]) => (
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
      {completedSections[tab.id] && (
        <CheckCircle className="h-3 w-3 text-green-500" />
      )}
    </TabsTrigger>
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
              {tabs.map(renderTabTrigger)}
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
                        <div className="flex gap-2">
                          <Input
                            id="name"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Professional Title</Label>
                        <Input 
                          placeholder="Senior Software Engineer"
                          value={formData.jobTitle}
                          onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input 
                          type="email" 
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input 
                          placeholder="+1 234 567 8900"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Location</Label>
                        <Input 
                          placeholder="City, Country"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>LinkedIn</Label>
                        <div className="flex gap-2">
                          <Input 
                            placeholder="linkedin.com/in/johndoe"
                            value={formData.linkedIn}
                            onChange={(e) => setFormData({ ...formData, linkedIn: e.target.value })}
                          />
                          <Button variant="outline" size="icon">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Portfolio Website</Label>
                        <div className="flex gap-2">
                          <Input 
                            placeholder="johndoe.com"
                            value={formData.portfolio}
                            onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                          />
                          <Button variant="outline" size="icon">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </TabsContent>

                {/* Experience Tab */}
                <TabsContent value="experience" className="space-y-6">
                  {renderSectionHeader(
                    "Work Experience",
                    "Add your professional work experience"
                  )}
                  {experiences.map((exp) => (
                    <Card key={exp.id} className="p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="grid gap-6 md:grid-cols-2 w-full">
                          <div className="space-y-2">
                            <Label>Company Name</Label>
                            <Input 
                              placeholder="Company Name"
                              value={formData.experiences[exp.id]?.companyName || ''}
                              onChange={(e) => handleInputChange('experiences', exp.id, 'companyName', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Job Title</Label>
                            <Input 
                              placeholder="Senior Software Engineer"
                              value={formData.experiences[exp.id]?.jobTitle || ''}
                              onChange={(e) => handleInputChange('experiences', exp.id, 'jobTitle', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Start Date</Label>
                            <Input 
                              type="date"
                              value={formData.experiences[exp.id]?.startDate || ''}
                              onChange={(e) => handleInputChange('experiences', exp.id, 'startDate', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>End Date</Label>
                            <Input 
                              type="date"
                              value={formData.experiences[exp.id]?.endDate || ''}
                              onChange={(e) => handleInputChange('experiences', exp.id, 'endDate', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label>Description</Label>
                            <div className="flex flex-col gap-2">
                              <Textarea 
                                placeholder="Describe your role and achievements..."
                                value={formData.experiences[exp.id]?.description || ''}
                                onChange={(e) => handleInputChange('experiences', exp.id, 'description', e.target.value)}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => handleGenerateAI('experience_description', exp.id, 'description')}
                                disabled={isGenerating[`experience_description-${exp.id}-description`]}
                              >
                                {isGenerating[`experience_description-${exp.id}-description`] ? (
                                  <div className="animate-spin">⌛</div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4" />
                                    Generate Description
                                  </div>
                                )}
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label>Technologies Used</Label>
                            <SkillsInput 
                              value={formData.experiences[exp.id]?.technologies || []}
                              onChange={(techs) => handleInputChange('experiences', exp.id, 'technologies', techs)}
                              placeholder="Add technologies used in this role"
                            />
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeItem('experience', exp.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                  {renderAddButton('experience', 'Add Experience')}
                </TabsContent>

                {/* Projects Tab */}
                <TabsContent value="projects" className="space-y-6">
                  {renderSectionHeader(
                    "Projects",
                    "Add your notable projects and achievements"
                  )}
                  {projects.map((project) => (
                    <Card key={project.id} className="p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="grid gap-6 md:grid-cols-2 w-full">
                          <div className="space-y-2">
                            <Label>Project Name</Label>
                            <Input 
                              placeholder="Project Name"
                              value={formData.projects[project.id]?.name || ''}
                              onChange={(e) => handleInputChange('projects', project.id, 'name', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Project URL</Label>
                            <Input type="url" placeholder="https://..." />
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
                            <div className="flex flex-col gap-2">
                              <Textarea 
                                placeholder="Describe the project and your role..."
                                value={formData.projects[project.id]?.description || ''}
                                onChange={(e) => handleInputChange('projects', project.id, 'description', e.target.value)}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => handleGenerateAI('project_description', project.id, 'description')}
                                disabled={isGenerating[`project_description-${project.id}-description`]}
                              >
                                {isGenerating[`project_description-${project.id}-description`] ? (
                                  <div className="animate-spin">⌛</div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4" />
                                    Generate Description
                                  </div>
                                )}
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label>Technologies Used</Label>
                            <SkillsInput 
                              value={formData.projects[project.id]?.technologies || []}
                              onChange={(techs) => handleInputChange('projects', project.id, 'technologies', techs)}
                              placeholder="Add technologies used in this project"
                            />
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeItem('projects', project.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                  {renderAddButton('projects', 'Add Project')}
                </TabsContent>

                {/* Education Tab */}
                <TabsContent value="education" className="space-y-6">
                  {renderSectionHeader(
                    "Education",
                    "Add your educational background"
                  )}
                  {education.map((edu) => (
                    <Card key={edu.id} className="p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="grid gap-6 md:grid-cols-2 w-full">
                          <div className="space-y-2">
                            <Label>School/University</Label>
                            <div className="flex gap-2">
                              <Input placeholder="Institution Name" />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => handleGenerateAI('education', edu.id, 'school')}
                                disabled={isGenerating[`education-${edu.id}-school`]}
                              >
                                {isGenerating[`education-${edu.id}-school`] ? (
                                  <div className="animate-spin">⌛</div>
                                ) : (
                                  <Sparkles className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Degree</Label>
                            <Input placeholder="Bachelor of Science" />
                          </div>
                          <div className="space-y-2">
                            <Label>Field of Study</Label>
                            <Input placeholder="Computer Science" />
                          </div>
                          <div className="space-y-2">
                            <Label>GPA</Label>
                            <Input type="number" step="0.01" placeholder="3.8" />
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
                            <Label>Achievements</Label>
                            <Textarea placeholder="List your academic achievements..." />
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeItem('education', edu.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                  {renderAddButton('education', 'Add Education')}
                </TabsContent>

                {/* Certifications Tab */}
                <TabsContent value="certifications" className="space-y-6">
                  {renderSectionHeader(
                    "Certifications",
                    "Add your professional certifications"
                  )}
                  {certifications.map((cert) => (
                    <Card key={cert.id} className="p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="grid gap-6 md:grid-cols-2 w-full">
                          <div className="space-y-2">
                            <Label>Certification Name</Label>
                            <div className="flex gap-2">
                              <Input placeholder="Certification Name" />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => handleGenerateAI('certifications', cert.id, 'name')}
                                disabled={isGenerating[`certifications-${cert.id}-name`]}
                              >
                                {isGenerating[`certifications-${cert.id}-name`] ? (
                                  <div className="animate-spin">⌛</div>
                                ) : (
                                  <Sparkles className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Issuing Organization</Label>
                            <Input placeholder="Organization Name" />
                          </div>
                          <div className="space-y-2">
                            <Label>Issue Date</Label>
                            <Input type="date" />
                          </div>
                          <div className="space-y-2">
                            <Label>Expiry Date</Label>
                            <Input type="date" />
                          </div>
                          <div className="space-y-2">
                            <Label>Credential ID</Label>
                            <Input placeholder="ABC123" />
                          </div>
                          <div className="space-y-2">
                            <Label>Credential URL</Label>
                            <Input type="url" placeholder="https://..." />
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeItem('certifications', cert.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                  {renderAddButton('certifications', 'Add Certification')}
                </TabsContent>

                {/* Achievements Tab */}
                <TabsContent value="achievements" className="space-y-6">
                  {renderSectionHeader(
                    "Achievements",
                    "Add your notable achievements and awards"
                  )}
                  {achievements.map((achievement) => (
                    <Card key={achievement.id} className="p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="grid gap-6 md:grid-cols-2 w-full">
                          <div className="space-y-2">
                            <Label>Achievement Title</Label>
                            <Input 
                              placeholder="Achievement Title"
                              value={formData.achievements[achievement.id]?.title || ''}
                              onChange={(e) => handleInputChange('achievements', achievement.id, 'title', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Date</Label>
                            <Input type="date" />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label>Description</Label>
                            <div className="flex flex-col gap-2">
                              <Textarea 
                                placeholder="Describe your achievement..."
                                value={formData.achievements[achievement.id]?.description || ''}
                                onChange={(e) => handleInputChange('achievements', achievement.id, 'description', e.target.value)}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => handleGenerateAI('achievement_description', achievement.id, 'description')}
                                disabled={isGenerating[`achievement_description-${achievement.id}-description`]}
                              >
                                {isGenerating[`achievement_description-${achievement.id}-description`] ? (
                                  <div className="animate-spin">⌛</div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4" />
                                    Generate Description
                                  </div>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeItem('achievements', achievement.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                  {renderAddButton('achievements', 'Add Achievement')}
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
                        placeholder="Write a professional summary..."
                        value={formData.summary || ''}
                        onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => handleGenerateAI('summary', 0, 'content')}
                        disabled={isGenerating[`summary-0-content`]}
                      >
                        {isGenerating[`summary-0-content`] ? (
                          <div className="animate-spin">⌛</div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            Generate Professional Summary
                          </div>
                        )}
                      </Button>
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
                                <Input 
                                  placeholder="Organization Name"
                                  value={formData.volunteering[vol.id]?.organization || ''}
                                  onChange={(e) => handleInputChange('volunteering', vol.id, 'organization', e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Role</Label>
                                <Input 
                                  placeholder="Volunteer Role"
                                  value={formData.volunteering[vol.id]?.role || ''}
                                  onChange={(e) => handleInputChange('volunteering', vol.id, 'role', e.target.value)}
                                />
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
                                <div className="flex flex-col gap-2">
                                  <Textarea 
                                    placeholder="Describe your volunteer work..."
                                    value={formData.volunteering[vol.id]?.description || ''}
                                    onChange={(e) => handleInputChange('volunteering', vol.id, 'description', e.target.value)}
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => handleGenerateAI('volunteer_description', vol.id, 'description')}
                                    disabled={isGenerating[`volunteer_description-${vol.id}-description`]}
                                  >
                                    {isGenerating[`volunteer_description-${vol.id}-description`] ? (
                                      <div className="animate-spin">⌛</div>
                                    ) : (
                                      <div className="flex items-center gap-2">
                                        <Sparkles className="h-4 w-4" />
                                        Generate Description
                                      </div>
                                    )}
                                  </Button>
                                </div>
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

                {/* Skills Tab */}
                <TabsContent value="skills" className="space-y-6">
                  {renderSectionHeader(
                    "Skills",
                    "Add your technical and professional skills"
                  )}
                  <Card className="p-4">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label>Technical Skills</Label>
                        <div className="flex gap-2">
                          <SkillsInput
                            value={formData.skills.technical}
                            onChange={(skills) => setFormData({
                              ...formData,
                              skills: { ...formData.skills, technical: skills }
                            })}
                            placeholder="Type technical skills and press Enter or comma"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleGenerateAI('skills', 1, 'technical')}
                            disabled={isGenerating['skills-1-technical']}
                          >
                            {isGenerating['skills-1-technical'] ? (
                              <div className="animate-spin">⌛</div>
                            ) : (
                              <Sparkles className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Soft Skills</Label>
                        <div className="flex gap-2">
                          <SkillsInput
                            value={formData.skills.soft}
                            onChange={(skills) => setFormData({
                              ...formData,
                              skills: { ...formData.skills, soft: skills }
                            })}
                            placeholder="Type soft skills and press Enter or comma"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleGenerateAI('skills', 1, 'soft')}
                            disabled={isGenerating['skills-1-soft']}
                          >
                            {isGenerating['skills-1-soft'] ? (
                              <div className="animate-spin">⌛</div>
                            ) : (
                              <Sparkles className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Tools & Technologies</Label>
                        <div className="flex gap-2">
                          <SkillsInput
                            value={formData.skills.tools}
                            onChange={(skills) => setFormData({
                              ...formData,
                              skills: { ...formData.skills, tools: skills }
                            })}
                            placeholder="Type tools/technologies and press Enter or comma"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleGenerateAI('skills', 1, 'tools')}
                            disabled={isGenerating['skills-1-tools']}
                          >
                            {isGenerating['skills-1-tools'] ? (
                              <div className="animate-spin">⌛</div>
                            ) : (
                              <Sparkles className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
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