"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  phoneNumber: z.string().min(10, "Invalid phone number"),
  countryCode: z.string(),
  gender: z.enum(["male", "female", "other"]),
  ageGroup: z.enum(["under_18", "age_18_24", "age_25_34", "age_35_44", "age_45_plus"]),
  country: z.string().min(2, "Country is required"),
  state: z.string().min(2, "State is required"),
  city: z.string().min(2, "City is required"),
  pincode: z.string().min(5, "Invalid pincode"),
  workStatus: z.enum(["student", "employed", "self_employed", "unemployed"]),
  experience: z.enum(["fresher", "less_than_1", "one_to_2", "two_to_5", "more_than_5"]),
  education: z.enum(["high_school", "bachelors", "masters", "phd", "other"]),
  aspiration: z.enum(["job_search", "skill_development", "higher_learning", "career_switch"]),
  lookingForInternship: z.boolean(),
  industry: z.enum(["technology", "healthcare", "finance", "education", "engineering", "other"]),
  userEducation: z.object({
    course: z.string().min(1, "Course is required"),
    result: z.string().optional(),
    passoutYear: z.string().min(4, "Invalid year"),
    collegeName: z.string().min(2, "College name is required"),
    branchName: z.string().min(2, "Branch name is required"),
    cgpa: z.string().optional(),
  }),
});

export function CompleteProfileForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phoneNumber: "",
      countryCode: "+91",
      gender: undefined,
      ageGroup: undefined,
      country: "",
      state: "",
      city: "",
      pincode: "",
      workStatus: undefined,
      experience: undefined,
      education: undefined,
      aspiration: undefined,
      lookingForInternship: false,
      industry: undefined,
      userEducation: {
        course: "",
        result: "",
        passoutYear: "",
        collegeName: "",
        branchName: "",
        cgpa: "",
      },
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append('data', JSON.stringify(values));
      

      const response = await fetch('/api/profile/complete', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete profile');
      }

      if (data.profileProgress) {
        setProgress(data.profileProgress);
      }

      toast({
        title: "Success",
        description: "Profile completed successfully!",
        variant: "success",
      });

      router.push("/dashboard");
    } catch (error) {
      console.error('Profile completion error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="p-6">
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Profile Completion</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Personal Information */}
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your first name" {...field} />
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
                      <Input placeholder="Doe" {...field} />
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
                          <SelectValue placeholder="Select gender" />
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

              {/* Add other form fields as needed */}
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Completing Profile...
                </>
              ) : (
                "Complete Profile"
              )}
            </Button>
          </div>
        </Card>
      </form>
    </Form>
  );
}