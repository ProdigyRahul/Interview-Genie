import { z } from "zod";
import { NextResponse } from "next/server";
import { db } from "@/server/db";

const verifyOTPSchema = z.object({
  userId: z.string(),
  otp: z.string().length(6),
});

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { userId, otp } = verifyOTPSchema.parse(body);

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
        { status: 400 }
      );
    }

    // Update user verification status
    await db.user.update({
      where: { id: userId },
      data: { isVerified: true },
    });

    // Clean up OTP record
    await db.oTPVerification.delete({
      where: { id: otpRecord.id },
    });

    return new NextResponse(
      JSON.stringify({ 
        success: true,
        message: "Email verified successfully" 
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error("OTP verification error:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to verify OTP" }),
      { status: 500 }
    );
  }
} 