import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function POST(request: Request, { params }: { params: { threadId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const text = typeof body?.body === "string" ? body.body.trim() : "";
  if (!text) return NextResponse.json({ error: "Message body required." }, { status: 400 });

  const thread = await prisma.supportThread.findUnique({
    where: { id: params.threadId },
    include: { user: true },
  });
  if (!thread) return NextResponse.json({ error: "Thread not found." }, { status: 404 });

  const isAdmin = session.user.role === "ADMIN";
  const isOwner = thread.userId === session.user.id;
  if (!isAdmin && !isOwner) return NextResponse.json({ error: "Not allowed." }, { status: 403 });

  await prisma.supportMessage.create({
    data: {
      threadId: thread.id,
      senderRole: isAdmin ? "ADMIN" : "USER",
      body: text,
    },
  });
  await prisma.supportThread.update({ where: { id: thread.id }, data: { updatedAt: new Date() } });

  if (isAdmin) {
    // Notify the customer of the admin reply, both in-app and via email.
    await prisma.notification.create({
      data: {
        userId: thread.userId,
        kind: "SUPPORT",
        title: `Support replied: ${thread.subject}`,
        body: text.slice(0, 240),
      },
    });
    await sendEmail({
      to: thread.user.email,
      subject: `Strata Support replied to "${thread.subject}"`,
      text: `Hi ${thread.user.name},\n\nSupport just replied to your ticket:\n\n${text}\n\nView the thread: /support/${thread.id}\n\n— Strata (simulated)\n`,
    });
  }

  return NextResponse.json({ ok: true });
}
