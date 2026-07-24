import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ArrowRight, Check, AlertOctagon, Shield } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, cn } from "@/lib/utils";
import { AdminHeader } from "@/components/admin/admin-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InboxActions } from "@/components/admin/inbox-actions";

export default async function AdminTransactionsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const openTickets = await prisma.supportThread.count({ where: { status: "OPEN" } });
  const txns = await prisma.transaction.findMany({
    where: { status: { in: ["PENDING", "UNDER_REVIEW"] } },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      fromAccount: { include: { user: true } },
      toAccount: { include: { user: true } },
    },
  });

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <AdminHeader userName={session.user.name ?? "Admin"} openTickets={openTickets} />
      <main className="container flex-1 py-10">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Transactions inbox</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Pending and under-review transactions across all accounts. Approve, block, or hold.
            </p>
          </div>
          <Link href="/admin/users" className="inline-flex items-center gap-1 text-sm text-strata-green hover:underline">
            All customers <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Awaiting review</CardTitle>
            <CardDescription>{txns.length} transactions.</CardDescription>
          </CardHeader>
          <CardContent>
            {txns.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nothing to review. All transactions are processed or rejected.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    <tr>
                      <th className="pb-2 text-left">Date</th>
                      <th className="pb-2 text-left">Customer</th>
                      <th className="pb-2 text-left">Description</th>
                      <th className="pb-2 text-left">Asset</th>
                      <th className="pb-2 text-right">Amount</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {txns.map((t) => {
                      const customer =
                        t.fromAccount.user.email !== "system@internal.strata.sim"
                          ? t.fromAccount.user
                          : t.toAccount?.user ?? t.fromAccount.user;
                      const direction = t.toAccountId && t.toAccount?.user.email !== "system@internal.strata.sim" ? "credit" : "debit";
                      return (
                        <tr key={t.id} className="border-t border-border">
                          <td className="py-3 text-muted-foreground">
                            {t.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </td>
                          <td className="py-3">
                            <Link href={`/admin/users/${customer.id}`} className="hover:underline">
                              {customer.name}
                            </Link>
                          </td>
                          <td className="py-3">{t.description}</td>
                          <td className="py-3 font-mono text-xs">{t.asset}</td>
                          <td className={cn("py-3 text-right font-medium", direction === "credit" ? "text-strata-green" : "text-foreground")}>
                            {direction === "credit" ? "+" : "−"}
                            {t.asset === "USD" ? formatCurrency(Number(t.amount)) : `${t.amount} ${t.asset}`}
                          </td>
                          <td className="py-3 text-center">
                            <span
                              className={cn(
                                "inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase",
                                t.status === "PENDING" ? "bg-strata-amber-soft text-strata-amber-deep" : "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300"
                              )}
                            >
                              {t.status === "UNDER_REVIEW" ? "Under Review" : "Pending"}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <InboxActions txnId={t.id} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5 text-strata-green" /> Approve</span>
          <span className="inline-flex items-center gap-1"><AlertOctagon className="h-3.5 w-3.5 text-destructive" /> Block</span>
          <span className="inline-flex items-center gap-1"><Shield className="h-3.5 w-3.5 text-strata-amber-deep" /> Suspend</span>
        </div>
      </main>
    </div>
  );
}
