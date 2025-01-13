"use client";

import { Suspense } from "react";
import { Statistics } from "./statistics";
import { FeatureNav } from "./feature-nav";
import { QuickActions } from "./quick-actions";

interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  credits: number;
  subscriptionStatus: string;
  isVerified: boolean;
}

interface DashboardContentProps {
  children?: React.ReactNode;
  user: User;
}

export function DashboardContent({ 
  children,
  user,
}: DashboardContentProps) {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      <Suspense 
        fallback={
          <div className="w-full h-48 rounded-lg bg-muted animate-pulse" />
        }
      >
        <Statistics />
      </Suspense>

      <div className="space-y-6">
        {/* Document Preparation and Interview Preparation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Suspense
            fallback={
              <div className="w-full h-48 rounded-lg bg-muted animate-pulse" />
            }
          >
            <FeatureNav type="document" />
          </Suspense>
          <Suspense
            fallback={
              <div className="w-full h-48 rounded-lg bg-muted animate-pulse" />
            }
          >
            <FeatureNav type="interview" />
          </Suspense>
        </div>

        {/* Resources and Progress & Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Suspense
            fallback={
              <div className="w-full h-48 rounded-lg bg-muted animate-pulse" />
            }
          >
            <FeatureNav type="resources" />
          </Suspense>
          <Suspense
            fallback={
              <div className="w-full h-48 rounded-lg bg-muted animate-pulse" />
            }
          >
            <FeatureNav type="progress" />
          </Suspense>
        </div>

        {/* Quick Actions */}
        <Suspense
          fallback={
            <div className="w-full h-48 rounded-lg bg-muted animate-pulse" />
          }
        >
          <QuickActions user={user} />
        </Suspense>

        {children}
      </div>
    </div>
  );
} 