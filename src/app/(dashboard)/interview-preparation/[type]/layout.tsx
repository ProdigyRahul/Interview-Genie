import { notFound } from "next/navigation";

const validTypes = ["audio", "video", "technical", "behavioral"];

interface InterviewPreparationLayoutProps {
  children: React.ReactNode;
  params: {
    type: string;
  };
}

export default function InterviewPreparationLayout({
  children,
  params,
}: InterviewPreparationLayoutProps) {
  if (!validTypes.includes(params.type)) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight capitalize">
          {params.type} Interview Preparation
        </h2>
      </div>
      {children}
    </div>
  );
} 