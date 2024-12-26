"use client";

import * as React from "react";
import { Upload, X, Star, Trophy, Sparkles, Check } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock data - replace with real data from API
const industries = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Others",
];

const workStatuses = [
  "Employed",
  "Unemployed",
  "Student",
  "Freelancer",
];

const experiences = [
  "Fresher",
  "1-3 years",
  "3-5 years",
  "5-10 years",
  "10+ years",
];

const qualifications = [
  "High School",
  "Under Graduate",
  "Post Graduate",
  "Doctorate",
];

// Define the type for hard skills
type Skill = (typeof hardSkills)[number];

const hardSkills = [
  "Software Engineering",
  "Project Management",
  "Data Analysis",
  "UI/UX Design",
  "Digital Marketing",
  "Content Writing",
  "Graphic Design",
  "Sales",
  "Customer Service",
  "Leadership",
] as const;

interface ProfileCompletionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any; // Replace with proper user type
}

export function ProfileCompletionModal({
  open,
  onOpenChange,
  user,
}: ProfileCompletionModalProps) {
  const [selectedSkills, setSelectedSkills] = React.useState<Skill[]>([]);
  const [progress] = React.useState(30);
  const [rewards] = React.useState({
    xpGain: 100,
    credits: 50,
    achievements: ["Profile Pioneer"],
  });
  const [skillsOpen, setSkillsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredSkills = React.useMemo(() => {
    if (!searchQuery) return hardSkills;
    return hardSkills.filter((skill) =>
      skill.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleSkillSelect = React.useCallback((skill: Skill) => {
    setSelectedSkills((current) => {
      const currentSkills = [...(current || [])];
      const skillIndex = currentSkills.indexOf(skill);

      if (skillIndex > -1) {
        currentSkills.splice(skillIndex, 1);
      } else {
        currentSkills.push(skill);
      }

      return currentSkills;
    });
  }, []);

  const handleSkillRemove = React.useCallback((skillToRemove: Skill) => {
    setSelectedSkills((current) => 
      current.filter((skill) => skill !== skillToRemove)
    );
  }, []);

  // Get user's initials for avatar fallback
  const getInitials = () => {
    if (user.name) {
      return user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
    }
    return user.email?.[0].toUpperCase() || '?';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <div className="p-6 border-b space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">Complete Your Profile</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Complete your profile to get personalized interview preparation
              </p>
            </div>
          </div>

          {/* Gamification Rewards */}
          <div className="flex items-center gap-4 p-4 bg-accent/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="text-sm font-medium">XP Reward</div>
                <div className="text-xs text-muted-foreground">+{rewards.xpGain} XP</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-sm font-medium">Bonus Credits</div>
                <div className="text-xs text-muted-foreground">+{rewards.credits} credits</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-orange-500" />
              <div>
                <div className="text-sm font-medium">Achievement</div>
                <div className="text-xs text-muted-foreground">{rewards.achievements[0]}</div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Profile Completion</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </Progress>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Beginner</span>
              <span>Profile Pro</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-8">
            {/* Profile Image Upload */}
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20">
                {user.image ? (
                  <AvatarImage 
                    src={user.image} 
                    alt={user.name || "Profile picture"}
                    className="object-cover"
                  />
                ) : (
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                    {getInitials()}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="space-y-2">
                <h3 className="font-medium">Profile Picture</h3>
                {user.image ? (
                  <div className="text-sm text-muted-foreground">
                    Using picture from Google account
                  </div>
                ) : (
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Photo
                  </Button>
                )}
              </div>
            </div>

            {/* Resume Upload */}
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Quick Fill from Resume</h3>
                <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                  <Upload className="h-8 w-8" />
                  <span>Upload your resume to auto-fill details</span>
                </Button>
              </div>
            </div>

            {/* Personal Details */}
            <div className="space-y-4">
              <h3 className="font-medium">Personal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="First Name" defaultValue={user.firstName ?? ""} />
                <Input placeholder="Last Name" defaultValue={user.lastName ?? ""} />
                <Input type="date" placeholder="Date of Birth" />
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="Phone Number" defaultValue={user.phoneNumber ?? ""} />
                <Input placeholder="Company Name" />
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry.toLowerCase()}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4">
              <h3 className="font-medium">Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="india">India</SelectItem>
                    {/* Add more countries */}
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="State" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gujarat">Gujarat</SelectItem>
                    {/* Add more states */}
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="City" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ahmedabad">Ahmedabad</SelectItem>
                    {/* Add more cities */}
                  </SelectContent>
                </Select>
                <Input placeholder="PIN Code" />
              </div>
            </div>

            {/* Professional Details */}
            <div className="space-y-4">
              <h3 className="font-medium">Professional Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Work Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {workStatuses.map((status) => (
                      <SelectItem key={status} value={status.toLowerCase()}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Work Experience" />
                  </SelectTrigger>
                  <SelectContent>
                    {experiences.map((exp) => (
                      <SelectItem key={exp} value={exp.toLowerCase()}>
                        {exp}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Qualification" />
                  </SelectTrigger>
                  <SelectContent>
                    {qualifications.map((qual) => (
                      <SelectItem key={qual} value={qual.toLowerCase()}>
                        {qual}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input placeholder="Other Qualifications" />
              </div>
            </div>

            {/* Hard Skills */}
            <div className="space-y-4">
              <h3 className="font-medium">Hard Skills</h3>
              <Popover open={skillsOpen} onOpenChange={setSkillsOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={skillsOpen}
                    className="w-full justify-between"
                  >
                    <span className="truncate">
                      {selectedSkills.length === 0
                        ? "Select skills..."
                        : `${selectedSkills.length} selected`}
                    </span>
                    <span className="ml-2 rounded-full bg-primary/10 px-1.5 py-0.5 text-xs font-medium leading-none text-primary">
                      {selectedSkills.length}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command shouldFilter={false}>
                    <CommandInput 
                      placeholder="Search skills..." 
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                    />
                    {filteredSkills.length === 0 && (
                      <CommandEmpty>No skills found.</CommandEmpty>
                    )}
                    <CommandGroup className="max-h-64 overflow-auto">
                      {filteredSkills.map((skill) => {
                        const isSelected = selectedSkills.includes(skill);
                        return (
                          <CommandItem
                            key={skill}
                            onSelect={() => {
                              handleSkillSelect(skill);
                            }}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center">
                              <div
                                className={cn(
                                  "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                  isSelected
                                    ? "bg-primary text-primary-foreground"
                                    : "opacity-50 [&_svg]:invisible"
                                )}
                              >
                                <Check className={cn("h-4 w-4")} />
                              </div>
                              <span>{skill}</span>
                            </div>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>

              <div className="flex flex-wrap gap-2">
                {selectedSkills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80"
                    onClick={() => handleSkillRemove(skill)}
                  >
                    {skill}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t space-y-4">
          <div className="text-sm text-muted-foreground text-center">
            Complete your profile to unlock rewards and start your journey!
          </div>
          <Button className="w-full" size="lg">
            <Sparkles className="mr-2 h-4 w-4" />
            Complete Profile & Claim Rewards
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 