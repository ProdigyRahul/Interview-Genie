import NextAuth from "next-auth";
import { CustomPrismaAdapter } from "@/server/auth/adapter";
import { db } from "@/server/db";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { credentialsProvider } from "@/server/auth/credentials";
import type { NextAuthConfig } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";
import type { User, Account, Profile } from "next-auth";

const config = {
  adapter: CustomPrismaAdapter(db),
  session: {
    strategy: "jwt" as const,
  },
  pages: {
    signIn: "/login",
    error: "/login",
    verifyRequest: "/verify-otp",
  },
  providers: [
    credentialsProvider,
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.image = token.image;
        session.user.credits = token.credits;
        session.user.subscriptionStatus = token.subscriptionStatus;
        session.user.isVerified = token.isVerified;
      }
      return session;
    },
    async jwt({ 
      token, 
      user, 
      _account, 
      _profile, 
      trigger, 
      session, 
      _isNewUser 
    }: { 
      token: JWT;
      user?: User;
      _account?: Account | null;
      _profile?: Profile;
      trigger?: "signIn" | "update" | "signUp";
      _isNewUser?: boolean;
      session?: Session;
    }) {
      if (user) {
        // Initial sign in
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
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
          token.email = dbUser.email ?? "";
          token.name = dbUser.name ?? "";
          token.image = dbUser.image ?? undefined;
          token.credits = dbUser.credits;
          token.subscriptionStatus = dbUser.subscriptionStatus ?? "free";
          token.isVerified = dbUser.isVerified;
        }
      }

      if (trigger === "update" && session?.user) {
        return { ...token, ...session.user };
      }

      // For subsequent requests, refresh user data if needed
      if (token.id) {
        const dbUser = await db.user.findUnique({
          where: { id: token.id },
          select: {
            credits: true,
            subscriptionStatus: true,
            isVerified: true,
          },
        });

        if (dbUser) {
          token.credits = dbUser.credits;
          token.subscriptionStatus = dbUser.subscriptionStatus ?? "free";
          token.isVerified = dbUser.isVerified;
        }
      }

      return token;
    },
  },
} satisfies NextAuthConfig;

// Initialize NextAuth
const { handlers, auth, signIn, signOut } = NextAuth(config);

export { handlers, auth, signIn, signOut, config };