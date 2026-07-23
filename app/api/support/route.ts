import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const subject = typeof body?.subject === "string" ? body.subject.trim() : "";
  const msgBody = typeof body?.body === "string" ? body.body.trim() : "";
  if (!subject || !msgBody) {
    return NextResponse.json({ error: "Subject and message are required." }, { status: 400 });
  }

  const thread = await prisma.supportThread.create({
    data: {
      userId: session.user.id,
      subject,
      messages: {
        create: [{ senderRole: "USER", body: msgBody }],
      },
    },
  });

  return NextResponse.json({ ok: true, threadId: thread.id });
}
