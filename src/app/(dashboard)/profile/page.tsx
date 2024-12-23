import { ProfileForm } from "./components/profile-form";
import { ResumeManager } from "./components/resume-manager";
import { InterviewHistory } from "./components/interview-history";

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      <ProfileForm />
      <ResumeManager />
      <InterviewHistory />
    </div>
  );
} 