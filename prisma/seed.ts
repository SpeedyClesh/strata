import {
  PrismaClient,
  CardBrand,
  CardStatus,
  NotificationKind,
  SenderRole,
  SupportStatus,
  CryptoAsset,
  LoanType,
  LoanStatus,
  DepositStatus,
  TxnStatus,
  AccountType,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "demo1234";
const DEMO_PIN = "123456";
const ADMIN_PASSWORD = "admin1234";

function fakeAccountNumber(seed: number): string {
  const base = (95940000000 + seed).toString();
  return base.slice(0, 11);
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
  return { numberFull: groups.join(" "), last4: groups[3] };
}

function randomCvv() {
  return String(Math.floor(100 + Math.random() * 900));
}

type SeedTxn = {
  amount: number;
  description: string;
  direction: "in" | "out";
  daysAgo: number;
  status?: TxnStatus;
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
  // one pending / one under review to demo the status pills
  txns.push({ amount: 400, description: "Wire Transfer", direction: "out", daysAgo: 1, status: "PENDING" });
  txns.push({ amount: 250, description: "Domestic Transfer", direction: "out", daysAgo: 2, status: "UNDER_REVIEW" });
  return txns;
}

async function main() {
  console.log("Seeding Strata demo data...\n");

  await prisma.supportMessage.deleteMany();
  await prisma.supportThread.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.card.deleteMany();
  await prisma.cryptoBalance.deleteMany();
  await prisma.deposit.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  const adminHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const pinHash = await bcrypt.hash(DEMO_PIN, 10);
  const admin = await prisma.user.create({
    data: {
      email: "admin@demo.test",
      name: "Site Administrator",
      passwordHash: adminHash,
      role: "ADMIN",
      pinHash,
    },
  });

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
    { email: "alice@demo.test", name: "Alice Nguyen", balance: 12450.75, seed: 1, phone: "+1 202 555 0142", country: "United States", city: "Charlottesville, VA", accountType: AccountType.SAVINGS },
    { email: "bob@demo.test", name: "Bob Ramirez", balance: 3208.10, seed: 2, phone: "+1 415 555 0187", country: "United States", city: "San Francisco, CA", accountType: AccountType.CHECKING },
    { email: "carol@demo.test", name: "Carol Osei", balance: 47900.00, seed: 3, phone: "+44 20 7946 0958", country: "United Kingdom", city: "London", accountType: AccountType.TRADITIONAL },
  ];

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  for (const demo of demoUsers) {
    const user = await prisma.user.create({
      data: {
        email: demo.email,
        passwordHash,
        pinHash,
        name: demo.name,
        role: "USER",
        phone: demo.phone,
        country: demo.country,
        city: demo.city,
        dob: new Date(1990, 5, 17),
      },
    });

    const account = await prisma.account.create({
      data: {
        userId: user.id,
        accountNumber: fakeAccountNumber(demo.seed),
        type: demo.accountType,
        balance: demo.balance,
        currency: "USD",
      },
    });

    // Transactions
    for (const t of buildTransactionsForUser()) {
      const createdAt = daysAgo(t.daysAgo);
      if (t.direction === "in") {
        await prisma.transaction.create({
          data: {
            fromAccountId: systemAccount.id,
            toAccountId: account.id,
            amount: t.amount,
            description: t.description,
            status: t.status ?? "PROCESSED",
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
            status: t.status ?? "PROCESSED",
            createdAt,
          },
        });
      }
    }

    // Cards
    const visa = randomCardNumber();
    await prisma.card.create({
      data: {
        accountId: account.id,
        brand: CardBrand.VISA,
        last4: visa.last4,
        numberFull: visa.numberFull,
        expMonth: 8 + (demo.seed % 4),
        expYear: new Date().getFullYear() + 3,
        cvv: randomCvv(),
        status: CardStatus.ACTIVE,
        balance: Math.round(demo.balance * 0.25 * 100) / 100,
      },
    });
    const mc = randomCardNumber();
    await prisma.card.create({
      data: {
        accountId: account.id,
        brand: CardBrand.MASTERCARD,
        last4: mc.last4,
        numberFull: mc.numberFull,
        expMonth: 12,
        expYear: new Date().getFullYear() + 2,
        cvv: randomCvv(),
        status: demo.seed === 1 ? CardStatus.FROZEN : CardStatus.ACTIVE,
        balance: Math.round(demo.balance * 0.15 * 100) / 100,
      },
    });
    const amex = randomCardNumber();
    await prisma.card.create({
      data: {
        accountId: account.id,
        brand: CardBrand.AMEX,
        last4: amex.last4,
        numberFull: amex.numberFull,
        expMonth: 6,
        expYear: new Date().getFullYear() + 4,
        cvv: randomCvv(),
        status: CardStatus.PENDING,
        balance: 0,
      },
    });

    // Crypto balances
    await prisma.cryptoBalance.create({
      data: { accountId: account.id, asset: CryptoAsset.BTC, amount: 0.355355, usdRate: 65000 },
    });
    await prisma.cryptoBalance.create({
      data: { accountId: account.id, asset: CryptoAsset.ETH, amount: 5.13164, usdRate: 1880 },
    });
    await prisma.cryptoBalance.create({
      data: { accountId: account.id, asset: CryptoAsset.USDT, amount: 3000, usdRate: 1 },
    });

    // Notifications
    await prisma.notification.createMany({
      data: [
        {
          userId: user.id,
          kind: NotificationKind.INFO,
          title: "Welcome to Strata",
          body: "Your Strata account is ready. Explore your dashboard, send a transfer, or issue a virtual card.",
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
        body:
          demo.seed === 1
            ? "Hi, I sent a transfer yesterday and it hasn't shown up on my dashboard. Can you check?"
            : demo.seed === 2
              ? "I've moved and need to update the address on file for my account."
              : "My virtual card was declined at a store this morning. What's going on?",
        createdAt: daysAgo(1),
      },
    });

    // Loans + Deposits (only for Alice)
    if (demo.seed === 1) {
      await prisma.loan.create({
        data: {
          userId: user.id,
          type: LoanType.PERSONAL,
          amount: 5000,
          termMonths: 12,
          purpose: "Home improvement",
          status: LoanStatus.ACTIVE,
          interestRate: 6.5,
        },
      });
      await prisma.deposit.createMany({
        data: [
          { userId: user.id, amount: 300, method: "Wire", status: DepositStatus.PROCESSED, createdAt: daysAgo(30) },
          { userId: user.id, amount: 100, method: "Bank Transfer", status: DepositStatus.PENDING, createdAt: daysAgo(4) },
        ],
      });
    }

    console.log(`Seeded ${demo.name} — 20 transactions, 3 cards, crypto balances, notifications, support`);
  }

  console.log("\nDemo login credentials:\n");
  for (const demo of demoUsers) {
    console.log(
      `  ${demo.email} / ${DEMO_PASSWORD}  (user, PIN ${DEMO_PIN}, balance: $${demo.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })})`
    );
  }
  console.log(`  ${admin.email} / ${ADMIN_PASSWORD}  (admin, PIN ${DEMO_PIN})`);
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
