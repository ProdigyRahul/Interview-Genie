import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { auth } from "@/lib/auth";
import { SessionProvider } from "@/components/providers/session-provider";
import { TRPCReactProvider } from "@/trpc/react";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

import "@/styles/globals.css";

export const metadata = {
  title: "Interview Genie - AI-Powered Interview Preparation Platform",
  description: "Prepare for your next job interview with AI-powered tools, mock interviews, and personalized feedback.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased",
        GeistSans.variable,
        GeistMono.variable
      )}>
        <ThemeProvider>
          <TRPCReactProvider>
            <SessionProvider session={session}>
              {children}
              <Toaster />
            </SessionProvider>
          </TRPCReactProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
