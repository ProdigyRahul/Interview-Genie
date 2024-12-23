export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/20 via-background to-background">
      <div className="w-full max-w-[400px] p-4 md:p-8">
        {children}
      </div>
    </div>
  );
} 