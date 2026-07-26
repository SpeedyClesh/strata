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

  const body = await request.json().catch(() => ({}));
  const reason = typeof body?.reason === "string" ? body.reason.trim() : "";

  const user = await prisma.user.findUnique({ where: { id: params.userId } });
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });
  if (user.status !== "PENDING") {
    return NextResponse.json({ error: "This application has already been reviewed." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { status: "REJECTED" },
  });

  await sendEmail({
    to: user.email,
    subject: "Update on your Strata application",
    text: `Hi ${user.name},\n\nThanks for your interest in Strata. After review, we're unable to approve your application at this time.${
      reason ? `\n\nReason: ${reason}` : ""
    }\n\nIf you have questions, please contact support.\n\n— Strata`,
  });

  return NextResponse.json({ ok: true });
}
