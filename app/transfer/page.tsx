import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { getAccountForUser, getUnreadNotificationCount } from "@/lib/data";
import { maskAccountNumber } from "@/lib/utils";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TransferForm } from "@/components/transfer/transfer-form";

export default async function TransferPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  const account = await getAccountForUser(session.user.id);
  const unreadCount = await getUnreadNotificationCount(session.user.id);

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <AppHeader userName={session.user.name ?? session.user.email ?? "Account"} unreadCount={unreadCount} />

      <main className="container flex-1 py-10">
        <div className="mx-auto max-w-lg">
          <Card>
            <CardHeader>
              <CardTitle>New transfer</CardTitle>
              <CardDescription>
                Sending from {maskAccountNumber(account.accountNumber)}. This is simulated — no real money moves.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TransferForm currentBalance={Number(account.balance)} currency={account.currency} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
