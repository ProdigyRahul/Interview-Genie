import type { Metadata } from "next";
import { InterviewPracticeClient } from "./client";

export const metadata: Metadata = {
  title: "Practice Interview Questions",
  description: "Practice interview with video and audio recording",
};

export default function InterviewPracticePage({
  params,
}: {
  params: { jobId: string };
}) {
  return <InterviewPracticeClient jobId={params.jobId} />;
} 