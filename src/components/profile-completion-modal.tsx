"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useProfile } from "@/hooks/use-profile";
import { X, Loader2, Upload } from "lucide-react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Constants
const industries = ["Technology", "Healthcare", "Finance", "Education", "Others"];
const workStatuses = ["Employed", "Unemployed", "Student", "Freelancer"];
const experiences = ["Fresher", "1-3 years", "3-5 years", "5-10 years", "10+ years"];
const qualifications = ["High School", "Under Graduate", "Post Graduate", "Doctorate"];

// Form schema
const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 characters"),
  gender: z.string(),
  country: z.string(),
  state: z.string(),
  city: z.string(),
  pinCode: z.string(),
  workStatus: z.string(),
  experience: z.string(),
  education: z.string(),
  industry: z.string(),
  ageGroup: z.string().optional(),
  aspiration: z.string().optional(),
  hardSkills: z.array(z.string()),
});

type FormData = z.infer<typeof formSchema>;

interface ProfileCompletionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
}

// Define section weights for better organization
const SECTION_WEIGHTS = {
  personalDetails: 0.25, // 25%
  locationDetails: 0.25, // 25%
  professionalDetails: 0.35, // 35%
  hardSkills: 0.15, // 15%
} as const;

export function ProfileCompletionModal({
  open,
  onOpenChange,
  user,
}: ProfileCompletionModalProps) {
  // State management
  const [currentSkill, setCurrentSkill] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initializedRef = useRef(false);
  
  // Form initialization
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phoneNumber: "",
      gender: "",
      country: "",
      state: "",
      city: "",
      pinCode: "",
      workStatus: "",
      experience: "",
      education: "",
      industry: "",
      ageGroup: "",
      aspiration: "",
      hardSkills: [],
    },
  });
  
  // Use optimized profile hook
  const { 
    profile,
    isLoading: isProfileLoading,
    updateProfile,
    isUpdating,
    profileProgress: currentProgress,
    isProfileComplete
  } = useProfile();

  // If profile is complete or progress >= 80%, close the modal
  useEffect(() => {
    if (open && (isProfileComplete || (currentProgress >= 80))) {
      onOpenChange(false);
    }
  }, [open, isProfileComplete, currentProgress, onOpenChange]);

  // Initialize form
  useEffect(() => {
    if (!profile || initializedRef.current) return;

    // Initialize form with existing data
    const initialValues = {
      firstName: profile.firstName ?? user.name?.split(" ")[0] ?? "",
      lastName: profile.lastName ?? user.name?.split(" ")[1] ?? "",
      phoneNumber: profile.phoneNumber ?? "",
      gender: profile.gender ?? "",
      country: profile.country ?? "",
      state: profile.state ?? "",
      city: profile.city ?? "",
      pinCode: profile.pinCode ?? "",
      workStatus: profile.workStatus ?? "",
      experience: profile.experience ?? "",
      education: profile.education ?? "",
      industry: profile.industry ?? "",
      ageGroup: profile.ageGroup ?? "",
      aspiration: profile.aspiration ?? "",
      hardSkills: profile.hardSkills ?? [],
    };

    form.reset(initialValues);
    setSkills(profile.hardSkills ?? []); 
    setImageUrl(profile.image ?? null);
    setLocalProgress(calculateProgress(initialValues));
    initializedRef.current = true;
  }, [profile, user, form]);

  // Local state for progress tracking
  const [localProgress, setLocalProgress] = useState(profile?.profileProgress ?? 0);

  // Calculate progress with proper type safety
  const calculateProgress = (formData: Partial<FormData>) => {
    // Personal Details Section (25%)
    const personalFields = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phoneNumber: formData.phoneNumber,
      gender: formData.gender,
    };
    const personalComplete = Object.values(personalFields).filter(
      value => typeof value === 'string' && value.trim().length > 0
    ).length;
    const personalProgress = (personalComplete / Object.keys(personalFields).length) * SECTION_WEIGHTS.personalDetails * 100;

    // Location Details Section (25%)
    const locationFields = {
      country: formData.country,
      state: formData.state,
      city: formData.city,
      pinCode: formData.pinCode,
    };
    const locationComplete = Object.values(locationFields).filter(
      value => typeof value === 'string' && value.trim().length > 0
    ).length;
    const locationProgress = (locationComplete / Object.keys(locationFields).length) * SECTION_WEIGHTS.locationDetails * 100;

    // Professional Details Section (35%)
    const professionalFields = {
      workStatus: formData.workStatus,
      experience: formData.experience,
      education: formData.education,
      industry: formData.industry,
    };
    const professionalComplete = Object.values(professionalFields).filter(
      value => typeof value === 'string' && value.trim().length > 0
    ).length;
    const professionalProgress = (professionalComplete / Object.keys(professionalFields).length) * SECTION_WEIGHTS.professionalDetails * 100;

    // Hard Skills Section (15%)
    const hasSkills = Array.isArray(formData.hardSkills) && formData.hardSkills.length > 0;
    const skillsProgress = hasSkills ? SECTION_WEIGHTS.hardSkills * 100 : 0;

    // Calculate total progress
    const totalProgress = Math.round(
      personalProgress + locationProgress + professionalProgress + skillsProgress
    );

    return totalProgress;
  };

  // Form submission
  const onSubmit = async (data: FormData) => {
    try {
      const sanitizedSkills = skills.filter((skill): skill is string => 
        typeof skill === 'string' && skill.length > 0
      );

      const finalProgress = calculateProgress({
        ...data,
        hardSkills: sanitizedSkills
      });

      // Update profile
      await updateProfile({
        ...data,
        hardSkills: sanitizedSkills,
        image: imageUrl,
        profileProgress: finalProgress,
        isProfileComplete: finalProgress >= 80
      });

      toast.success('Profile updated successfully');
      onOpenChange(false);
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
    }
  };

  // Watch for profile completion
  useEffect(() => {
    if (!open) return;
    
    if (isProfileComplete) {
      onOpenChange(false);
    }
  }, [open, isProfileComplete, onOpenChange]);

  // Handle modal close attempt
  const handleCloseAttempt = () => {
    onOpenChange(false);
  };

  // Progress display
  const displayProgress = localProgress;

  // Get user's initials for avatar fallback
  const getInitials = () => {
    if (user?.name) {
      return user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase();
    }
    return user?.email?.[0].toUpperCase() || '?';
  };

  // Handle skill input
  const handleSkillInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (currentSkill.trim()) {
        const newSkills = [...skills, currentSkill.trim()];
        setSkills(newSkills);
        form.setValue('hardSkills', newSkills);
        setCurrentSkill("");
      }
    }
  };

  // Remove skill
  const removeSkill = (skillToRemove: string) => {
    const newSkills = skills.filter(skill => skill !== skillToRemove);
    setSkills(newSkills);
    form.setValue('hardSkills', newSkills);
  };

  // Handle image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/profile/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      setImageUrl(data.imageUrl);
      toast.success('Profile image updated');
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleCloseAttempt}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <div className="p-6 border-b space-y-4">
          <DialogTitle className="text-2xl font-bold">Complete Your Profile</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Complete your profile to get personalized interview preparation
          </p>

          {/* Progress bar with real-time updates */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Profile Completion</span>
              <span>{displayProgress}%</span>
            </div>
            <Progress value={displayProgress} className="h-2">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                style={{ width: `${displayProgress}%` }}
              />
            </Progress>
          </div>
        </div>

        {isProfileLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Profile Image Section */}
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20">
                    {imageUrl ? (
                      <AvatarImage 
                        src={imageUrl} 
                        alt={user?.name || "Profile picture"}
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
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Photo
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Personal Details Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Personal Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter your first name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter your last name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter your phone number" type="tel" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Location Details Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Location Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your country" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="india">India</SelectItem>
                              <SelectItem value="usa">United States</SelectItem>
                              <SelectItem value="uk">United Kingdom</SelectItem>
                              {/* Add more countries as needed */}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter your state" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter your city" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pinCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PIN Code</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter your PIN code" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Professional Details Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Professional Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="workStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Work Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your work status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {workStatuses.map((status) => (
                                <SelectItem key={status} value={status.toLowerCase()}>
                                  {status}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Experience</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your experience" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {experiences.map((exp) => (
                                <SelectItem key={exp} value={exp.toLowerCase()}>
                                  {exp}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="education"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Education</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your education" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {qualifications.map((qual) => (
                                <SelectItem key={qual} value={qual.toLowerCase()}>
                                  {qual}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="industry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Industry</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your industry" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {industries.map((industry) => (
                                <SelectItem key={industry} value={industry.toLowerCase()}>
                                  {industry}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Hard Skills Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Hard Skills</h3>
                  <div className="space-y-2">
                    <Input
                      placeholder="Type a skill and press Enter"
                      value={currentSkill}
                      onChange={(e) => setCurrentSkill(e.target.value)}
                      onKeyDown={handleSkillInputKeyDown}
                    />
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="cursor-pointer hover:bg-destructive/10"
                          onClick={() => removeSkill(skill)}
                        >
                          {skill}
                          <X className="ml-1 h-3 w-3" />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </form>
            </Form>
          </div>
        )}

        <div className="p-6 border-t">
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={handleCloseAttempt}>
              Cancel
            </Button>
            <Button 
              onClick={form.handleSubmit(onSubmit)}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Profile"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 