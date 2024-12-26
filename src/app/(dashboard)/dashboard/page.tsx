"use client";

import { useEffect, useState } from "react";
import { FeatureNav } from "@/components/dashboard/feature-nav";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { Statistics } from "@/components/dashboard/statistics";
import { ProfileCompletionModal } from "@/components/profile-completion-modal";

export default function DashboardPage() {
  const [showProfileModal, setShowProfileModal] = useState(false);

  // This would come from your API
  const user = {
    // ... user details
    isProfileComplete: false,
    profileProgress: 30,
  };

  useEffect(() => {
    // Show modal if profile is not complete
    if (!user.isProfileComplete) {
      setShowProfileModal(true);
    }
  }, [user.isProfileComplete]);

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

      <ProfileCompletionModal
        open={showProfileModal}
        onOpenChange={setShowProfileModal}
        user={user}
      />
    </>
  );
} 