import NextAuth from "next-auth";
import { CustomPrismaAdapter } from "@/server/auth/adapter";
import { db } from "@/server/db";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { credentialsProvider } from "@/server/auth/credentials";
import type { NextAuthConfig } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { Session, User } from "next-auth";

// Extend the User type to include our custom fields
interface CustomUser extends User {
  id: string;
  email: string;
  name: string;
  image?: string;
  emailVerified: Date | null;
  credits: number;
  subscriptionStatus: string;
  isVerified: boolean;
  isProfileComplete?: boolean;
  profileProgress?: number;
}

// Extend the JWT type to include our custom fields
interface CustomJWT extends JWT {
  id: string;
  email: string;
  name: string;
  image?: string;
  credits: number;
  subscriptionStatus: string;
  isVerified: boolean;
  isProfileComplete?: boolean;
  profileProgress?: number;
}

export const authConfig = {
  adapter: CustomPrismaAdapter(db),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/login",
    error: "/login",
    verifyRequest: "/verify-otp",
  },
  providers: [
    credentialsProvider,
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          access_type: "offline",
          response_type: "code",
          prompt: "consent",
        }
      }
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "signIn" && user) {
        const customUser = user as CustomUser;
        token.id = customUser.id;
        token.email = customUser.email;
        token.name = customUser.name;
        token.image = customUser.image;
        token.credits = customUser.credits;
        token.subscriptionStatus = customUser.subscriptionStatus;
        token.isVerified = customUser.isVerified;

        // Fetch latest profile data on sign in
        const userData = await db.user.findUnique({
          where: { id: customUser.id },
          select: {
            isProfileComplete: true,
            profileProgress: true,
          },
        });

        if (userData) {
          token.isProfileComplete = userData.isProfileComplete;
          token.profileProgress = userData.profileProgress;
        }
      }

      if (trigger === "update" && session) {
        // Update token with latest session data
        const updatedToken = {
          ...token,
          ...session.user,
        };
        return updatedToken as CustomJWT;
      }

      return token as CustomJWT;
    },
    async session({ session, token }) {
      const customToken = token as CustomJWT;
      
      if (customToken && session.user) {
        // Ensure all token data is properly synced to session
        session.user = {
          ...session.user,
          id: customToken.id,
          email: customToken.email,
          name: customToken.name,
          image: customToken.image,
          credits: customToken.credits,
          subscriptionStatus: customToken.subscriptionStatus,
          isVerified: customToken.isVerified,
          isProfileComplete: customToken.isProfileComplete,
          profileProgress: customToken.profileProgress,
        } as CustomUser;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Handle relative URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // Handle same origin URLs
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      // Default to base URL
      return baseUrl;
    },
  },
  events: {
    async signIn({ user, isNewUser }) {
      if (isNewUser) {
        // Initialize profile data for new users
        await db.user.update({
          where: { id: user.id },
          data: {
            isProfileComplete: false,
            profileProgress: 0,
            credits: 100, // Initial credits
            subscriptionStatus: 'free',
            isVerified: false,
          },
        });
      }
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);