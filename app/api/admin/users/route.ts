import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { CardBrand, CardStatus } from "@prisma/client";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

function randomDigits(n: number) {
  let out = "";
  for (let i = 0; i < n; i++) out += Math.floor(Math.random() * 10).toString();
  return out;
}

function fakeAccountNumber() {
  // 11-digit account number, prefixed to look like the seeded ones
  return "9594" + randomDigits(7);
}

function randomCard() {
  const groups: string[] = [];
  for (let i = 0; i < 4; i++) groups.push(randomDigits(4));
  return { numberFull: groups.join(" "), last4: groups[3] };
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin only." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");
  const balance = Number(body?.balance ?? 0);
  const phone = body?.phone ? String(body.phone).trim() : null;
  const country = body?.country ? String(body.country).trim() : null;
  const city = body?.city ? String(body.city).trim() : null;
  const issueCard = Boolean(body?.issueCard);

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }
  if (!Number.isFinite(balance) || balance < 0) {
    return NextResponse.json({ error: "Invalid starting balance." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "A user with that email already exists." }, { status: 400 });

  const passwordHash = await bcrypt.hash(password, 10);

  // Ensure a unique account number
  let accountNumber = fakeAccountNumber();
  for (let i = 0; i < 5; i++) {
    const clash = await prisma.account.findUnique({ where: { accountNumber } });
    if (!clash) break;
    accountNumber = fakeAccountNumber();
  }

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      role: "USER",
      phone,
      country,
      city,
      accounts: {
        create: {
          accountNumber,
          balance,
          currency: "USD",
        },
      },
      notifications: {
        create: {
          kind: "INFO",
          title: "Welcome to Strata",
          body: "Your Strata account is ready. Sign in to explore your dashboard.",
        },
      },
    },
    include: { accounts: true },
  });

  // Seed crypto balances at zero so the dashboard doesn't break
  const account = user.accounts[0];
  await prisma.cryptoBalance.createMany({
    data: [
      { accountId: account.id, asset: "BTC", amount: 0, usdRate: 65000 },
      { accountId: account.id, asset: "ETH", amount: 0, usdRate: 1880 },
      { accountId: account.id, asset: "USDT", amount: 0, usdRate: 1 },
    ],
  });

  // Optionally issue a Visa card
  if (issueCard) {
    const card = randomCard();
    const now = new Date();
    await prisma.card.create({
      data: {
        accountId: account.id,
        brand: CardBrand.VISA,
        numberFull: card.numberFull,
        last4: card.last4,
        expMonth: now.getMonth() + 1,
        expYear: now.getFullYear() + 3,
        cvv: randomDigits(3),
        status: CardStatus.ACTIVE,
        balance: 0,
      },
    });
  }

  // If starting balance > 0, record it as a Deposit-style transaction
  if (balance > 0) {
    const systemAccount = await prisma.account.findFirst({
      where: { user: { email: "system@internal.strata.sim" } },
    });
    if (systemAccount) {
      await prisma.transaction.create({
        data: {
          fromAccountId: systemAccount.id,
          toAccountId: account.id,
          amount: balance,
          description: "Opening deposit",
        },
      });
    }
  }

  await sendEmail({
    to: email,
    subject: "Welcome to Strata",
    text: `Hi ${name},\n\nYour Strata account is ready.\n\nEmail: ${email}\nPassword: ${password}\nAccount number: ${accountNumber}\n\nSign in at your Strata dashboard to get started.\n\n— Strata\n`,
  });

  return NextResponse.json({ ok: true, userId: user.id, accountNumber });
}
