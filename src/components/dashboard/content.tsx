"use client";

import { useQuery } from "@tanstack/react-query";
import { Statistics } from "./statistics";
import { FeatureNav } from "./feature-nav";
import { QuickActions } from "./quick-actions";
import { RecentActivity } from "./recent-activity";
import { ProfileCompletionModal } from "@/components/profile-completion-modal";
import { useEffect, useState } from "react";

interface DashboardContentProps {
  user: any;
}

export function DashboardContent({ user }: DashboardContentProps) {
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Fetch profile data with React Query
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await fetch("/api/profile");
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }
      return response.json();
    },
  });

  // Show modal if profile completion is less than 80%
  useEffect(() => {
    if (profile && profile.profileProgress < 80) {
      setShowProfileModal(true);
    }
  }, [profile]);

  return (
    <>
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

      {/* Profile completion modal */}
      <ProfileCompletionModal
        open={showProfileModal}
        onOpenChange={setShowProfileModal}
        user={user}
      />
    </>
  );
} 