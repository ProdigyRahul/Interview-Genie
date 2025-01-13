import { z } from "zod";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authCache } from "@/lib/auth-cache";

export const runtime = "edge";

const verifyOTPSchema = z.object({
  userId: z.string(),
  otp: z.string().length(6),
});

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { userId, otp } = verifyOTPSchema.parse(body);

    // Check rate limit first
    const rateLimitKey = `verify-otp:${userId}`;
    const isAllowed = await authCache.checkRateLimit(rateLimitKey, 5, 300);
    if (!isAllowed) {
      return new NextResponse(
        JSON.stringify({ error: "Too many attempts. Please try again later." }),
        { 
          status: 429,
          headers: {
            'Cache-Control': 'no-store, must-revalidate',
            'Content-Type': 'application/json',
          }
        }
      );
    }

    const otpRecord = await db.oTPVerification.findFirst({
      where: {
        userId,
        otp,
        expires: {
          gt: new Date(),
        },
      },
    });

    if (!otpRecord) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid or expired OTP" }),
        { 
          status: 400,
          headers: {
            'Cache-Control': 'no-store, must-revalidate',
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // Update user verification status and clean up in a transaction
    await db.$transaction([
      db.user.update({
        where: { id: userId },
        data: { isVerified: true },
      }),
      db.oTPVerification.delete({
        where: { id: otpRecord.id },
      }),
    ]);

    // Clear rate limit on success
    await authCache.clearRateLimit(rateLimitKey);

    // Invalidate user sessions
    await authCache.invalidateUserSessions(userId);

    return new NextResponse(
      JSON.stringify({ 
        success: true,
        message: "Email verified successfully" 
      }),
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
          'Content-Type': 'application/json',
        }
      }
    );

  } catch (error) {
    console.error("OTP verification error:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to verify OTP" }),
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
          'Content-Type': 'application/json',
        }
      }
    );
  }
} 