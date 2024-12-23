import { ThemeToggle } from "@/components/theme-toggle";
import { VerticalTestimonials } from "@/components/ui/vertical-testimonials";
import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Auth Forms */}
      <div className="flex items-center justify-center relative bg-background">
        {/* Logo and Title */}
        <Link 
          href="/"
          className="absolute top-8 left-8 flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Image
            src="/Assets/Images/logos/logo.png"
            alt="Interview Genie Logo"
            width={40}
            height={40}
            className="rounded-lg"
          />
          <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Interview Genie
          </span>
        </Link>

        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-[400px] p-8">
          {children}
        </div>
      </div>

      {/* Right Side - Testimonials */}
      <div className="hidden lg:flex relative bg-muted/30 dark:bg-muted/10">
        <div className="absolute inset-0 bg-gradient-to-r from-background/50 via-transparent to-transparent" />
        <div className="relative w-full flex flex-col justify-center p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground">
              AI-Powered Interview Preparation
            </h2>
            <p className="mt-2 text-lg text-muted-foreground">
              Join thousands who have improved their interview skills with our platform
            </p>
          </div>
          
          <div className="flex-1 min-h-0">
            <VerticalTestimonials 
              className="h-[calc(100vh-12rem)]" 
              speed="slow"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 