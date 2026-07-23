import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { getAccountForUser, getBalanceHistory, getRecentTransactions, getUnreadNotificationCount } from "@/lib/data";
import { formatCurrency, maskAccountNumber } from "@/lib/utils";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BalanceChart } from "@/components/dashboard/balance-chart";
import { TransactionsTable } from "@/components/dashboard/transactions-table";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  const account = await getAccountForUser(session.user.id);
  const currentBalance = Number(account.balance);

  const [transactions, balanceHistory, unreadCount] = await Promise.all([
    getRecentTransactions(account.id, 10),
    getBalanceHistory(account.id, currentBalance, 30),
    getUnreadNotificationCount(session.user.id),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <AppHeader userName={session.user.name ?? session.user.email ?? "Account"} unreadCount={unreadCount} />

      <main className="container flex-1 py-10">
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Account {maskAccountNumber(account.accountNumber)}</p>
            <p className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
              {formatCurrency(currentBalance, account.currency)}
            </p>
          </div>
          <Button asChild size="lg" className="gap-2">
            <Link href="/transfer">
              New Transfer <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Balance — last 30 days</CardTitle>
              <CardDescription>Derived from your simulated transaction history.</CardDescription>
            </CardHeader>
            <CardContent>
              <BalanceChart data={balanceHistory} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account summary</CardTitle>
              <CardDescription>Simulated account details.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account holder</span>
                <span className="font-medium">{session.user.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account number</span>
                <span className="font-mono font-medium">{maskAccountNumber(account.accountNumber)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Currency</span>
                <span className="font-medium">{account.currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium text-accent">Simulated · Active</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent transactions</CardTitle>
            <CardDescription>Your last {transactions.length} simulated transactions.</CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionsTable transactions={transactions} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
