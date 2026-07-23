import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { CardBrand } from "@prisma/client";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function randomDigits(n: number) {
  let out = "";
  for (let i = 0; i < n; i++) out += Math.floor(Math.random() * 10).toString();
  return out;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const requestedBrand = String(body?.brand ?? "VISA").toUpperCase();
  const brand: CardBrand = requestedBrand === "MASTERCARD" ? CardBrand.MASTERCARD : CardBrand.VISA;

  const account = await prisma.account.findFirst({ where: { userId: session.user.id } });
  if (!account) return NextResponse.json({ error: "Account not found." }, { status: 404 });

  const numberFull = `${randomDigits(4)} ${randomDigits(4)} ${randomDigits(4)} ${randomDigits(4)}`;
  const last4 = numberFull.slice(-4);
  const now = new Date();

  const card = await prisma.card.create({
    data: {
      accountId: account.id,
      brand,
      numberFull,
      last4,
      expMonth: now.getMonth() + 1,
      expYear: now.getFullYear() + 3,
      cvv: randomDigits(3),
      frozen: false,
    },
  });

  return NextResponse.json({ ok: true, cardId: card.id });
}
