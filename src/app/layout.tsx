import "@/styles/globals.css";
import { GeistSans } from "geist/font/sans";
import { Providers } from "../components/providers";

export const metadata = {
  title: "Interview Genie - AI-Powered Interview Preparation",
  description: "Prepare for your next job interview with AI-powered mock interviews, personalized feedback, and expert guidance.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={GeistSans.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
