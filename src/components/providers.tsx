"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/providers/query-provider";
import { SessionProvider } from "next-auth/react";
import { ProfileCompletionProvider } from "@/components/providers/profile-completion-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryProvider>
        <SessionProvider>
          <ProfileCompletionProvider>
            {children}
            <Toaster richColors closeButton position="top-center" />
          </ProfileCompletionProvider>
        </SessionProvider>
      </QueryProvider>
    </ThemeProvider>
  );
} 