import Link from "next/link";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, maskAccountNumber } from "@/lib/utils";
import { AdminHeader } from "@/components/admin/admin-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BalanceAdjustForm } from "@/components/admin/balance-adjust-form";
import { NotifyUserForm } from "@/components/admin/notify-user-form";

export default async function AdminUserDetailPage({ params }: { params: { userId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    include: {
      accounts: {
        include: {
          outgoingTransactions: { orderBy: { createdAt: "desc" }, take: 10 },
          incomingTransactions: { orderBy: { createdAt: "desc" }, take: 10 },
          cards: true,
        },
      },
      supportThreads: {
        orderBy: { updatedAt: "desc" },
        take: 5,
      },
    },
  });
  if (!user) notFound();
  const account = user.accounts[0];
  const openTickets = await prisma.supportThread.count({ where: { status: "OPEN" } });

  const activity = account
    ? [
        ...account.outgoingTransactions.map((t) => ({ ...t, direction: "out" as const })),
        ...account.incomingTransactions.map((t) => ({ ...t, direction: "in" as const })),
      ]
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 12)
    : [];

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <AdminHeader userName={session.user.name ?? "Admin"} openTickets={openTickets} />
      <main className="container flex-1 py-10">
        <Link href="/admin/users" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> All customers
        </Link>

        <div className="mb-8 flex flex-col gap-1">
          <h1 className="text-3xl font-semibold tracking-tight">{user.name}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Simulated primary account and recent activity.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {account ? (
                <>
                  <div className="flex items-baseline justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">Balance</p>
                      <p className="text-3xl font-semibold">{formatCurrency(Number(account.balance), account.currency)}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{maskAccountNumber(account.accountNumber)}</p>
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-medium">Recent activity</p>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activity.map((t) => (
                          <TableRow key={t.id}>
                            <TableCell>{t.description}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {t.createdAt.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                            </TableCell>
                            <TableCell className={"text-right font-medium " + (t.direction === "in" ? "text-accent" : "")}>
                              {t.direction === "in" ? "+" : "−"}
                              {formatCurrency(Number(t.amount), account.currency)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-medium">Cards ({account.cards.length})</p>
                    <div className="space-y-2 text-sm">
                      {account.cards.map((c) => (
                        <div key={c.id} className="flex items-center justify-between rounded-xl border border-border p-3">
                          <span>
                            {c.brand} •••• {c.last4} — exp {String(c.expMonth).padStart(2, "0")}/{String(c.expYear).slice(-2)}
                          </span>
                          <span className={c.status === "FROZEN" ? "text-amber-600" : c.status === "PENDING" ? "text-strata-amber-deep" : "text-muted-foreground"}>
                            {c.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No account on file.</p>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-col gap-6">
            {account && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Adjust balance</CardTitle>
                  <CardDescription>Credit or debit this account. Creates a Transaction row.</CardDescription>
                </CardHeader>
                <CardContent>
                  <BalanceAdjustForm userId={user.id} currency={account.currency} />
                </CardContent>
              </Card>
            )}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Send message</CardTitle>
                <CardDescription>Creates an in-app notification and optionally sends email.</CardDescription>
              </CardHeader>
              <CardContent>
                <NotifyUserForm userId={user.id} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Support threads</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {user.supportThreads.length === 0 && <p className="text-muted-foreground">No conversations.</p>}
                {user.supportThreads.map((t) => (
                  <Link
                    key={t.id}
                    href={`/admin/support/${t.id}`}
                    className="flex items-center justify-between rounded-xl border border-border p-3 hover:bg-secondary/60"
                  >
                    <span className="truncate">{t.subject}</span>
                    <span className={t.status === "OPEN" ? "text-amber-600" : "text-emerald-600"}>{t.status}</span>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
