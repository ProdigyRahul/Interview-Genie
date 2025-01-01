"use client";

import { createContext, useContext, useEffect, useRef } from "react";
import { useProfile } from "@/hooks/use-profile";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

interface ProfileCompletionContextType {
  isProfileComplete: boolean;
  profileProgress: number;
  isLoading: boolean;
  updateProfileCompletion: (data: { profileProgress: number }) => void;
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
      !isProfileComplete &&
      !pathname.startsWith("/auth") &&
      !pathname.includes("/complete-profile")
    ) {
      checkedRef.current = true;
    }
  }, [session?.user?.id, isLoading, isProfileComplete, pathname]);

  return (
    <ProfileCompletionContext.Provider
      value={{
        isProfileComplete,
        profileProgress,
        isLoading,
        updateProfileCompletion: updateProfile,
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