import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import { sendEmail } from "@/lib/email";
import { generateOTPEmail } from "@/lib/email-templates/otp-verification";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().email(),
});

// Track resend attempts with timeout
const resendAttempts = new Map<string, number>();

// Clean up old attempts every hour
setInterval(() => {
  resendAttempts.clear();
}, 60 * 60 * 1000);

export async function POST(req: Request) {
  try {
    // Rate limiting: 3 attempts per 5 minutes
    const rateLimitResult = await rateLimit(req, "resend-otp", 3, 5 * 60 * 1000);
    if (rateLimitResult) return rateLimitResult;

    const body = await req.json();
    const { email } = schema.parse(body);

    // Check if user exists and needs verification
    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        isVerified: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.isVerified) {
      return NextResponse.json(
        { error: "Email is already verified" },
        { status: 400 }
      );
    }

    // Check for timeout
    const lastAttempt = resendAttempts.get(email);
    if (lastAttempt) {
      const timeElapsed = Date.now() - lastAttempt;
      if (timeElapsed < 60000) { // 60 seconds timeout
        return NextResponse.json(
          { 
            error: "Please wait before requesting another OTP",
            remainingSeconds: Math.ceil((60000 - timeElapsed) / 1000)
          },
          { status: 429 }
        );
      }
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Update OTP in database
    await db.$transaction(async (tx) => {
      // Delete any existing OTP
      await tx.oTPVerification.deleteMany({
        where: { userId: user.id },
      });

      // Create new OTP
      await tx.oTPVerification.create({
        data: {
          userId: user.id,
          otp,
          expires: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
        },
      });
    });

    // Send new OTP email
    await sendEmail({
      to: email,
      subject: "New Verification Code - Interview Genie",
      html: generateOTPEmail(user.name ?? "User", otp),
    });

    // Update resend attempt timestamp
    resendAttempts.set(email, Date.now());

    return NextResponse.json({
      success: true,
      message: "New verification code sent",
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return NextResponse.json(
      { error: "Failed to resend verification code" },
      { status: 500 }
    );
  }
} 