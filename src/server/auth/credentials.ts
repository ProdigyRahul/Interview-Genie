import { compare } from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/server/db";
import { sendEmail } from "@/lib/email";
import { generateLoginAttemptEmail } from "@/lib/email-templates/login-attempt";
import { env } from "@/env";
import { authCache } from "@/lib/auth-cache";
import type { User } from "next-auth";

// Extend the built-in types
declare module "next-auth" {
  interface User {
    hashedPassword?: string | null;
    credits: number;
    subscriptionStatus: string;
    isVerified: boolean;
  }
}

async function verifyCredentials(
  email: string,
  password: string,
  req: Request
): Promise<{ user: User | null; error?: string }> {
  try {
    // Rate limit check using Redis
    const ipAddress = req.headers.get("x-forwarded-for") ??
      req.headers.get("x-real-ip") ??
      req.headers.get("cf-connecting-ip") ??
      req.headers.get("true-client-ip") ??
      "127.0.0.1";

    const rateLimitKey = `login:${email}:${ipAddress}`;
    const isAllowed = await authCache.checkRateLimit(rateLimitKey);

    if (!isAllowed) {
      const remainingTime = await authCache.getRemainingAttempts(rateLimitKey);
      return { 
        user: null, 
        error: `Too many attempts. Please try again in ${Math.ceil(remainingTime / 60)} minutes.` 
      };
    }

    // Try to get user from cache first
    const cachedUser = await authCache.getUserById(email);
    const user = cachedUser ?? await db.user.findUnique({
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
      return { user: null, error: "Invalid credentials" };
    }

    // Verify email first
    if (!user.isVerified) {
      return { user: null, error: "Please verify your email before logging in" };
    }

    const isValid = await compare(password, user.hashedPassword);

    if (!isValid) {
      // Get remaining attempts for user feedback
      const remainingAttempts = await authCache.getRemainingAttempts(rateLimitKey);
      
      // If less than 2 attempts remaining, send security alert
      if (remainingAttempts <= 2) {
        // Get location info from IP (in production, use a geolocation service)
        const location = "Unknown Location";
        const time = new Date().toLocaleString();

        // Send security alert email silently
        void sendEmail({
          to: email,
          subject: "Security Alert - Failed Login Attempts",
          html: generateLoginAttemptEmail(
            user.name ?? "User",
            5 - remainingAttempts,
            location,
            time
          ),
        }).catch(() => undefined); // Silently handle email errors
      }

      // Progressive delay based on remaining attempts
      const delay = Math.max(1000, (5 - remainingAttempts) * 1000);
      await new Promise(resolve => setTimeout(resolve, delay));

      return { 
        user: null, 
        error: remainingAttempts > 0 
          ? `Invalid credentials. ${remainingAttempts} attempts remaining.`
          : "Invalid credentials. Please try again later."
      };
    }

    // Clear rate limit on successful login
    await authCache.clearRateLimit(rateLimitKey);

    // Cache user data
    if (!cachedUser) {
      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        credits: user.credits,
        subscriptionStatus: user.subscriptionStatus ?? "free",
        isVerified: user.isVerified,
      };
      await authCache.setUser(email, userData);
      return { user: userData };
    }

    return { user: cachedUser };

  } catch (error) {
    // Only log unexpected errors
    console.error("Unexpected login error:", error);
    return { user: null, error: "An unexpected error occurred" };
  }
}

// Export the NextAuth credentials provider
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
  async authorize(credentials, request) {
    if (!credentials?.email || !credentials?.password) {
      return null;
    }

    // Create a proper Request object with all headers
    const req = new Request(request.url ?? env.NEXTAUTH_URL, {
      headers: request.headers,
      method: request.method,
    });

    const { user, error } = await verifyCredentials(
      credentials.email as string,
      credentials.password as string,
      req
    );

    if (error && !user) {
      // Return null instead of throwing for expected auth failures
      return null;
    }

    return user;
  },
});