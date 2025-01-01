"use client";

import { createContext, useContext, useEffect, useRef } from "react";
import { useProfile } from "@/hooks/use-profile";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

interface ProfileCompletionContextType {
  isProfileComplete: boolean;
  profileProgress: number;
  isLoading: boolean;
  updateProfileCompletion: (data: { profileProgress: number }) => Promise<void>;
}

const ProfileCompletionContext = createContext<ProfileCompletionContextType | null>(null);

export function ProfileCompletionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const {
    isProfileComplete,
    profileProgress,
    isLoading,
    updateProfile,
  } = useProfile({
    // Prevent unnecessary refetches
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Track if we've already checked profile completion in this session
  const checkedRef = useRef(false);

  // Check profile completion once per session
  useEffect(() => {
    if (
      !checkedRef.current &&
      session?.user?.id &&
      !isLoading &&
      (!isProfileComplete || profileProgress < 80) &&
      !pathname.startsWith("/auth") &&
      !pathname.includes("/complete-profile")
    ) {
      checkedRef.current = true;
    }
  }, [session?.user?.id, isLoading, isProfileComplete, profileProgress, pathname]);

  // Wrap updateProfile to match the expected type
  const handleProfileUpdate = async (data: { profileProgress: number }) => {
    await updateProfile(data);
  };

  return (
    <ProfileCompletionContext.Provider
      value={{
        isProfileComplete: isProfileComplete || profileProgress >= 80,
        profileProgress,
        isLoading,
        updateProfileCompletion: handleProfileUpdate,
      }}
    >
      {children}
    </ProfileCompletionContext.Provider>
  );
}

export function useProfileCompletionContext() {
  const context = useContext(ProfileCompletionContext);
  if (!context) {
    throw new Error(
      "useProfileCompletionContext must be used within a ProfileCompletionProvider"
    );
  }
  return context;
} 