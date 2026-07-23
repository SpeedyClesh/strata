import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Repeat } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSidebarUser, getUnreadNotificationCount } from "@/lib/data";
import { AuthedShell } from "@/components/authed/authed-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CryptoSwapForm } from "@/components/crypto/crypto-swap-form";

export default async function CryptoSwapPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const [sidebarUser, unread, account] = await Promise.all([
    getSidebarUser(session.user.id),
    getUnreadNotificationCount(session.user.id),
    prisma.account.findFirstOrThrow({
      where: { userId: session.user.id },
      include: { cryptoBalances: true },
    }),
  ]);

  const holdings = account.cryptoBalances.map((c) => ({
    asset: c.asset as "BTC" | "ETH" | "USDT",
    amount: Number(c.amount),
    usdRate: Number(c.usdRate),
  }));

  return (
    <AuthedShell user={sidebarUser} unreadCount={unread}>
      <div className="mx-auto max-w-lg">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-strata-amber-soft text-strata-amber-deep">
            <Repeat className="h-5 w-5" />
          </span>
          <div>
            <h1 className="font-serif text-3xl font-semibold">Crypto Swap</h1>
            <p className="text-sm text-muted-foreground">Convert between BTC, ETH, and USDT at current rates.</p>
          </div>
        </div>
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-base">Swap</CardTitle>
            <CardDescription>Rates update in real time and settle instantly.</CardDescription>
          </CardHeader>
          <CardContent>
            <CryptoSwapForm holdings={holdings} />
          </CardContent>
        </Card>
      </div>
    </AuthedShell>
  );
}
