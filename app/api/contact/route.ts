import { NextResponse } from "next/server";

import { sendEmail } from "@/lib/email";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  const email = String(body?.email ?? "").trim();
  const subject = String(body?.subject ?? "").trim();
  const message = String(body?.message ?? "").trim();

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }

  // Simple sanity check on email format
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
  }

  const inboxAddress = process.env.CONTACT_INBOX ?? "hello@strata.bank";

  // Notify the team
  await sendEmail({
    to: inboxAddress,
    subject: `[Contact] ${subject}`,
    text: `From: ${name} <${email}>\n\nSubject: ${subject}\n\n${message}\n`,
  });

  // Send an acknowledgement to the sender
  await sendEmail({
    to: email,
    subject: `We got your message — Strata`,
    text: `Hi ${name},\n\nThanks for reaching out. A member of the Strata team will get back to you within one business day.\n\nFor reference, your message:\n\n"${message}"\n\n— Strata\n`,
  });

  return NextResponse.json({ ok: true });
}
