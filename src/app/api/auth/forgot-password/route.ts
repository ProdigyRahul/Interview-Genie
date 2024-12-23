import { z } from "zod";
import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { generateResetToken } from "@/lib/password-reset";
import { generatePasswordResetEmail, sendEmail } from "@/lib/email";
import { env } from "@/env";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json() as { email: string };
    const { email } = schema.parse(body);

    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return success even if user doesn't exist to prevent email enumeration
      return NextResponse.json({
        message: "If an account exists, you will receive a password reset email.",
      });
    }

    const token = await generateResetToken(user.id);
    const resetLink = `${env.NEXTAUTH_URL}/reset-password?token=${token}`;
    
    await sendEmail({
      to: user.email,
      subject: "Reset Your Password - Interview Genie",
      html: generatePasswordResetEmail(user.name ?? "User", resetLink),
    });

    return NextResponse.json({
      message: "If an account exists, you will receive a password reset email.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
} 