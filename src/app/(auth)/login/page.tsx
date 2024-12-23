import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await auth();
  
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-3xl font-bold">Interview Genie</h1>
        <p className="text-muted-foreground">
          AI-Powered Interview Preparation Platform
        </p>
      </div>
      <LoginForm />
    </div>
  );
} 