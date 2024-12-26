import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import { sendEmail } from "@/lib/email";
import { generateOTPEmail } from "@/lib/email-templates/otp-verification";
import { generateWelcomeEmail } from "@/lib/email-templates/welcome";
import { rateLimit } from "@/lib/rate-limit";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    // Rate limiting: 5 attempts per minute
    const rateLimitResult = await rateLimit(req, "signup", 5, 60 * 1000);
    if (rateLimitResult) return rateLimitResult;

    const data = await req.json();
    const { name, email, password } = signupSchema.parse(data);

    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 10);
    const otp = generateOTP();

    // Create user and OTP verification in a transaction
    const { user } = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          hashedPassword,
          emailVerified: null,
          image: null,
          credits: 100, // Default credits
          subscriptionStatus: "free", // Default subscription status
          isVerified: false, // Default verification status
        },
      });

      // Delete any existing OTP for this user
      await tx.oTPVerification.deleteMany({
        where: { userId: user.id },
      });

      // Create new OTP verification
      await tx.oTPVerification.create({
        data: {
          userId: user.id,
          otp,
          expires: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
        },
      });

      return { user };
    });

    // Send OTP verification email
    void sendEmail({
      to: email,
      subject: "Verify Your Email - Interview Genie",
      html: generateOTPEmail(name, otp),
    });

    // Send welcome email
    void sendEmail({
      to: email,
      subject: "Welcome to Interview Genie! 🎉",
      html: generateWelcomeEmail(name),
    });

    // Immediately return success response
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        credits: user.credits,
        subscriptionStatus: user.subscriptionStatus,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
} 