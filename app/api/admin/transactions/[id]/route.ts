import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { TxnStatus, CryptoAsset } from "@prisma/client";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID_STATUS: TxnStatus[] = ["PROCESSED", "PENDING", "UNDER_REVIEW", "REJECTED"];

function isCryptoAsset(asset: string): asset is CryptoAsset {
  return asset === "BTC" || asset === "ETH" || asset === "USDT";
}

/**
 * PATCH /api/admin/transactions/[id]
 * Actions: update status (approve/hold/reject) with optional reason,
 * or edit description/amount/date/counterparty.
 *
 * Body: {
 *   status?, adminReason?,
 *   description?, amount?, counterpartyName?, createdAt?
 * }
 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin only." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body." }, { status: 400 });

  const txn = await prisma.transaction.findUnique({
    where: { id: params.id },
    include: { fromAccount: true, toAccount: true },
  });
  if (!txn) return NextResponse.json({ error: "Transaction not found." }, { status: 404 });

  const prevStatus = txn.status;
  const nextStatus: TxnStatus | undefined = body.status ? String(body.status).toUpperCase() as TxnStatus : undefined;
  if (nextStatus && !VALID_STATUS.includes(nextStatus)) {
    return NextResponse.json({ error: "invalid status." }, { status: 400 });
  }

  // Field updates
  const updateData: {
    description?: string;
    amount?: number;
    counterpartyName?: string | null;
    createdAt?: Date;
    status?: TxnStatus;
    adminReason?: string | null;
    reviewedAt?: Date | null;
    reviewedById?: string | null;
  } = {};

  if (typeof body.description === "string" && body.description.trim()) updateData.description = body.description.trim();
  if (body.counterpartyName !== undefined) updateData.counterpartyName = body.counterpartyName ? String(body.counterpartyName).trim() : null;
  if (body.createdAt) {
    const d = new Date(body.createdAt);
    if (!Number.isNaN(d.getTime())) updateData.createdAt = d;
  }
  if (body.amount !== undefined) {
    const n = Number(body.amount);
    if (!Number.isFinite(n) || n <= 0) return NextResponse.json({ error: "amount must be > 0." }, { status: 400 });
    updateData.amount = Math.round(n * 100) / 100;
  }

  if (nextStatus) {
    updateData.status = nextStatus;
    updateData.adminReason = body.adminReason ? String(body.adminReason).trim() : null;
    updateData.reviewedAt = new Date();
    updateData.reviewedById = session.user.id;
  }

  await prisma.$transaction(async (tx) => {
    // If transitioning to/from PROCESSED, adjust balances accordingly.
    const oldAmount = Number(txn.amount);
    // Compute direction relative to the customer account.
    // The customer account is the one whose user is not the system user.
    const [fromUser, toUser] = await Promise.all([
      prisma.user.findUnique({ where: { id: txn.fromAccount.userId } }),
      txn.toAccount ? prisma.user.findUnique({ where: { id: txn.toAccount.userId } }) : null,
    ]);
    const systemEmail = "system@internal.strata.sim";
    const customerAccount =
      fromUser?.email !== systemEmail ? txn.fromAccount :
      toUser?.email !== systemEmail && txn.toAccount ? txn.toAccount :
      txn.fromAccount;
    const direction: "credit" | "debit" = customerAccount.id === (txn.toAccountId ?? "") ? "credit" : "debit";

    const reverseIfWasProcessed = async () => {
      if (prevStatus !== "PROCESSED") return;
      if (txn.asset === "USD") {
        await tx.account.update({
          where: { id: customerAccount.id },
          data: { balance: direction === "credit" ? { decrement: oldAmount } : { increment: oldAmount } },
        });
      } else if (isCryptoAsset(txn.asset)) {
        await tx.cryptoBalance.upsert({
          where: { accountId_asset: { accountId: customerAccount.id, asset: txn.asset as CryptoAsset } },
          update: { amount: direction === "credit" ? { decrement: oldAmount } : { increment: oldAmount } },
          create: { accountId: customerAccount.id, asset: txn.asset as CryptoAsset, amount: direction === "credit" ? -oldAmount : oldAmount, usdRate: 0 },
        });
      }
    };

    const applyIfProcessed = async (finalAmount: number) => {
      if ((updateData.status ?? prevStatus) !== "PROCESSED") return;
      if (txn.asset === "USD") {
        await tx.account.update({
          where: { id: customerAccount.id },
          data: { balance: direction === "credit" ? { increment: finalAmount } : { decrement: finalAmount } },
        });
      } else if (isCryptoAsset(txn.asset)) {
        await tx.cryptoBalance.upsert({
          where: { accountId_asset: { accountId: customerAccount.id, asset: txn.asset as CryptoAsset } },
          update: { amount: direction === "credit" ? { increment: finalAmount } : { decrement: finalAmount } },
          create: { accountId: customerAccount.id, asset: txn.asset as CryptoAsset, amount: direction === "credit" ? finalAmount : -finalAmount, usdRate: 0 },
        });
      }
    };

    // Reverse any prior balance effect, apply the update, then re-apply if still PROCESSED.
    await reverseIfWasProcessed();

    const updated = await tx.transaction.update({
      where: { id: txn.id },
      data: updateData,
    });

    await applyIfProcessed(Number(updated.amount));

    // Notify the customer if status changed
    if (nextStatus && nextStatus !== prevStatus) {
      const customerUserId = customerAccount.userId;
      const title =
        nextStatus === "PROCESSED" ? "Your transaction was approved" :
        nextStatus === "REJECTED" ? "Your transaction was blocked" :
        nextStatus === "UNDER_REVIEW" ? "Your transaction is under review" :
        "Your transaction is pending";
      const body =
        `${updated.description}${updated.counterpartyName ? ` (${updated.counterpartyName})` : ""}` +
        (updateData.adminReason ? ` — reason: ${updateData.adminReason}` : "");
      await tx.notification.create({
        data: {
          userId: customerUserId,
          kind: nextStatus === "REJECTED" ? "SECURITY" : "BALANCE",
          title,
          body,
        },
      });
    }
  });

  return NextResponse.json({ ok: true });
}

/**
 * DELETE /api/admin/transactions/[id]
 * Removes a ledger entry. If it was PROCESSED, rolls back the balance.
 */
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin only." }, { status: 403 });
  }

  const txn = await prisma.transaction.findUnique({
    where: { id: params.id },
    include: { fromAccount: { include: { user: true } }, toAccount: { include: { user: true } } },
  });
  if (!txn) return NextResponse.json({ error: "Transaction not found." }, { status: 404 });

  const systemEmail = "system@internal.strata.sim";
  const customerAccount =
    txn.fromAccount.user.email !== systemEmail ? txn.fromAccount :
    txn.toAccount && txn.toAccount.user.email !== systemEmail ? txn.toAccount :
    txn.fromAccount;
  const direction: "credit" | "debit" = customerAccount.id === (txn.toAccountId ?? "") ? "credit" : "debit";
  const amount = Number(txn.amount);

  await prisma.$transaction(async (tx) => {
    if (txn.status === "PROCESSED") {
      if (txn.asset === "USD") {
        await tx.account.update({
          where: { id: customerAccount.id },
          data: { balance: direction === "credit" ? { decrement: amount } : { increment: amount } },
        });
      } else if (isCryptoAsset(txn.asset)) {
        await tx.cryptoBalance.upsert({
          where: { accountId_asset: { accountId: customerAccount.id, asset: txn.asset as CryptoAsset } },
          update: { amount: direction === "credit" ? { decrement: amount } : { increment: amount } },
          create: { accountId: customerAccount.id, asset: txn.asset as CryptoAsset, amount: direction === "credit" ? -amount : amount, usdRate: 0 },
        });
      }
    }
    await tx.transaction.delete({ where: { id: txn.id } });
  });

  return NextResponse.json({ ok: true });
}
