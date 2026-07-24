import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { CryptoAsset } from "@prisma/client";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const asset = String(body?.asset ?? "").toUpperCase() as CryptoAsset;
  const address = String(body?.address ?? "").trim();
  const amount = Number(body?.amount);
  if (!["BTC", "ETH", "USDT"].includes(asset)) return NextResponse.json({ error: "Invalid asset." }, { status: 400 });
  if (!address) return NextResponse.json({ error: "Recipient address required." }, { status: 400 });
  if (!Number.isFinite(amount) || amount <= 0) return NextResponse.json({ error: "Invalid amount." }, { status: 400 });

  const account = await prisma.account.findFirst({ where: { userId: session.user.id } });
  if (!account) return NextResponse.json({ error: "Account not found." }, { status: 404 });
  if (account.status === "FROZEN") {
    return NextResponse.json({
      error: `Your account is frozen${account.frozenReason ? `: ${account.frozenReason}` : ""}. Please contact support.`,
    }, { status: 403 });
  }
  const holding = await prisma.cryptoBalance.findUnique({ where: { accountId_asset: { accountId: account.id, asset } } });
  if (!holding || Number(holding.amount) < amount) {
    return NextResponse.json({ error: "Insufficient balance." }, { status: 400 });
  }

  await prisma.cryptoBalance.update({
    where: { id: holding.id },
    data: { amount: { decrement: amount } },
  });

  await prisma.notification.create({
    data: {
      userId: session.user.id,
      kind: "BALANCE",
      title: `${asset} transfer sent`,
      body: `${amount} ${asset} sent to ${address.slice(0, 10)}…`,
    },
  });

  return NextResponse.json({ ok: true });
}
