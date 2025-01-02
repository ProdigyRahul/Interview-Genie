"use client";

import { Suspense } from "react";
import { Statistics } from "./statistics";
import { FeatureNav } from "./feature-nav";
import { QuickActions } from "./quick-actions";
import { RecentActivity } from "./recent-activity";
import { ProfileCompletionModal } from "@/components/profile-completion-modal";
import { useProfile } from "@/hooks/use-profile";

interface DashboardContentProps {
  user: any;
}

export function DashboardContent({ user }: DashboardContentProps) {
  const { 
    profile,
    shouldShowCompletion = false,
    markCompletionShown = () => {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('profile-completion-shown', 'true');
      }
    }
  } = useProfile({
    initialData: user,
  });

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<div className="animate-pulse h-32 bg-muted rounded-lg" />}>
          <Statistics />
        </Suspense>
      </div>

      {/* Main Feature Navigation */}
      <div className="py-4">
        <Suspense fallback={<div className="animate-pulse h-32 bg-muted rounded-lg" />}>
          <FeatureNav />
        </Suspense>
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid gap-6 md:grid-cols-7">
        <Suspense fallback={<div className="animate-pulse h-32 bg-muted rounded-lg" />}>
          <QuickActions />
        </Suspense>
        <div className="md:col-span-3">
          <Suspense fallback={<div className="animate-pulse h-32 bg-muted rounded-lg" />}>
            <RecentActivity />
          </Suspense>
        </div>
      </div>

      {/* Profile completion modal */}
      {shouldShowCompletion && (
        <ProfileCompletionModal
          open={shouldShowCompletion}
          onOpenChange={(open) => {
            if (!open) markCompletionShown();
          }}
          user={profile ?? user}
        />
      )}
    </div>
  );
} 