import Link from "next/link";
import { SignupForm } from "./signup-form";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";

export default async function SignupPage() {
  const session = await auth();
  
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-3xl font-bold">Create an Account</h1>
        <p className="text-muted-foreground">
          Enter your details below to create your account
        </p>
      </div>
      <SignupForm />
      <div className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="underline underline-offset-4 hover:text-primary"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
} 