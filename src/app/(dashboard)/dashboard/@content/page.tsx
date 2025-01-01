import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { DashboardContent } from "@/components/dashboard";

export default async function ContentPage() {
  const session = await auth();

  if (!session?.user) return null;

  return (
    <Suspense 
      fallback={
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/3 bg-muted rounded" />
          <div className="h-32 bg-muted rounded" />
          <div className="h-32 bg-muted rounded" />
        </div>
      }
    >
      <DashboardContent user={session.user} />
    </Suspense>
  );
} 