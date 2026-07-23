import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Download } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSidebarUser, getUnreadNotificationCount } from "@/lib/data";
import { formatCurrency, maskAccountNumber } from "@/lib/utils";
import { AuthedShell } from "@/components/authed/authed-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function AccountStatementPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const [sidebarUser, unread, account] = await Promise.all([
    getSidebarUser(session.user.id),
    getUnreadNotificationCount(session.user.id),
    prisma.account.findFirstOrThrow({ where: { userId: session.user.id }, include: { user: true } }),
  ]);
  const txns = await prisma.transaction.findMany({
    where: { OR: [{ fromAccountId: account.id }, { toAccountId: account.id }] },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AuthedShell user={sidebarUser} unreadCount={unread}>
      <div className="mx-auto max-w-4xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-semibold">Account Statement</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              A complete record of your account activity.
            </p>
          </div>
          <Button variant="outline" className="gap-2" disabled>
            <Download className="h-4 w-4" /> Download PDF
          </Button>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-base">Statement summary</CardTitle>
            <CardDescription>
              {account.user.name} · {maskAccountNumber(account.accountNumber)}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Opening balance</p>
              <p className="mt-1 font-serif text-2xl font-semibold">{formatCurrency(0, account.currency)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Current balance</p>
              <p className="mt-1 font-serif text-2xl font-semibold">{formatCurrency(Number(account.balance), account.currency)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Transactions</p>
              <p className="mt-1 font-serif text-2xl font-semibold">{txns.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">All transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  <tr>
                    <th className="pb-2 text-left">Date</th>
                    <th className="pb-2 text-left">Description</th>
                    <th className="pb-2 text-left">Reference</th>
                    <th className="pb-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {txns.map((t) => {
                    const isIn = t.toAccountId === account.id;
                    return (
                      <tr key={t.id} className="border-t border-border">
                        <td className="py-3 text-muted-foreground">
                          {t.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td className="py-3 font-medium">{t.description}</td>
                        <td className="py-3 font-mono text-xs uppercase text-muted-foreground">#{t.id.slice(-12).toUpperCase()}</td>
                        <td className={"py-3 text-right font-medium " + (isIn ? "text-strata-green" : "")}>
                          {isIn ? "+" : "−"}{formatCurrency(Number(t.amount), account.currency)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthedShell>
  );
}
