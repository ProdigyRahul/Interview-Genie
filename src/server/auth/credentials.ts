import { compare } from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/server/db";
import { sendEmail } from "@/lib/email";
import { generateLoginAttemptEmail } from "@/lib/email-templates/login-attempt";
import { rateLimit } from "@/lib/rate-limit";
import { env } from "@/env";
import type { User } from "next-auth";

// Extend the built-in types
declare module "next-auth" {
  interface User {
    credits: number;
    subscriptionStatus: string;
    isVerified: boolean;
  }
}

interface LoginAttempt {
  count: number;
  firstAttempt: number;
  notified: boolean;
  lastAttemptTime: number;
  ipAddresses: Set<string>;
}

const loginAttempts = new Map<string, LoginAttempt>();

// Clean up old attempts every hour
setInterval(() => {
  const now = Date.now();
  for (const [key, attempt] of loginAttempts.entries()) {
    if (now - attempt.firstAttempt > 60 * 60 * 1000) { // 1 hour
      loginAttempts.delete(key);
    }
  }
}, 60 * 60 * 1000); // Every hour

async function verifyCredentials(
  email: string,
  password: string,
  req: Request
): Promise<{ user: User | null; error?: string }> {
  try {
    // Rate limit by IP: 10 attempts per 5 minutes
    const rateLimitResult = await rateLimit(
      req,
      "login",
      10,
      5 * 60 * 1000
    );
    if (rateLimitResult) return { user: null, error: "Too many attempts. Please try again later." };

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
      return { user: null, error: "Invalid credentials" };
    }

    // Verify email first
    if (!user.isVerified) {
      return { user: null, error: "Please verify your email before logging in" };
    }

    const isValid = await compare(password, user.hashedPassword);

    if (!isValid) {
      // Track failed attempts using the actual request IP
      const attempt = loginAttempts.get(email) ?? {
        count: 0,
        firstAttempt: Date.now(),
        notified: false,
        lastAttemptTime: Date.now(),
        ipAddresses: new Set<string>(),
      };

      // Add IP to tracking
      attempt.ipAddresses.add(
        req.headers.get("x-forwarded-for") ??
        req.headers.get("x-real-ip") ??
        req.headers.get("cf-connecting-ip") ??
        req.headers.get("true-client-ip") ??
        "127.0.0.1"
      );
      attempt.count++;
      attempt.lastAttemptTime = Date.now();

      // If multiple IPs are trying the same email, reduce the notification threshold
      const notificationThreshold = attempt.ipAddresses.size > 1 ? 2 : 3;

      // If threshold reached and haven't notified yet
      if (attempt.count >= notificationThreshold && !attempt.notified) {
        attempt.notified = true;
        
        // Get location info from IP (in production, use a geolocation service)
        const location = "Unknown Location";
        const time = new Date().toLocaleString();

        // Send security alert email silently
        void sendEmail({
          to: email,
          subject: "Security Alert - Failed Login Attempts",
          html: generateLoginAttemptEmail(
            user.name ?? "User",
            attempt.count,
            location,
            time
          ),
        }).catch(() => undefined); // Silently handle email errors
      }

      loginAttempts.set(email, attempt);

      // Progressive delay based on attempt count and number of IPs
      const baseDelay = 1000; // 1 second
      const ipMultiplier = Math.max(1, attempt.ipAddresses.size);
      const attemptMultiplier = Math.min(10, attempt.count); // Cap at 10x
      
      if (attempt.count > 3) {
        await new Promise(resolve => 
          setTimeout(resolve, baseDelay * ipMultiplier * attemptMultiplier)
        );
      }

      // Only log truly suspicious activity
      if (attempt.ipAddresses.size > 1) {
        console.warn(
          `Security Alert: Multiple IPs attempting to access account ${email}`,
          { ipCount: attempt.ipAddresses.size }
        );
      }

      return { user: null, error: "Invalid credentials" };
    }

    // Reset attempts on successful login
    loginAttempts.delete(email);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        credits: user.credits,
        subscriptionStatus: user.subscriptionStatus ?? "free",
        isVerified: user.isVerified,
      }
    };
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