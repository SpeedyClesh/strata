import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { CryptoAsset } from "@prisma/client";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyPin } from "@/lib/pin";

const VALID: CryptoAsset[] = ["BTC", "ETH", "USDT"];

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const body = await request.json().catch(() => null);

  const pinCheck = await verifyPin(session.user.id, body?.pin);
  if (!pinCheck.ok) {
    return NextResponse.json({ error: pinCheck.error }, { status: pinCheck.status });
  }

  const from = String(body?.from ?? "").toUpperCase() as CryptoAsset;
  const to = String(body?.to ?? "").toUpperCase() as CryptoAsset;
  const amount = Number(body?.amount);

  if (!VALID.includes(from) || !VALID.includes(to)) return NextResponse.json({ error: "Invalid asset." }, { status: 400 });
  if (from === to) return NextResponse.json({ error: "Choose different assets." }, { status: 400 });
  if (!Number.isFinite(amount) || amount <= 0) return NextResponse.json({ error: "Invalid amount." }, { status: 400 });

  const account = await prisma.account.findFirst({ where: { userId: session.user.id } });
  if (!account) return NextResponse.json({ error: "Account not found." }, { status: 404 });

  const fromHolding = await prisma.cryptoBalance.findUnique({ where: { accountId_asset: { accountId: account.id, asset: from } } });
  const toHolding = await prisma.cryptoBalance.findUnique({ where: { accountId_asset: { accountId: account.id, asset: to } } });
  if (!fromHolding || !toHolding) return NextResponse.json({ error: "Missing balance." }, { status: 400 });
  if (Number(fromHolding.amount) < amount) return NextResponse.json({ error: "Insufficient balance." }, { status: 400 });

  const rate = Number(toHolding.usdRate) > 0 ? Number(fromHolding.usdRate) / Number(toHolding.usdRate) : 0;
  const receive = amount * rate;

  await prisma.$transaction([
    prisma.cryptoBalance.update({
      where: { id: fromHolding.id },
      data: { amount: { decrement: amount } },
    }),
    prisma.cryptoBalance.update({
      where: { id: toHolding.id },
      data: { amount: { increment: receive } },
    }),
    prisma.notification.create({
      data: {
        userId: session.user.id,
        kind: "BALANCE",
        title: `Swapped ${amount} ${from} → ${receive.toFixed(6)} ${to}`,
        body: `At rate 1 ${from} = ${rate.toFixed(4)} ${to}.`,
      },
    }),
  ]);

  return NextResponse.json({ ok: true, receive });
}
