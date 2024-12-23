import { z } from "zod";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { validateResetToken, getUserByResetToken } from "@/lib/password-reset";
import type { User } from "@prisma/client";

const schema = z.object({
  token: z.string(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  try {
    const body = await req.json() as { token: string; password: string };
    const { token, password } = schema.parse(body);

    const isValid = await validateResetToken(token);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    const user = (await getUserByResetToken(token)) as User;
    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 10);

    await Promise.all([
      db.user.update({
        where: { id: user.id },
        data: { hashedPassword },
      }),
      db.passwordResetToken.deleteMany({
        where: { userId: user.id },
      }),
    ]);

    return NextResponse.json({
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
} 