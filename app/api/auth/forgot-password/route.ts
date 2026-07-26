import { NextResponse } from "next/server";
import crypto from "crypto";

import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.toLowerCase().trim() : "";

  // Always respond the same way whether or not the email exists —
  // this avoids leaking which addresses have accounts.
  const genericResponse = NextResponse.json({
    ok: true,
    message: "If an account exists for that email, a password reset link has been sent.",
  });

  if (!email) return genericResponse;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return genericResponse;

  const rawToken = crypto.randomBytes(32).toString("hex");
  const resetTokenHash = hashToken(rawToken);
  const resetTokenExpiry = new Date(Date.now() + TOKEN_TTL_MS);

  await prisma.user.update({
    where: { id: user.id },
    data: { resetTokenHash, resetTokenExpiry },
  });

  const baseUrl = process.env.NEXTAUTH_URL ?? new URL(request.url).origin;
  const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`;

  await sendEmail({
    to: user.email,
    subject: "Reset your Strata password",
    text: `Hi ${user.name},\n\nWe received a request to reset your Strata password. This link is valid for 1 hour:\n\n${resetUrl}\n\nIf you didn't request this, you can safely ignore this email.`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1a2e1a;">Reset your password</h2>
        <p>Hi ${user.name},</p>
        <p>We received a request to reset your Strata password. This link is valid for 1 hour.</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="background: #2d5a3d; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block;">Reset Password</a>
        </p>
        <p style="color: #666; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });

  return genericResponse;
}
