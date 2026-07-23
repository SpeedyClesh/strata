import { PrismaClient, CardBrand, NotificationKind, SenderRole, SupportStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "demo1234";
const ADMIN_PASSWORD = "admin1234";

function fakeAccountNumber(seed: number): string {
  const base = (4000000000 + seed).toString();
  return base.padStart(10, "0").slice(0, 10);
}

function randomInRange(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60), 0, 0);
  return d;
}

function randomCardNumber(): { last4: string; numberFull: string } {
  const groups: string[] = [];
  for (let i = 0; i < 4; i++) {
    let g = "";
    for (let j = 0; j < 4; j++) g += Math.floor(Math.random() * 10).toString();
    groups.push(g);
  }
  const numberFull = groups.join(" ");
  return { last4: groups[3], numberFull };
}

function randomCvv() {
  return String(Math.floor(100 + Math.random() * 900));
}

type SeedTxn = {
  amount: number;
  description: string;
  direction: "in" | "out";
  daysAgo: number;
};

function buildTransactionsForUser(): SeedTxn[] {
  const txns: SeedTxn[] = [];
  txns.push({ amount: randomInRange(2200, 4200), description: "Salary - Acme Corp", direction: "in", daysAgo: 3 });
  txns.push({ amount: randomInRange(2200, 4200), description: "Salary - Acme Corp", direction: "in", daysAgo: 33 });
  txns.push({ amount: randomInRange(900, 1600), description: "Rent Payment", direction: "out", daysAgo: 5 });
  for (const d of [2, 6, 11, 17, 24]) {
    txns.push({ amount: randomInRange(28, 145), description: "Grocery Store", direction: "out", daysAgo: d });
  }
  for (const d of [1, 4, 8, 10, 14, 19, 23, 27]) {
    txns.push({ amount: randomInRange(3.25, 6.75), description: "Coffee Shop", direction: "out", daysAgo: d });
  }
  txns.push({ amount: randomInRange(35, 90), description: "Electric Bill", direction: "out", daysAgo: 9 });
  txns.push({ amount: randomInRange(12, 20), description: "Streaming Subscription", direction: "out", daysAgo: 15 });
  txns.push({ amount: randomInRange(18, 65), description: "Restaurant", direction: "out", daysAgo: 20 });
  txns.push({ amount: randomInRange(40, 130), description: "Online Shopping", direction: "out", daysAgo: 26 });
  return txns;
}

async function main() {
  console.log("Seeding Strata demo data...\n");

  // Clear existing simulation-scoped tables so re-seed is idempotent
  await prisma.supportMessage.deleteMany();
  await prisma.supportThread.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.card.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // Admin
  const adminHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const admin = await prisma.user.create({
    data: {
      email: "admin@demo.test",
      name: "Site Administrator",
      passwordHash: adminHash,
      role: "ADMIN",
    },
  });

  // Hidden system account
  const systemUser = await prisma.user.create({
    data: {
      email: "system@internal.strata.sim",
      passwordHash: await bcrypt.hash(crypto.randomUUID(), 10),
      name: "Strata Payment Network",
    },
  });
  const systemAccount = await prisma.account.create({
    data: {
      userId: systemUser.id,
      accountNumber: fakeAccountNumber(0),
      balance: 0,
      currency: "USD",
    },
  });

  const demoUsers = [
    { email: "alice@demo.test", name: "Alice Nguyen", balance: 12450.75, seed: 1 },
    { email: "bob@demo.test", name: "Bob Ramirez", balance: 3208.1, seed: 2 },
    { email: "carol@demo.test", name: "Carol Osei", balance: 47900.0, seed: 3 },
  ];

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  for (const demo of demoUsers) {
    const user = await prisma.user.create({
      data: {
        email: demo.email,
        passwordHash,
        name: demo.name,
        role: "USER",
      },
    });

    const account = await prisma.account.create({
      data: {
        userId: user.id,
        accountNumber: fakeAccountNumber(demo.seed),
        balance: demo.balance,
        currency: "USD",
      },
    });

    for (const t of buildTransactionsForUser()) {
      const createdAt = daysAgo(t.daysAgo);
      if (t.direction === "in") {
        await prisma.transaction.create({
          data: {
            fromAccountId: systemAccount.id,
            toAccountId: account.id,
            amount: t.amount,
            description: t.description,
            createdAt,
          },
        });
      } else {
        await prisma.transaction.create({
          data: {
            fromAccountId: account.id,
            toAccountId: null,
            amount: t.amount,
            description: t.description,
            createdAt,
          },
        });
      }
    }

    // Cards: give each user one active Visa; Alice also gets a frozen Mastercard
    const primary = randomCardNumber();
    await prisma.card.create({
      data: {
        accountId: account.id,
        brand: CardBrand.VISA,
        last4: primary.last4,
        numberFull: primary.numberFull,
        expMonth: 8 + (demo.seed % 4),
        expYear: new Date().getFullYear() + 3,
        cvv: randomCvv(),
        frozen: false,
      },
    });
    if (demo.seed === 1) {
      const secondary = randomCardNumber();
      await prisma.card.create({
        data: {
          accountId: account.id,
          brand: CardBrand.MASTERCARD,
          last4: secondary.last4,
          numberFull: secondary.numberFull,
          expMonth: 12,
          expYear: new Date().getFullYear() + 2,
          cvv: randomCvv(),
          frozen: true,
        },
      });
    }

    // Notifications
    await prisma.notification.createMany({
      data: [
        {
          userId: user.id,
          kind: NotificationKind.INFO,
          title: "Welcome to Strata",
          body: "Your simulated account is ready. Explore your dashboard, send a transfer, or issue a virtual card.",
          read: true,
          createdAt: daysAgo(14),
        },
        {
          userId: user.id,
          kind: NotificationKind.SECURITY,
          title: "New sign-in on Chrome (macOS)",
          body: "We detected a new sign-in from a device you haven't used before. If this wasn't you, contact support.",
          read: false,
          createdAt: daysAgo(2),
        },
        {
          userId: user.id,
          kind: NotificationKind.BALANCE,
          title: "Salary deposited",
          body: "Your recent salary deposit has posted to your account.",
          read: false,
          createdAt: daysAgo(3),
        },
      ],
    });

    // Support thread
    const thread = await prisma.supportThread.create({
      data: {
        userId: user.id,
        subject: demo.seed === 1 ? "Question about a recent transfer" : demo.seed === 2 ? "Help updating my address" : "Card declined at checkout",
        status: SupportStatus.OPEN,
      },
    });
    await prisma.supportMessage.create({
      data: {
        threadId: thread.id,
        senderRole: SenderRole.USER,
        body: demo.seed === 1
          ? "Hi, I sent a transfer yesterday and it hasn't shown up on my dashboard. Can you check?"
          : demo.seed === 2
            ? "I've moved and need to update the address on file for my account."
            : "My virtual card was declined at a store this morning. What's going on?",
        createdAt: daysAgo(1),
      },
    });

    console.log(`Seeded ${demo.name} — 20 transactions, cards, notifications, support thread`);
  }

  console.log("\nDemo login credentials:\n");
  for (const demo of demoUsers) {
    console.log(`  ${demo.email} / ${DEMO_PASSWORD}  (user, balance: $${demo.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })})`);
  }
  console.log(`  ${admin.email} / ${ADMIN_PASSWORD}  (admin)`);
  console.log("\nSeed complete.\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
