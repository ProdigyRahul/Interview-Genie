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

// Helper function to send emails in background
function sendEmailsInBackground(email: string, name: string, otp: string) {
  // Send verification email
  void sendEmail({
    to: email,
    subject: "Verify your email - Interview Genie",
    html: generateOTPEmail(name, otp),
  }).catch(error => {
    console.error("Failed to send verification email:", error);
  });

  // Send welcome email after a short delay to prevent Gmail throttling
  setTimeout(() => {
    void sendEmail({
      to: email,
      subject: "Welcome to Interview Genie! 🎉",
      html: generateWelcomeEmail(name),
    }).catch(error => {
      console.error("Failed to send welcome email:", error);
    });
  }, 2000); // 2 second delay
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    // Rate limiting: 5 attempts per minute
    const rateLimitResult = await rateLimit(req, "signup", 5, 60 * 1000);
    if (rateLimitResult) return rateLimitResult;

    const body = await req.json();
    const { name, email, password } = signupSchema.parse(body);

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new NextResponse(
        JSON.stringify({ error: "Email already registered" }), 
        { status: 400 }
      );
    }

    // Create user
    const hashedPassword = await hash(password, 12);
    const user = await db.user.create({
      data: {
        name,
        email,
        hashedPassword,
        emailVerified: null,
        image: null,
        credits: 100,
        subscriptionStatus: "free",
        isVerified: false,
      },
    });

    // Generate OTP
    const otp = generateOTP();
    await db.oTPVerification.create({
      data: {
        userId: user.id,
        otp,
        expires: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      },
    });

    // Send emails in background
    sendEmailsInBackground(email, name, otp);

    // Return success response immediately
    return new NextResponse(
      JSON.stringify({ 
        success: true, 
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error("Signup error:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to create account" }),
      { status: 500 }
    );
  }
} 