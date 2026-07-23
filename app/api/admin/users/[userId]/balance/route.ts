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
  const amount = Number(body?.amount);
  const direction = String(body?.direction ?? "credit");
  const description = typeof body?.description === "string" && body.description.trim() ? body.description.trim() : direction === "credit" ? "Admin credit" : "Admin debit";

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Amount must be greater than zero." }, { status: 400 });
  }
  if (direction !== "credit" && direction !== "debit") {
    return NextResponse.json({ error: "Direction must be credit or debit." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: params.userId }, include: { accounts: true } });
  if (!user || user.accounts.length === 0) return NextResponse.json({ error: "User or account not found." }, { status: 404 });
  const account = user.accounts[0];

  const rounded = Math.round(amount * 100) / 100;
  if (direction === "debit" && rounded > Number(account.balance)) {
    return NextResponse.json({ error: "Debit exceeds available balance." }, { status: 400 });
  }

  const systemAccount = await prisma.account.findFirst({ where: { user: { email: "system@internal.strata.sim" } } });
  if (!systemAccount) return NextResponse.json({ error: "System account missing. Reseed required." }, { status: 500 });

  await prisma.$transaction(async (tx) => {
    if (direction === "credit") {
      await tx.account.update({ where: { id: account.id }, data: { balance: { increment: rounded } } });
      await tx.transaction.create({
        data: {
          fromAccountId: systemAccount.id,
          toAccountId: account.id,
          amount: rounded,
          description,
        },
      });
    } else {
      await tx.account.update({ where: { id: account.id }, data: { balance: { decrement: rounded } } });
      await tx.transaction.create({
        data: {
          fromAccountId: account.id,
          toAccountId: systemAccount.id,
          amount: rounded,
          description,
        },
      });
    }
    await tx.notification.create({
      data: {
        userId: user.id,
        kind: "BALANCE",
        title: direction === "credit" ? "Your balance was credited" : "Your balance was debited",
        body: `${description} — ${direction === "credit" ? "+" : "−"}${rounded.toFixed(2)} ${account.currency}`,
      },
    });
  });

  await sendEmail({
    to: user.email,
    subject: direction === "credit" ? "Strata: your balance was credited" : "Strata: your balance was debited",
    text: `Hi ${user.name},\n\nAn adjustment has been applied to your Strata account:\n\n${description}\n${direction === "credit" ? "+" : "−"}${rounded.toFixed(2)} ${account.currency}\n\n— Strata\n`,
  });

  return NextResponse.json({ ok: true });
}
