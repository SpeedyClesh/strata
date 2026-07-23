import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ArrowRight, LifeBuoy, ShieldCheck, Users, Wallet } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { AdminHeader } from "@/components/admin/admin-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function AdminOverviewPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const customerWhere = { role: "USER" as const, email: { not: "system@internal.strata.sim" } };
  const [userCount, totalBalanceRow, txnCount, openTickets, recentTxns] = await Promise.all([
    prisma.user.count({ where: customerWhere }),
    prisma.account.aggregate({
      _sum: { balance: true },
      where: { user: customerWhere },
    }),
    prisma.transaction.count(),
    prisma.supportThread.count({ where: { status: "OPEN" } }),
    prisma.transaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        fromAccount: { include: { user: true } },
        toAccount: { include: { user: true } },
      },
    }),
  ]);

  const totalBalance = Number(totalBalanceRow._sum.balance ?? 0);

  const stats = [
    { label: "Customers", value: userCount, icon: Users },
    { label: "Deposits under management", value: formatCurrency(totalBalance), icon: Wallet },
    { label: "Transactions to date", value: txnCount.toLocaleString(), icon: ShieldCheck },
    { label: "Open support tickets", value: openTickets, icon: LifeBuoy },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <AdminHeader userName={session.user.name ?? "Admin"} openTickets={openTickets} />
      <main className="container flex-1 py-10">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Overview</h1>
            <p className="mt-1 text-sm text-muted-foreground">Simulated bank operations at a glance.</p>
          </div>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/admin/users">
              Manage customers <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm text-muted-foreground">{s.label}</CardTitle>
                <s.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tracking-tight">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Latest transactions across all customer accounts.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {recentTxns.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p className="font-medium">{t.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.fromAccount.user.name} → {t.toAccount?.user.name ?? "External"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(Number(t.amount))}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.createdAt.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
