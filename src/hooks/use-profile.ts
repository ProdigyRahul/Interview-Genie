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

interface MutationContext {
  previousData: ProfileData | undefined;
}

const PROFILE_QUERY_KEY = ['profile'] as const;
const PROFILE_COMPLETION_SHOWN_KEY = 'profile_completion_shown';

// Fetch profile data
async function fetchProfile(): Promise<ProfileData> {
  const response = await fetch('/api/profile');
  if (!response.ok) {
    throw new Error('Failed to fetch profile');
  }
  return response.json();
}

// Update profile data
async function updateProfile(data: Partial<ProfileData>): Promise<ProfileData> {
  const response = await fetch('/api/profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
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

  // Query for fetching profile data with aggressive caching
  const query = useQuery<ProfileData, Error>({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: fetchProfile,
    staleTime: Infinity, // Keep data fresh indefinitely until explicitly invalidated
    gcTime: 1000 * 60 * 30, // Keep in garbage collection for 30 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: false,
    ...options,
  });

  // Check if profile completion modal was shown in this session
  const wasCompletionShown = typeof window !== 'undefined' && 
    sessionStorage.getItem(PROFILE_COMPLETION_SHOWN_KEY) === 'true';

  // Mutation for updating profile with optimistic updates
  const mutation = useMutation<ProfileData, Error, Partial<ProfileData>, MutationContext>({
    mutationFn: updateProfile,
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: PROFILE_QUERY_KEY });
      const previousData = queryClient.getQueryData<ProfileData>(PROFILE_QUERY_KEY);
      
      if (previousData) {
        queryClient.setQueryData<ProfileData>(PROFILE_QUERY_KEY, {
          ...previousData,
          ...newData,
        });
      }
      
      return { previousData };
    },
    onError: (error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(PROFILE_QUERY_KEY, context.previousData);
      }
      toast.error(error.message || 'Failed to update profile');
    },
    onSuccess: (data) => {
      queryClient.setQueryData(PROFILE_QUERY_KEY, data);
      
      // Only show completion toast if profile was just completed
      const wasIncomplete = query.data?.isProfileComplete === false;
      const isNowComplete = data.isProfileComplete === true;
      
      if (wasIncomplete && isNowComplete) {
        toast.success('Profile completed! You can now access all features');
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(PROFILE_COMPLETION_SHOWN_KEY, 'true');
        }
      }
    },
  });

  const shouldShowCompletion = !wasCompletionShown && 
    query.data && 
    !query.data.isProfileComplete && 
    (query.data.profileProgress ?? 0) < 80;

  return {
    profile: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    updateProfile: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    profileProgress: query.data?.profileProgress ?? 0,
    isProfileComplete: query.data?.isProfileComplete ?? false,
    shouldShowCompletion,
    markCompletionShown: () => {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(PROFILE_COMPLETION_SHOWN_KEY, 'true');
      }
    },
  };
} 