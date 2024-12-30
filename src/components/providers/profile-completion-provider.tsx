"use client";

import { createContext, useContext, useEffect } from "react";
import { useProfileCompletion } from "@/hooks/use-profile-completion";
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
    updateProfileCompletion,
  } = useProfileCompletion();

  // Check profile completion once per session
  useEffect(() => {
    if (
      session?.user?.id &&
      !isLoading &&
      !isProfileComplete &&
      !pathname.startsWith("/auth") &&
      !pathname.includes("/complete-profile")
    ) {
      // Calculate profile progress based on filled fields
      const calculateProgress = async () => {
        try {
          const response = await fetch("/api/profile");
          const data = await response.json();
          
          if (response.ok) {
            const fields = [
              data.firstName,
              data.lastName,
              data.email,
              data.phoneNumber,
              data.gender,
              data.country,
              data.state,
              data.city,
              data.pinCode,
              data.workStatus,
              data.experience,
              data.education,
              data.industry,
              data.ageGroup,
              data.aspiration,
              data.hardSkills,
            ];

            const filledFields = fields.filter(field => field !== null && field !== undefined).length;
            const progress = Math.round((filledFields / fields.length) * 100);

            if (progress !== profileProgress) {
              updateProfileCompletion({ profileProgress: progress });
            }
          }
        } catch (error) {
          console.error("Error calculating profile progress:", error);
        }
      };

      void calculateProgress();
    }
  }, [session?.user?.id, isLoading, isProfileComplete, pathname, profileProgress, updateProfileCompletion]);

  return (
    <ProfileCompletionContext.Provider
      value={{
        isProfileComplete,
        profileProgress,
        isLoading,
        updateProfileCompletion,
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