"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useProfile } from "@/hooks/use-profile";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { ProfileCompletionModal } from "@/components/profile-completion-modal";

interface ProfileCompletionContextType {
  isProfileComplete: boolean;
  profileProgress: number;
  isLoading: boolean;
  updateProfileCompletion: (data: { profileProgress: number }) => Promise<void>;
}

const ProfileCompletionContext = createContext<ProfileCompletionContextType | null>(null);

const PROFILE_COMPLETION_SHOWN_KEY = "profile-completion-shown";

export function ProfileCompletionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [showModal, setShowModal] = useState(false);
  const initialCheckDone = useRef(false);

  const {
    profile,
    isProfileComplete,
    profileProgress,
    isLoading,
    updateProfile,
  } = useProfile();

  // Reset state when user changes
  useEffect(() => {
    initialCheckDone.current = false;
    if (!session?.user && typeof window !== 'undefined') {
      sessionStorage.removeItem(PROFILE_COMPLETION_SHOWN_KEY);
    }
  }, [session?.user]);

  // Check if modal should be shown - only once when data is ready
  useEffect(() => {
    if (!session?.user || isLoading) return;
    if (initialCheckDone.current) return;

    const wasShown = typeof window !== 'undefined' && 
      sessionStorage.getItem(PROFILE_COMPLETION_SHOWN_KEY) === 'true';

    // Show modal for:
    // 1. New users (profile is null)
    // 2. Incomplete profiles
    // 3. Progress < 80%
    // 4. Not shown in this session
    // 5. Not on auth pages
    if (!wasShown && 
        !pathname.startsWith("/auth") &&
        (!profile || !isProfileComplete) && 
        (profileProgress ?? 0) < 80) {
      setShowModal(true);
    }
    
    initialCheckDone.current = true;
  }, [session?.user, isLoading, profile, isProfileComplete, profileProgress, pathname]);

  // Handle modal close
  const handleModalClose = (open: boolean) => {
    if (!open && typeof window !== 'undefined') {
      sessionStorage.setItem(PROFILE_COMPLETION_SHOWN_KEY, 'true');
    }
    setShowModal(open);
  };

  // Wrap updateProfile to match the expected type
  const handleProfileUpdate = async (data: { profileProgress: number }) => {
    try {
      await updateProfile(data);
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  return (
    <ProfileCompletionContext.Provider
      value={{
        isProfileComplete: isProfileComplete || (profileProgress ?? 0) >= 100,
        profileProgress: profileProgress ?? 0,
        isLoading,
        updateProfileCompletion: handleProfileUpdate,
      }}
    >
      {children}
      {showModal && session?.user && (
        <ProfileCompletionModal
          open={showModal}
          onOpenChange={handleModalClose}
          user={session.user}
        />
      )}
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