import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/admin/users/[userId]/freeze
 * Body: { action: "freeze" | "unfreeze", reason?: string }
 */
export async function POST(request: Request, { params }: { params: { userId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin only." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const action = String(body?.action ?? "").toLowerCase();
  const reason = body?.reason ? String(body.reason).trim() : null;
  if (action !== "freeze" && action !== "unfreeze") {
    return NextResponse.json({ error: "action must be freeze or unfreeze." }, { status: 400 });
  }
  if (action === "freeze" && !reason) {
    return NextResponse.json({ error: "reason is required to freeze." }, { status: 400 });
  }

  const account = await prisma.account.findFirst({ where: { userId: params.userId } });
  if (!account) return NextResponse.json({ error: "Account not found." }, { status: 404 });

  await prisma.$transaction([
    prisma.account.update({
      where: { id: account.id },
      data: {
        status: action === "freeze" ? "FROZEN" : "ACTIVE",
        frozenReason: action === "freeze" ? reason : null,
        frozenAt: action === "freeze" ? new Date() : null,
      },
    }),
    prisma.notification.create({
      data: {
        userId: params.userId,
        kind: "SECURITY",
        title: action === "freeze" ? "Your account has been frozen" : "Your account has been reactivated",
        body:
          action === "freeze"
            ? `Reason: ${reason}. Please contact support if you have questions.`
            : "You can now send transfers and use your cards again.",
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
