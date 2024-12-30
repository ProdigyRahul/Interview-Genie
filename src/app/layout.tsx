import { GeistSans } from "geist/font/sans";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import { auth } from "@/lib/auth";
import { Toaster } from "sonner";
import "@/styles/globals.css";
import { ProfileCompletionProvider } from "@/components/providers/profile-completion-provider";

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
    <html lang="en" suppressHydrationWarning className={GeistSans.variable}>
      <body className={cn("min-h-screen bg-background font-sans antialiased")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider session={session}>
            <QueryProvider>
              <ProfileCompletionProvider>
                <Toaster />
                {children}
              </ProfileCompletionProvider>
            </QueryProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
