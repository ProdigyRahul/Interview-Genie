import type { UseQueryOptions, QueryKey } from "@tanstack/react-query";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface ProfileData {
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  gender?: string;
  country?: string;
  state?: string;
  city?: string;
  pinCode?: string;
  workStatus?: string;
  experience?: string;
  education?: string;
  industry?: string;
  ageGroup?: string;
  aspiration?: string;
  hardSkills?: string[];
  image?: string | null;
  profileProgress?: number;
  isProfileComplete?: boolean;
}

// Fetch profile data
async function fetchProfile(): Promise<ProfileData> {
  const response = await fetch('/api/profile');
  if (!response.ok) {
    throw new Error('Failed to fetch profile');
  }
  return response.json();
}

// Update profile data
async function updateProfile(data: ProfileData): Promise<ProfileData> {
  const response = await fetch('/api/profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data }),
  });
  if (!response.ok) {
    throw new Error('Failed to update profile');
  }
  return response.json();
}

export function useProfile(
  options: Omit<UseQueryOptions<ProfileData, Error, ProfileData, QueryKey>, 'queryKey' | 'queryFn'> = {}
) {
  const queryClient = useQueryClient();

  // Query for fetching profile data
  const query = useQuery<ProfileData, Error>({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep in garbage collection for 30 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: false, // Don't refetch on reconnect
    ...options,
  });

  // Mutation for updating profile
  const mutation = useMutation<ProfileData, Error, ProfileData>({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      // Update query cache with new data
      queryClient.setQueryData(['profile'], data);
      // Show success toast using Sonner
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      // Show error toast using Sonner
      toast.error(error.message || 'Failed to update profile');
    },
  });

  return {
    profile: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    updateProfile: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    profileProgress: query.data?.profileProgress ?? 0,
    isProfileComplete: query.data?.isProfileComplete ?? false,
  };
} 