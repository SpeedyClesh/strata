import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { Bitcoin } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSidebarUser, getUnreadNotificationCount } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { AuthedShell } from "@/components/authed/authed-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CryptoSendForm } from "@/components/crypto/crypto-send-form";

const META: Record<string, { asset: "BTC" | "ETH" | "USDT"; name: string; network: string; tone: string }> = {
  btc: { asset: "BTC", name: "Bitcoin", network: "BTC Network", tone: "bg-[#F7931A]/15 text-[#F7931A]" },
  eth: { asset: "ETH", name: "Ethereum", network: "ETH Network", tone: "bg-[#627EEA]/15 text-[#627EEA]" },
  usdt: { asset: "USDT", name: "Tether", network: "USDT (TRC-20)", tone: "bg-[#26A17B]/15 text-[#26A17B]" },
};

export default async function CryptoSendPage({ params }: { params: { asset: string } }) {
  const meta = META[params.asset];
  if (!meta) notFound();

  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const [sidebarUser, unread, account] = await Promise.all([
    getSidebarUser(session.user.id),
    getUnreadNotificationCount(session.user.id),
    prisma.account.findFirstOrThrow({ where: { userId: session.user.id }, include: { cryptoBalances: true } }),
  ]);

  const holding = account.cryptoBalances.find((c) => c.asset === meta.asset);
  const amount = holding ? Number(holding.amount) : 0;
  const usdRate = holding ? Number(holding.usdRate) : 0;

  return (
    <AuthedShell user={sidebarUser} unreadCount={unread}>
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-3">
          <span className={"flex h-12 w-12 items-center justify-center rounded-xl " + meta.tone}>
            <Bitcoin className="h-5 w-5" />
          </span>
          <div>
            <h1 className="font-serif text-3xl font-semibold">Send {meta.name}</h1>
            <p className="text-sm text-muted-foreground">{meta.network}</p>
          </div>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-base">Your balance</CardTitle>
            <CardDescription>
              {amount.toLocaleString("en-US", { maximumFractionDigits: 6 })} {meta.asset} · ≈ {formatCurrency(amount * usdRate)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CryptoSendForm asset={meta.asset} balance={amount} />
          </CardContent>
        </Card>
      </div>
    </AuthedShell>
  );
}
