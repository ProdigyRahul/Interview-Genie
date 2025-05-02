import { RecordingProvider } from "@/providers/recording-provider";

export default function InterviewPracticeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RecordingProvider>{children}</RecordingProvider>;
} 