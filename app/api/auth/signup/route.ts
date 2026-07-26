import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { AccountType } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const name = String(body?.name ?? "").trim();
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");
  const phone = body?.phone ? String(body.phone).trim() : null;
  const country = body?.country ? String(body.country).trim() : null;
  const accountTypeInput = String(body?.accountType ?? "SAVINGS").toUpperCase();

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const validAccountTypes = Object.values(AccountType);
  const requestedAccountType = validAccountTypes.includes(accountTypeInput as AccountType)
    ? (accountTypeInput as AccountType)
    : AccountType.SAVINGS;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with that email already exists." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      phone,
      country,
      role: "USER",
      status: "PENDING",
      requestedAccountType,
    },
  });

  await sendEmail({
    to: email,
    subject: "We've received your Strata application",
    text: `Hi ${name},\n\nThanks for applying for a Strata ${requestedAccountType.toLowerCase()} account. Our team is reviewing your application and will email you once it's approved — usually within one business day.\n\n— Strata`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1a2e1a;">Application received</h2>
        <p>Hi ${name},</p>
        <p>Thanks for applying for a Strata <strong>${requestedAccountType.toLowerCase()}</strong> account. Our team is reviewing your application and will email you once it's approved — usually within one business day.</p>
      </div>
    `,
  });

  const adminNotifyEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (adminNotifyEmail) {
    await sendEmail({
      to: adminNotifyEmail,
      subject: "New Strata signup pending approval",
      text: `${name} (${email}) applied for a ${requestedAccountType} account. Review it in the admin dashboard under Pending Signups.`,
    });
  }

  return NextResponse.json({ ok: true, userId: user.id });
}
