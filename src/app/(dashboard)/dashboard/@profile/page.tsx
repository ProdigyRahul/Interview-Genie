import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { DashboardHeader } from "@/components/dashboard";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) return null;

  return (
    <Suspense fallback={
      <div className="flex items-center justify-between animate-pulse">
        <div className="h-8 w-1/4 bg-muted rounded" />
        <div className="h-8 w-32 bg-muted rounded" />
      </div>
    }>
      <DashboardHeader user={session.user} />
    </Suspense>
  );
} 