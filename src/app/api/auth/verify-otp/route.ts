import { z } from "zod";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { db } from "@/server/db";

const verifyOTPSchema = z.object({
  userId: z.string(),
  otp: z.string().length(6),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, otp } = verifyOTPSchema.parse(body);

    const otpVerification = await db.oTPVerification.findFirst({
      where: {
        userId,
        otp,
        expires: {
          gt: new Date(),
        },
      },
    });

    if (!otpVerification) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // Update user verification status and cleanup OTP
    await Promise.all([
      db.user.update({
        where: { id: userId },
        data: { isVerified: true },
      }),
      db.oTPVerification.delete({
        where: { id: otpVerification.id },
      }),
    ]);

    return NextResponse.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("OTP verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 }
    );
  }
} 