import { randomBytes, createHash } from "crypto";
import { db } from "@/server/db";
import type { User } from "@prisma/client";

export async function generateResetToken(userId: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const hashedToken = createHash("sha256").update(token).digest("hex");
  const expires = new Date(Date.now() + 5 * 60 * 1000);

  await db.passwordResetToken.create({
    data: {
      userId,
      token: hashedToken,
      expires,
    },
  });

  return token;
}

export async function validateResetToken(token: string): Promise<boolean> {
  const hashedToken = createHash("sha256").update(token).digest("hex");
  
  const resetToken = await db.passwordResetToken.findFirst({
    where: {
      token: hashedToken,
      expires: {
        gt: new Date(),
      },
    },
  });

  return Boolean(resetToken);
}

export async function getUserByResetToken(token: string): Promise<User | null> {
  const hashedToken = createHash("sha256").update(token).digest("hex");
  
  const resetToken = await db.passwordResetToken.findFirst({
    where: {
      token: hashedToken,
      expires: {
        gt: new Date(),
      },
    },
    include: {
      user: true,
    },
  });

  return resetToken?.user ?? null;
} 