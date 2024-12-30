"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface ProfileCompletion {
  isProfileComplete: boolean;
  profileProgress: number;
}

export function useProfileCompletion() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<ProfileCompletion>({
    queryKey: ["profileCompletion", session?.user?.id],
    queryFn: async (): Promise<ProfileCompletion> => {
      if (!session?.user?.id) {
        return { isProfileComplete: false, profileProgress: 0 };
      }
      
      const response = await fetch("/api/profile/completion");
      if (!response.ok) {
        throw new Error("Failed to fetch profile completion status");
      }
      const data = await response.json();
      return data as ProfileCompletion;
    },
    enabled: !!session?.user?.id,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
  });

  const { mutate: updateProfileCompletion } = useMutation({
    mutationFn: async (data: Partial<ProfileCompletion>) => {
      const response = await fetch("/api/profile/completion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update profile completion status");
      }
      const responseData = await response.json();
      return responseData as ProfileCompletion;
    },
    onSuccess: (newData) => {
      queryClient.setQueryData(["profileCompletion", session?.user?.id], newData);
      if (newData.isProfileComplete) {
        toast.success("Profile completed!", {
          description: "You can now access all features",
        });
      }
    },
    onError: () => {
      toast.error("Failed to update profile status");
    },
  });

  return {
    isProfileComplete: data?.isProfileComplete ?? false,
    profileProgress: data?.profileProgress ?? 0,
    isLoading,
    updateProfileCompletion,
  };
} 