import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { TxnStatus, CryptoAsset } from "@prisma/client";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID_STATUS: TxnStatus[] = ["PROCESSED", "PENDING", "UNDER_REVIEW", "REJECTED"];
const VALID_ASSETS = ["USD", "BTC", "ETH", "USDT"] as const;

function isCryptoAsset(asset: string): asset is CryptoAsset {
  return asset === "BTC" || asset === "ETH" || asset === "USDT";
}

async function getSystemAccountId(): Promise<string | null> {
  const sys = await prisma.account.findFirst({
    where: { user: { email: "system@internal.strata.sim" } },
  });
  return sys?.id ?? null;
}

/**
 * POST /api/admin/transactions
 * Create an arbitrary ledger entry for a user's account.
 * Body: {
 *   userId, direction: "credit"|"debit", amount, asset ("USD"|"BTC"|"ETH"|"USDT"),
 *   description, counterpartyName?, status?, createdAt? (ISO string)
 * }
 * Only status=PROCESSED applies to the balance. Others are recorded but do not
 * change balances until later approval.
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin only." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const userId = String(body?.userId ?? "");
  const direction = String(body?.direction ?? "credit");
  const amount = Number(body?.amount);
  const asset = String(body?.asset ?? "USD").toUpperCase();
  const description = String(body?.description ?? "").trim();
  const counterpartyName = body?.counterpartyName ? String(body.counterpartyName).trim() : null;
  const status = String(body?.status ?? "PROCESSED").toUpperCase() as TxnStatus;
  const createdAtRaw = body?.createdAt ? new Date(body.createdAt) : new Date();
  const createdAt = Number.isNaN(createdAtRaw.getTime()) ? new Date() : createdAtRaw;

  if (!userId) return NextResponse.json({ error: "userId is required." }, { status: 400 });
  if (!(direction === "credit" || direction === "debit")) return NextResponse.json({ error: "direction must be credit or debit." }, { status: 400 });
  if (!Number.isFinite(amount) || amount <= 0) return NextResponse.json({ error: "amount must be > 0." }, { status: 400 });
  if (!VALID_ASSETS.includes(asset as (typeof VALID_ASSETS)[number])) return NextResponse.json({ error: "invalid asset." }, { status: 400 });
  if (!description) return NextResponse.json({ error: "description is required." }, { status: 400 });
  if (!VALID_STATUS.includes(status)) return NextResponse.json({ error: "invalid status." }, { status: 400 });

  const account = await prisma.account.findFirst({ where: { userId } });
  if (!account) return NextResponse.json({ error: "Account not found." }, { status: 404 });

  const systemAccountId = await getSystemAccountId();
  if (!systemAccountId) return NextResponse.json({ error: "System account missing." }, { status: 500 });

  const rounded = Math.round(amount * 100) / 100;

  await prisma.$transaction(async (tx) => {
    // Record the ledger entry
    await tx.transaction.create({
      data: {
        fromAccountId: direction === "credit" ? systemAccountId : account.id,
        toAccountId: direction === "credit" ? account.id : systemAccountId,
        amount: rounded,
        description,
        counterpartyName,
        status,
        asset,
        createdAt,
        reviewedAt: status === "PROCESSED" ? new Date() : null,
        reviewedById: status === "PROCESSED" ? session.user.id : null,
      },
    });

    // Apply balance only when PROCESSED
    if (status === "PROCESSED") {
      if (asset === "USD") {
        await tx.account.update({
          where: { id: account.id },
          data: { balance: direction === "credit" ? { increment: rounded } : { decrement: rounded } },
        });
      } else if (isCryptoAsset(asset)) {
        await tx.cryptoBalance.upsert({
          where: { accountId_asset: { accountId: account.id, asset } },
          update: { amount: direction === "credit" ? { increment: rounded } : { decrement: rounded } },
          create: { accountId: account.id, asset, amount: direction === "credit" ? rounded : -rounded, usdRate: 0 },
        });
      }
    }

    // Notify the customer
    await tx.notification.create({
      data: {
        userId,
        kind: "BALANCE",
        title:
          status === "PROCESSED"
            ? direction === "credit"
              ? `You received ${rounded} ${asset}`
              : `${rounded} ${asset} was debited`
            : `Transaction ${status === "PENDING" ? "pending" : status.toLowerCase()}`,
        body:
          status === "PROCESSED"
            ? `${description}${counterpartyName ? ` (from ${counterpartyName})` : ""}`
            : `${description}${counterpartyName ? ` (${counterpartyName})` : ""} — status: ${status}`,
      },
    });
  });

  return NextResponse.json({ ok: true });
}
