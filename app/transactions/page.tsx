import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSidebarUser, getUnreadNotificationCount } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { AuthedShell } from "@/components/authed/authed-shell";

export default async function TransactionsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const [sidebarUser, unread, account] = await Promise.all([
    getSidebarUser(session.user.id),
    getUnreadNotificationCount(session.user.id),
    prisma.account.findFirstOrThrow({ where: { userId: session.user.id } }),
  ]);
  const txns = await prisma.transaction.findMany({
    where: { OR: [{ fromAccountId: account.id }, { toAccountId: account.id }] },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AuthedShell user={sidebarUser} unreadCount={unread}>
      <div className="mx-auto max-w-4xl">
        <h1 className="font-serif text-3xl font-semibold">Transactions</h1>
        <p className="mt-1 text-sm text-muted-foreground">All account activity in one place.</p>

        <div className="mt-8 flex flex-col gap-3">
          {txns.map((t) => {
            const isIn = t.toAccountId === account.id;
            const amount = Number(t.amount);
            const pill =
              t.status === "PROCESSED"
                ? "bg-strata-green-soft text-strata-green"
                : t.status === "PENDING"
                  ? "bg-strata-amber-soft text-strata-amber-deep"
                  : "bg-orange-100 text-orange-700";
            const label = t.status === "UNDER_REVIEW" ? "Under Review" : t.status.charAt(0) + t.status.slice(1).toLowerCase();
            return (
              <div key={t.id} className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft">
                <div className="flex items-center gap-3">
                  <span className={"flex h-10 w-10 items-center justify-center rounded-xl " + (isIn ? "bg-strata-green-soft text-strata-green" : "bg-secondary")}>
                    {isIn ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={"rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase " + (isIn ? "bg-strata-green-soft text-strata-green" : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300")}>
                        {isIn ? "Credit" : "Debit"}
                      </span>
                      <p className="text-sm font-semibold">{t.description}</p>
                    </div>
                    <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{t.createdAt.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}</span>
                      <span className="font-mono uppercase">#{t.id.slice(-12).toUpperCase()}</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={"text-sm font-semibold " + (isIn ? "text-strata-green" : "")}>
                    {isIn ? "+" : "−"}{formatCurrency(amount, account.currency)}
                  </p>
                  <span className={"mt-1 inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase " + pill}>{label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AuthedShell>
  );
}
