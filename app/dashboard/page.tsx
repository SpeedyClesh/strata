import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  ArrowDownLeft,
  ArrowUpRight,
  Bitcoin,
  Eye,
  Landmark,
  Plus,
} from "lucide-react";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getSidebarUser,
  getUnreadNotificationCount,
} from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { AuthedShell } from "@/components/authed/authed-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FrozenBanner } from "@/components/frozen-banner";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const sidebarUser = await getSidebarUser(session.user.id);
  const unread = await getUnreadNotificationCount(session.user.id);

  const account = await prisma.account.findFirstOrThrow({
    where: { userId: session.user.id },
    include: {
      cryptoBalances: { orderBy: { asset: "asc" } },
      cards: { orderBy: { createdAt: "asc" } },
    },
  });

  const recentTxns = await prisma.transaction.findMany({
    where: {
      OR: [{ fromAccountId: account.id }, { toAccountId: account.id }],
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  const balance = Number(account.balance);
  const currency = account.currency;
  const firstName = sidebarUser.name.split(" ")[0];

  return (
    <AuthedShell user={sidebarUser} unreadCount={unread}>
      <div className="mx-auto max-w-6xl">
        {account.status === "FROZEN" && <FrozenBanner reason={account.frozenReason ?? null} />}
        <header className="mb-8">
          <h1 className="font-serif text-3xl font-semibold sm:text-4xl">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s an overview of your account activity.
          </p>
        </header>

        {/* Big balance card + crypto tiles */}
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-strata-green to-strata-green-deep p-6 text-primary-foreground shadow-card">
            <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-primary-foreground/5" />
            <div className="absolute -bottom-6 -left-4 h-24 w-24 rounded-full bg-primary-foreground/5" />
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-primary-foreground/70">
                  Available Balance
                </p>
                <div className="mt-3 flex items-end gap-3">
                  <p className="font-serif text-5xl font-semibold leading-none">
                    {formatCurrency(balance, currency)}
                  </p>
                  <button className="mb-1 text-primary-foreground/60 hover:text-primary-foreground" aria-label="Toggle balance visibility">
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <Button asChild size="sm" className="gap-1 rounded-full bg-strata-amber text-strata-green-deep hover:bg-strata-amber-deep hover:text-primary-foreground">
                <Link href="/deposits">
                  <Plus className="h-3.5 w-3.5" /> Fund
                </Link>
              </Button>
            </div>
          </div>

          {account.cryptoBalances.map((c) => (
            <CryptoTile key={c.id} asset={c.asset} amount={Number(c.amount)} usdRate={Number(c.usdRate)} />
          ))}
        </div>

        {/* Send Money */}
        <SectionHeader label="Send Money" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <TransferCard
            href="/transfer/wire"
            title="Wire Transfer"
            subtitle="International bank transfer"
            icon={<Landmark className="h-4 w-4" />}
            tone="green"
          />
          <TransferCard
            href="/transfer/local"
            title="Local Transfer"
            subtitle="Domestic bank transfer"
            icon={<Landmark className="h-4 w-4" />}
            tone="green"
          />
          <TransferCard
            href="/transfer/paypal"
            title="PayPal"
            subtitle="Send via PayPal"
            icon={<LogoBadge text="PP" className="bg-[#003087] text-white" />}
            tone="brand"
          />
          <TransferCard
            href="/transfer/skrill"
            title="Skrill"
            subtitle="Send via Skrill"
            icon={<LogoBadge text="S" className="bg-[#862165] text-white" />}
            tone="brand"
          />
        </div>

        {/* Crypto Transfer */}
        <SectionHeader label="Crypto Transfer" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <CryptoSendCard href="/crypto/send/btc" title="Bitcoin" network="BTC Network" tone="orange" />
          <CryptoSendCard href="/crypto/send/eth" title="Ethereum" network="ETH Network" tone="slate" />
          <CryptoSendCard href="/crypto/send/usdt" title="Tether" network="USDT (TRC-20)" tone="teal" />
        </div>

        {/* More Options */}
        <SectionHeader label="More Options" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <TransferCard href="/transfer/google-pay" title="Google Pay" subtitle="Mobile payment" icon={<LogoBadge text="G" className="bg-white text-[#4285F4] border border-border" />} tone="brand" />
          <TransferCard href="/transfer/western-union" title="Western Union" subtitle="Cash pickup" icon={<LogoBadge text="WU" className="bg-black text-[#FFDD00]" />} tone="brand" />
          <TransferCard href="/transfer/wise" title="Wise" subtitle="Low-fee transfer" icon={<LogoBadge text="W" className="bg-[#9FE870] text-black" />} tone="brand" />
          <TransferCard href="/transfer/payoneer" title="Payoneer" subtitle="Business payments" icon={<LogoBadge text="P" className="bg-[#FF4800] text-white" />} tone="brand" />
        </div>

        {/* Your Cards */}
        <SectionHeader label="Your Cards" href="/cards" hrefLabel="View all" />
        <div className="flex flex-col gap-3">
          {account.cards.map((c) => (
            <CardRow
              key={c.id}
              brand={c.brand}
              last4={c.last4}
              status={c.status}
              balance={Number(c.balance)}
              currency={currency}
              holder={sidebarUser.name}
            />
          ))}
        </div>

        {/* Recent Transactions */}
        <SectionHeader label="Recent Transactions" href="/transactions" hrefLabel="View all" />
        <div className="flex flex-col gap-3">
          {recentTxns.map((t) => {
            const isIn = t.toAccountId === account.id;
            const amount = Number(t.amount);
            return (
              <div key={t.id} className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft">
                <div className="flex items-center gap-3">
                  <span
                    className={
                      "flex h-10 w-10 items-center justify-center rounded-xl " +
                      (isIn ? "bg-strata-green-soft text-strata-green" : "bg-secondary text-secondary-foreground")
                    }
                  >
                    {isIn ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          "rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide " +
                          (isIn ? "bg-strata-green-soft text-strata-green" : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300")
                        }
                      >
                        {isIn ? "Credit" : "Debit"}
                      </span>
                      <p className="text-sm font-semibold">{t.description}</p>
                    </div>
                    <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>
                        {t.createdAt.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
                      </span>
                      <span className="font-mono uppercase">#{t.id.slice(-12).toUpperCase()}</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={"text-sm font-semibold " + (isIn ? "text-strata-green" : "text-foreground")}>
                    {isIn ? "+" : "−"}
                    {formatCurrency(amount, currency)}
                  </p>
                  <StatusPill status={t.status} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AuthedShell>
  );
}

function SectionHeader({ label, href, hrefLabel }: { label: string; href?: string; hrefLabel?: string }) {
  return (
    <div className="mt-10 mb-4 flex items-center justify-between">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      {href && hrefLabel && (
        <Link href={href} className="inline-flex items-center gap-1 text-xs font-semibold text-strata-green hover:underline">
          {hrefLabel} <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}

function CryptoTile({ asset, amount, usdRate }: { asset: "BTC" | "ETH" | "USDT"; amount: number; usdRate: number }) {
  const usd = amount * usdRate;
  const badgeClass =
    asset === "BTC"
      ? "bg-[#F7931A]/15 text-[#F7931A]"
      : asset === "ETH"
        ? "bg-[#627EEA]/15 text-[#627EEA]"
        : "bg-[#26A17B]/15 text-[#26A17B]";
  return (
    <Card className="rounded-2xl border-border/60 bg-card p-5">
      <CardContent className="flex flex-col gap-3 p-0">
        <div className="flex items-center gap-2">
          <span className={"flex h-8 w-8 items-center justify-center rounded-lg " + badgeClass}>
            <Bitcoin className="h-4 w-4" />
          </span>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{asset}</p>
        </div>
        <p className="font-serif text-2xl font-semibold leading-none">{amount.toLocaleString("en-US", { maximumFractionDigits: 6 })}</p>
        <p className="text-xs text-muted-foreground">≈ {formatCurrency(usd)}</p>
      </CardContent>
    </Card>
  );
}

function TransferCard({
  href,
  title,
  subtitle,
  icon,
  tone,
}: {
  href: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  tone: "green" | "amber" | "brand";
}) {
  return (
    <Link href={href} className="group">
      <Card className="rounded-2xl border-border/60 p-5 transition-shadow hover:shadow-card">
        <CardContent className="flex flex-col gap-3 p-0">
          {tone === "brand" ? (
            <span className="flex">{icon}</span>
          ) : (
            <span
              className={
                "flex h-10 w-10 items-center justify-center rounded-xl " +
                (tone === "amber" ? "bg-strata-amber-soft text-strata-amber-deep" : "bg-strata-green-soft text-strata-green")
              }
            >
              {icon}
            </span>
          )}
          <div>
            <p className="text-sm font-semibold">{title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function LogoBadge({ text, className }: { text: string; className: string }) {
  return (
    <span className={"flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold " + className}>
      {text}
    </span>
  );
}

function CryptoSendCard({
  href,
  title,
  network,
  tone,
}: {
  href: string;
  title: string;
  network: string;
  tone: "orange" | "slate" | "teal";
}) {
  const toneClass =
    tone === "orange"
      ? "bg-[#F7931A]/15 text-[#F7931A]"
      : tone === "slate"
        ? "bg-[#627EEA]/15 text-[#627EEA]"
        : "bg-[#26A17B]/15 text-[#26A17B]";
  return (
    <Link href={href} className="group">
      <Card className="rounded-2xl border-border/60 p-5 transition-shadow hover:shadow-card">
        <CardContent className="flex items-center justify-between p-0">
          <div className="flex items-center gap-3">
            <span className={"flex h-10 w-10 items-center justify-center rounded-xl " + toneClass}>
              <Bitcoin className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold">{title}</p>
              <p className="text-xs text-muted-foreground">{network}</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </CardContent>
      </Card>
    </Link>
  );
}

function CardRow({
  brand,
  last4,
  status,
  balance,
  currency,
  holder,
}: {
  brand: "VISA" | "MASTERCARD" | "AMEX";
  last4: string;
  status: "ACTIVE" | "PENDING" | "FROZEN";
  balance: number;
  currency: string;
  holder: string;
}) {
  const brandStyle =
    brand === "MASTERCARD"
      ? "from-red-500 to-yellow-500"
      : brand === "AMEX"
        ? "from-slate-800 to-slate-600"
        : "from-strata-green to-strata-green-deep";

  const statusPill =
    status === "ACTIVE"
      ? "bg-strata-green-soft text-strata-green"
      : status === "PENDING"
        ? "bg-strata-amber-soft text-strata-amber-deep"
        : "bg-secondary text-secondary-foreground";

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="flex items-center gap-3">
        <div className={"h-12 w-16 rounded-lg bg-gradient-to-br shadow-inner " + brandStyle} />
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold">{prettyBrand(brand)}</p>
            <span className={"rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase " + statusPill}>{status}</span>
          </div>
          <p className="text-xs text-muted-foreground">{holder} · •••• {last4}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Balance</p>
        <p className="text-sm font-semibold">{formatCurrency(balance, currency)}</p>
      </div>
    </div>
  );
}

function prettyBrand(brand: string) {
  if (brand === "VISA") return "Visa Standard";
  if (brand === "MASTERCARD") return "Mastercard Standard";
  if (brand === "AMEX") return "American Express Platinum";
  return brand;
}

function StatusPill({ status }: { status: "PROCESSED" | "PENDING" | "UNDER_REVIEW" | "REJECTED" }) {
  const cls =
    status === "PROCESSED"
      ? "bg-strata-green-soft text-strata-green"
      : status === "PENDING"
        ? "bg-strata-amber-soft text-strata-amber-deep"
        : status === "REJECTED"
          ? "bg-destructive/15 text-destructive"
          : "bg-orange-100 text-orange-700";
  const label = status === "UNDER_REVIEW" ? "Under Review" : status.charAt(0) + status.slice(1).toLowerCase();
  return (
    <span className={"mt-1 inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase " + cls}>
      {label}
    </span>
  );
}
