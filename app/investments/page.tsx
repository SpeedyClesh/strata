import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { LineChart, TrendingUp, PiggyBank, Building2 } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { getSidebarUser, getUnreadNotificationCount } from "@/lib/data";
import { AuthedShell } from "@/components/authed/authed-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PRODUCTS = [
  { icon: TrendingUp, title: "High-Yield Savings", rate: "4.85% APY", body: "A tax-advantaged savings account with no lock-in." },
  { icon: PiggyBank, title: "Money Market Fund", rate: "5.15% APY", body: "Diversified low-risk fund with weekly liquidity." },
  { icon: Building2, title: "Corporate Bonds", rate: "6.20% APY", body: "Fixed income from investment-grade issuers." },
  { icon: LineChart, title: "Managed Portfolio", rate: "8.4% target", body: "Actively managed by our investment team." },
];

export default async function InvestmentsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const [sidebarUser, unread] = await Promise.all([
    getSidebarUser(session.user.id),
    getUnreadNotificationCount(session.user.id),
  ]);

  return (
    <AuthedShell user={sidebarUser} unreadCount={unread}>
      <div className="mx-auto max-w-4xl">
        <h1 className="font-serif text-3xl font-semibold">Investments</h1>
        <p className="mt-1 text-sm text-muted-foreground">Grow your money with Strata investment products.</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {PRODUCTS.map((p) => (
            <Card key={p.title}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-strata-green-soft text-strata-green">
                      <p.icon className="h-4 w-4" />
                    </span>
                    <div>
                      <CardTitle className="text-base">{p.title}</CardTitle>
                      <p className="text-xs text-strata-amber-deep">{p.rate}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">Invest</Button>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{p.body}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AuthedShell>
  );
}
