import { RecentInterviews } from "./components/recent-interviews";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Interview Preparation Dashboard</h1>
      <RecentInterviews />
    </div>
  );
} 