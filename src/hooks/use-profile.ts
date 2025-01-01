import type { UseQueryOptions, QueryKey } from "@tanstack/react-query";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
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

// Fetch profile data with proper error handling
async function fetchProfile(): Promise<ProfileData> {
  try {
    const response = await fetch('/api/profile', {
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized');
      }
      throw new Error('Failed to fetch profile');
    }
    
    return response.json();
  } catch (error) {
    console.error('Profile fetch error:', error);
    throw error;
  }
}

// Update profile data with proper error handling
async function updateProfile(data: Partial<ProfileData>): Promise<ProfileData> {
  try {
    const response = await fetch('/api/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update profile');
    }

    return response.json();
  } catch (error) {
    console.error('Profile update error:', error);
    throw error;
  }
}

export function useProfile(
  options: Omit<UseQueryOptions<ProfileData, Error, ProfileData, QueryKey>, 'queryKey' | 'queryFn'> = {}
) {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();

  // Query for fetching profile data with optimized caching
  const query = useQuery<ProfileData, Error>({
    queryKey: [...PROFILE_QUERY_KEY, session?.user?.id],
    queryFn: fetchProfile,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: (failureCount, error) => {
      if (error.message === 'Unauthorized') return false;
      return failureCount < 3;
    },
    enabled: status === 'authenticated' && !!session?.user?.id,
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

  const isAuthenticated = status === 'authenticated' && !!session?.user?.id;
  const shouldShowCompletion = isAuthenticated && 
    !wasCompletionShown && 
    query.data && 
    (!query.data.isProfileComplete || (query.data.profileProgress ?? 0) < 80) &&
    !query.isLoading;

  return {
    profile: query.data,
    isLoading: status === 'loading' || query.isLoading,
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