import NextAuth from "next-auth";
import { CustomPrismaAdapter } from "@/server/auth/adapter";
import { db } from "@/server/db";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { credentialsProvider } from "@/server/auth/credentials";
import type { NextAuthConfig } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { User } from "next-auth";
import { env } from "@/env";

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
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          emailVerified: profile.email_verified ? new Date() : null,
          credits: 100,
          subscriptionStatus: "free",
          isVerified: true,
        };
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: {
        params: {
          // Request user's email and profile data
          scope: "read:user user:email",
        },
      },
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name ?? profile.login,
          email: profile.email,
          image: profile.avatar_url,
          // Additional fields for our custom user type
          emailVerified: null,
          credits: 100,
          subscriptionStatus: "free",
          isVerified: true,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "signIn" && user) {
        // For new sign-ins, fetch the complete user data
        const dbUser = await db.user.findUnique({
          where: { email: user.email! },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            credits: true,
            subscriptionStatus: true,
            isVerified: true,
          },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.email = dbUser.email ?? user.email;
          token.name = dbUser.name ?? user.name ?? "";
          token.image = dbUser.image ?? undefined;
          token.credits = dbUser.credits;
          token.subscriptionStatus = dbUser.subscriptionStatus;
          token.isVerified = dbUser.isVerified;
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
    async signIn({ user, isNewUser, account }) {
      if (!user?.email) return;

      try {
        if (isNewUser) {
          // Initialize profile data for new users
          await db.user.update({
            where: { email: user.email },
            data: {
              credits: 100,
              subscriptionStatus: 'free',
              isVerified: true,
              emailVerified: new Date(),
              // Only set name and image if they are strings
              ...(typeof user.name === 'string' ? { name: user.name } : {}),
              ...(typeof user.image === 'string' ? { image: user.image } : {}),
            },
          });
        } else if (account?.provider === "google") {
          // Update existing user's Google-specific data
          await db.user.update({
            where: { email: user.email },
            data: {
              emailVerified: new Date(),
              // Only set name and image if they are strings
              ...(typeof user.name === 'string' ? { name: user.name } : {}),
              ...(typeof user.image === 'string' ? { image: user.image } : {}),
            },
          });
        }
      } catch (error) {
        console.error("[AUTH_SIGNIN_ERROR]", error);
      }
    },
  },
  secret: env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);