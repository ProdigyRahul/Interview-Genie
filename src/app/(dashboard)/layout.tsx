import { MainNav } from "@/components/main-nav";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <main className="container mx-auto p-8">{children}</main>
    </div>
  );
} 