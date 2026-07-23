import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function POST(request: Request, { params }: { params: { userId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin only." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const text = typeof body?.body === "string" ? body.body.trim() : "";
  const wantsEmail = Boolean(body?.sendEmail);
  if (!title || !text) return NextResponse.json({ error: "Title and body are required." }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: params.userId } });
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

  await prisma.notification.create({
    data: {
      userId: user.id,
      kind: "INFO",
      title,
      body: text,
    },
  });

  let emailVia: "resend" | "console" | "skipped" = "skipped";
  if (wantsEmail) {
    const { via } = await sendEmail({
      to: user.email,
      subject: `Strata: ${title}`,
      text: `Hi ${user.name},\n\n${text}\n\n— Strata (simulated)\n`,
    });
    emailVia = via;
  }

  return NextResponse.json({ ok: true, emailVia });
}
