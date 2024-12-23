import Link from "next/link";
import { auth } from "@/server/auth";

export default async function Home() {
  const session = await auth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-indigo-900 to-purple-900 text-white">
      <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight text-center sm:text-[5rem]">
          Interview Genie
        </h1>
        <p className="text-2xl text-center">
          AI-Powered Job Interview Preparation Platform
        </p>
        
        <div className="flex flex-col items-center justify-center gap-4">
          {session ? (
            <div className="space-y-4 text-center">
              <p className="text-xl">Welcome back, {session.user?.name}</p>
              <Link
                href="/dashboard"
                className="inline-block rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
              >
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
            >
              Get Started
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
