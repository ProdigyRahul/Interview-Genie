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
  } = useProfileStore();
  const initialFetchRef = useRef(false);
  const modalShownInSession = useRef(false);

  // Get user data from session
  const user = session?.user ? {
    ...session.user,
    isProfileComplete,
  } : null;

  // Fetch initial profile data and handle modal display
  useEffect(() => {
    if (!initialFetchRef.current && session?.user) {
      const fetchProfile = async () => {
        try {
          const response = await fetch('/api/profile');
          const data = await response.json();
          
          setProfileProgress(data.profileProgress || 0);
          setIsProfileComplete(data.isProfileComplete || false);

          // Show modal if profile completion is less than 80% and hasn't been shown this session
          if (!modalShownInSession.current && (data.profileProgress || 0) < 80) {
            setShowProfileModal(true);
            modalShownInSession.current = true;
          }
        } catch (error) {
          console.error('Failed to fetch profile:', error);
          toast.error('Failed to load profile data');
        }
      };

      void fetchProfile();
      initialFetchRef.current = true;
    }
  }, [session, setProfileProgress, setIsProfileComplete]);

  // Reset refs when session changes
  useEffect(() => {
    if (!session) {
      initialFetchRef.current = false;
      modalShownInSession.current = false;
    }
  }, [session]);

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
        onOpenChange={setShowProfileModal}
        user={user}
      />
    </>
  );
} 