export default function InterviewQuestionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto py-4 md:py-6">
      {children}
    </div>
  );
} 