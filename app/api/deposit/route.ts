import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const amount = Number(body?.amount);
  const method = String(body?.method ?? "Bank Transfer");
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount." }, { status: 400 });
  }

  const account = await prisma.account.findFirst({ where: { userId: session.user.id } });
  if (!account) return NextResponse.json({ error: "Account not found." }, { status: 404 });

  const systemAccount = await prisma.account.findFirst({
    where: { user: { email: "system@internal.strata.sim" } },
  });
  if (!systemAccount) return NextResponse.json({ error: "System account missing." }, { status: 500 });

  const rounded = Math.round(amount * 100) / 100;

  await prisma.$transaction([
    prisma.account.update({
      where: { id: account.id },
      data: { balance: { increment: rounded } },
    }),
    prisma.transaction.create({
      data: {
        fromAccountId: systemAccount.id,
        toAccountId: account.id,
        amount: rounded,
        description: `Deposit — ${method}`,
      },
    }),
    prisma.deposit.create({
      data: {
        userId: session.user.id,
        amount: rounded,
        method,
        status: "PROCESSED",
      },
    }),
    prisma.notification.create({
      data: {
        userId: session.user.id,
        kind: "BALANCE",
        title: "Deposit received",
        body: `+$${rounded.toFixed(2)} via ${method}`,
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
