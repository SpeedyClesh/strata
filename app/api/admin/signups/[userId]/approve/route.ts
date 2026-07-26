import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { AccountType } from "@prisma/client";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { provisionAccountForUser } from "@/lib/provision-account";

export async function POST(request: Request, { params }: { params: { userId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin only." }, { status: 403 });
  }

  const user = await prisma.user.findUnique({ where: { id: params.userId } });
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });
  if (user.status !== "PENDING") {
    return NextResponse.json({ error: "This application has already been reviewed." }, { status: 400 });
  }

  const accountType = user.requestedAccountType ?? AccountType.SAVINGS;
  const account = await provisionAccountForUser(user.id, accountType);

  await prisma.user.update({
    where: { id: user.id },
    data: { status: "ACTIVE" },
  });

  await prisma.notification.create({
    data: {
      userId: user.id,
      kind: "INFO",
      title: "Welcome to Strata",
      body: "Your account has been approved. Sign in to explore your dashboard.",
    },
  });

  await sendEmail({
    to: user.email,
    subject: "Your Strata account has been approved",
    text: `Hi ${user.name},\n\nGreat news — your Strata ${accountType.toLowerCase()} account has been approved.\n\nAccount number: ${account.accountNumber}\n\nSign in anytime with the email and password you signed up with.\n\n— Strata`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1a2e1a;">You're approved!</h2>
        <p>Hi ${user.name},</p>
        <p>Great news — your Strata <strong>${accountType.toLowerCase()}</strong> account has been approved.</p>
        <p>Account number: <strong>${account.accountNumber}</strong></p>
        <p>Sign in anytime with the email and password you signed up with.</p>
      </div>
    `,
  });

  return NextResponse.json({ ok: true });
}
