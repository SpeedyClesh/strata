import { prisma } from "@/lib/prisma";
import type { SidebarUser } from "@/components/authed/sidebar";
import { formatAccountType } from "@/lib/utils";

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  return prisma.notification.count({ where: { userId, read: false } });
}

export async function getSidebarUser(userId: string): Promise<SidebarUser> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: { accounts: true },
  });
  const account = user.accounts[0];
  return {
    name: user.name,
    email: user.email,
    accountNumber: account?.accountNumber ?? "—",
    balance: account ? Number(account.balance) : 0,
    currency: account?.currency ?? "USD",
    accountType: formatAccountType(account?.type ?? "SAVINGS"),
    avatarUrl: user.avatarUrl,
  };
}

export type TransactionDirection = "in" | "out";

export type TransactionView = {
  id: string;
  amount: number;
  description: string;
  createdAt: Date;
  direction: TransactionDirection;
  counterpartyLabel: string;
};

export async function getAccountForUser(userId: string) {
  return prisma.account.findFirstOrThrow({
    where: { userId },
  });
}

function toDirection(accountId: string, tx: { fromAccountId: string; toAccountId: string | null }): TransactionDirection {
  return tx.toAccountId === accountId ? "in" : "out";
}

export async function getRecentTransactions(accountId: string, limit = 10): Promise<TransactionView[]> {
  const transactions = await prisma.transaction.findMany({
    where: {
      OR: [{ fromAccountId: accountId }, { toAccountId: accountId }],
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return transactions.map((tx) => ({
    id: tx.id,
    amount: Number(tx.amount),
    description: tx.description,
    createdAt: tx.createdAt,
    direction: toDirection(accountId, tx),
    counterpartyLabel: toDirection(accountId, tx) === "in" ? "Received" : "Sent",
  }));
}

export type BalancePoint = {
  date: string;
  balance: number;
};

export async function getBalanceHistory(accountId: string, currentBalance: number, days = 30): Promise<BalancePoint[]> {
  const transactions = await prisma.transaction.findMany({
    where: {
      OR: [{ fromAccountId: accountId }, { toAccountId: accountId }],
    },
    orderBy: { createdAt: "asc" },
  });

  const signed = transactions.map((tx) => ({
    createdAt: tx.createdAt,
    delta: tx.toAccountId === accountId ? Number(tx.amount) : -Number(tx.amount),
  }));

  const totalDelta = signed.reduce((sum, t) => sum + t.delta, 0);
  const startingBalance = currentBalance - totalDelta;

  let running = startingBalance;
  const balanceAfterByTime = signed.map((t) => {
    running += t.delta;
    return { createdAt: t.createdAt, balanceAfter: running };
  });

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const points: BalancePoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const dayEnd = new Date(today);
    dayEnd.setDate(today.getDate() - i);

    let balance = startingBalance;
    for (const entry of balanceAfterByTime) {
      if (entry.createdAt <= dayEnd) {
        balance = entry.balanceAfter;
      } else {
        break;
      }
    }

    points.push({
      date: dayEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      balance: Math.round(balance * 100) / 100,
    });
  }

  return points;
}
