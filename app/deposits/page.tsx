import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Landmark, Building2, CreditCard, Bitcoin } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSidebarUser, getUnreadNotificationCount } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { AuthedShell } from "@/components/authed/authed-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DepositForm } from "@/components/deposits/deposit-form";

export default async function DepositsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const sidebarUser = await getSidebarUser(session.user.id);
  const unread = await getUnreadNotificationCount(session.user.id);
  const deposits = await prisma.deposit.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <AuthedShell user={sidebarUser} unreadCount={unread}>
      <div className="mx-auto max-w-4xl">
        <h1 className="font-serif text-3xl font-semibold">Fund your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Choose a method to add money to your Strata account.</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Building2, label: "Bank Transfer", note: "1–2 business days" },
            { icon: Landmark, label: "Wire Transfer", note: "Same day" },
            { icon: CreditCard, label: "Debit Card", note: "Instant" },
            { icon: Bitcoin, label: "Crypto", note: "Network-dependent" },
          ].map((m) => (
            <div key={m.label} className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-strata-green-soft text-strata-green">
                <m.icon className="h-4 w-4" />
              </span>
              <p className="mt-3 text-sm font-semibold">{m.label}</p>
              <p className="text-xs text-muted-foreground">{m.note}</p>
            </div>
          ))}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Deposit funds</CardTitle>
            <CardDescription>Amount will be credited to your account balance.</CardDescription>
          </CardHeader>
          <CardContent>
            <DepositForm />
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent deposits</CardTitle>
          </CardHeader>
          <CardContent>
            {deposits.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No deposits yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {deposits.map((d) => (
                  <li key={d.id} className="flex items-center justify-between py-3 text-sm">
                    <div>
                      <p className="font-medium">{d.method}</p>
                      <p className="text-xs text-muted-foreground">
                        {d.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-strata-green">+{formatCurrency(Number(d.amount))}</p>
                      <p className="mt-1 text-[10px] font-semibold uppercase text-muted-foreground">{d.status}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthedShell>
  );
}
