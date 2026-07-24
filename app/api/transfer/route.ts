import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const recipientAccountNumber = typeof body?.recipientAccountNumber === "string" ? body.recipientAccountNumber.trim() : "";
  const description = typeof body?.description === "string" ? body.description.trim() : "";
  const amount = Number(body?.amount);

  if (!recipientAccountNumber) {
    return NextResponse.json({ error: "Recipient account number is required." }, { status: 400 });
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Amount must be greater than zero." }, { status: 400 });
  }

  const senderAccount = await prisma.account.findFirst({ where: { userId: session.user.id } });
  if (!senderAccount) {
    return NextResponse.json({ error: "Sender account not found." }, { status: 404 });
  }
  if (senderAccount.status === "FROZEN") {
    return NextResponse.json({
      error: `Your account is frozen${senderAccount.frozenReason ? `: ${senderAccount.frozenReason}` : ""}. Please contact support.`,
    }, { status: 403 });
  }

  const roundedAmount = Math.round(amount * 100) / 100;

  if (roundedAmount > Number(senderAccount.balance)) {
    return NextResponse.json({ error: "Amount exceeds your available balance." }, { status: 400 });
  }

  if (recipientAccountNumber === senderAccount.accountNumber) {
    return NextResponse.json({ error: "You cannot transfer to your own account." }, { status: 400 });
  }

  const recipientAccount = await prisma.account.findUnique({
    where: { accountNumber: recipientAccountNumber },
  });

  try {
    if (recipientAccount) {
      await prisma.$transaction([
        prisma.account.update({
          where: { id: senderAccount.id },
          data: { balance: { decrement: roundedAmount } },
        }),
        prisma.account.update({
          where: { id: recipientAccount.id },
          data: { balance: { increment: roundedAmount } },
        }),
        prisma.transaction.create({
          data: {
            fromAccountId: senderAccount.id,
            toAccountId: recipientAccount.id,
            amount: roundedAmount,
            description: description || "Transfer",
          },
        }),
      ]);

      return NextResponse.json({ ok: true, type: "internal" });
    }

    const externalDescription = description ? `External transfer — ${description}` : "External transfer";

    await prisma.$transaction([
      prisma.account.update({
        where: { id: senderAccount.id },
        data: { balance: { decrement: roundedAmount } },
      }),
      prisma.transaction.create({
        data: {
          fromAccountId: senderAccount.id,
          toAccountId: null,
          amount: roundedAmount,
          description: externalDescription,
        },
      }),
    ]);

    return NextResponse.json({ ok: true, type: "external" });
  } catch (error) {
    console.error("Transfer failed", error);
    return NextResponse.json({ error: "Transfer failed. Please try again." }, { status: 500 });
  }
}
