import { compare } from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/server/db";
import type { User } from "next-auth";

interface Credentials {
  email: string;
  password: string;
}

export const credentialsProvider = CredentialsProvider({
  id: "credentials",
  name: "credentials",
  credentials: {
    email: { 
      label: "Email", 
      type: "email",
      placeholder: "hello@example.com",
    },
    password: { 
      label: "Password", 
      type: "password",
      placeholder: "••••••••",
    },
  },
  async authorize(credentials): Promise<User | null> {
    if (!credentials?.email || !credentials?.password) {
      throw new Error("Invalid credentials");
    }

    const { email, password } = credentials as Credentials;

    try {
      const user = await db.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          hashedPassword: true,
          isVerified: true,
          credits: true,
          subscriptionStatus: true,
        },
      });

      if (!user?.hashedPassword) {
        throw new Error("Invalid credentials");
      }

      if (!user.isVerified) {
        throw new Error("Please verify your email before logging in");
      }

      const isPasswordValid = await compare(password, user.hashedPassword);

      if (!isPasswordValid) {
        throw new Error("Invalid credentials");
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name ?? "",
        image: user.image ?? "",
        credits: user.credits,
        subscriptionStatus: user.subscriptionStatus ?? "free",
        isVerified: user.isVerified,
      };
    } catch (error) {
      console.error("Authentication error:", error);
      return null;
    }
  },
}); 