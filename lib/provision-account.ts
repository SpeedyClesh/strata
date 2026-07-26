import { CardBrand, CardStatus, AccountType } from "@prisma/client";

import { prisma } from "@/lib/prisma";

function randomDigits(n: number) {
  let out = "";
  for (let i = 0; i < n; i++) out += Math.floor(Math.random() * 10).toString();
  return out;
}

function fakeAccountNumber() {
  return "9594" + randomDigits(7);
}

function randomCard() {
  const groups: string[] = [];
  for (let i = 0; i < 4; i++) groups.push(randomDigits(4));
  return { numberFull: groups.join(" "), last4: groups[3] };
}

/**
 * Creates the bank Account (+ zeroed crypto balances + a starter Visa card)
 * for a user who didn't have one yet — used when an admin approves a
 * pending signup. Mirrors the provisioning logic in the admin "new
 * customer" flow so approved signups end up in an identical state.
 */
export async function provisionAccountForUser(userId: string, accountType: AccountType) {
  let accountNumber = fakeAccountNumber();
  for (let i = 0; i < 5; i++) {
    const clash = await prisma.account.findUnique({ where: { accountNumber } });
    if (!clash) break;
    accountNumber = fakeAccountNumber();
  }

  const account = await prisma.account.create({
    data: {
      userId,
      accountNumber,
      type: accountType,
      balance: 0,
      currency: "USD",
    },
  });

  await prisma.cryptoBalance.createMany({
    data: [
      { accountId: account.id, asset: "BTC", amount: 0, usdRate: 65000 },
      { accountId: account.id, asset: "ETH", amount: 0, usdRate: 1880 },
      { accountId: account.id, asset: "USDT", amount: 0, usdRate: 1 },
    ],
  });

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

  return account;
}
