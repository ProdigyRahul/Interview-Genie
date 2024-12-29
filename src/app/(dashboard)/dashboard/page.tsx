"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { FeatureNav } from "@/components/dashboard/feature-nav";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { Statistics } from "@/components/dashboard/statistics";
import { ProfileCompletionModal } from "@/components/profile-completion-modal";
import { useProfileStore } from "@/store/use-profile-store";
import { toast } from "sonner";

export default function DashboardPage() {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { data: session } = useSession();
  const {  
    isProfileComplete,
    setProfileProgress, 
    setIsProfileComplete,
    hasShownModalInSession,
    setHasShownModalInSession
  } = useProfileStore();
  const initialFetchRef = useRef(false);

  // Get user data from session
  const user = session?.user ? {
    ...session.user,
    isProfileComplete,
  } : null;

  // Reset hasShownModalInSession when session changes (user logs out)
  useEffect(() => {
    if (!session) {
      initialFetchRef.current = false;
      setHasShownModalInSession(false);
    }
  }, [session, setHasShownModalInSession]);

  // Fetch initial profile data and handle modal display
  useEffect(() => {
    if (!initialFetchRef.current && session?.user) {
      const fetchProfile = async () => {
        try {
          const response = await fetch('/api/profile');
          const data = await response.json();
          
          const progress = data.profileProgress || 0;
          setProfileProgress(progress);
          setIsProfileComplete(data.isProfileComplete || false);

          // Show modal if:
          // 1. Profile completion is less than 80%
          // 2. Profile has been submitted before (not first time)
          // 3. Modal hasn't been shown in this session
          if (progress < 80 && !hasShownModalInSession) {
            setShowProfileModal(true);
            setHasShownModalInSession(true);
          }
        } catch (error) {
          console.error('Failed to fetch profile:', error);
          toast.error('Failed to load profile data');
        }
      };

      void fetchProfile();
      initialFetchRef.current = true;
    }
  }, [session, setProfileProgress, setIsProfileComplete, hasShownModalInSession, setHasShownModalInSession]);

  const handleModalClose = (open: boolean) => {
    setShowProfileModal(open);
  };

  if (!user) return null;

  return (
    <>
      <div className="flex-1 space-y-8 p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Statistics />
        </div>

        {/* Main Feature Navigation */}
        <div className="py-4">
          <FeatureNav />
        </div>

        {/* Quick Actions and Recent Activity */}
        <div className="grid gap-6 md:grid-cols-7">
          <QuickActions />
          <div className="md:col-span-3">
            <RecentActivity />
          </div>
        </div>
      </div>

      {/* Profile completion modal - shows above dashboard content */}
      <ProfileCompletionModal
        open={showProfileModal}
        onOpenChange={handleModalClose}
        user={user}
      />
    </>
  );
} 