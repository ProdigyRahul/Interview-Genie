import { DashboardShell } from "@/components/dashboard";
import { Suspense } from "react";

export default function DashboardLayout({
  children,
  profile,
  content,
  loading,
}: {
  children: React.ReactNode;
  profile: React.ReactNode;
  content: React.ReactNode;
  loading: React.ReactNode;
}) {
  return (
    <DashboardShell>
      <Suspense fallback={loading}>
        {profile}
        {content}
        {children}
      </Suspense>
    </DashboardShell>
  );
} 