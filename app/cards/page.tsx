import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAccountForUser, getUnreadNotificationCount } from "@/lib/data";
import { AppHeader } from "@/components/app-header";
import { CardsManager, type CardView } from "@/components/cards/cards-manager";

export default async function CardsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const [account, unreadCount] = await Promise.all([
    getAccountForUser(session.user.id),
    getUnreadNotificationCount(session.user.id),
  ]);

  const cards = await prisma.card.findMany({
    where: { accountId: account.id },
    orderBy: { createdAt: "asc" },
  });

  const cardViews: CardView[] = cards.map((c) => ({
    id: c.id,
    brand: c.brand,
    numberFull: c.numberFull,
    last4: c.last4,
    expMonth: c.expMonth,
    expYear: c.expYear,
    cvv: c.cvv,
    frozen: c.frozen,
  }));

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <AppHeader userName={session.user.name ?? session.user.email ?? "Account"} unreadCount={unreadCount} />

      <main className="container flex-1 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Virtual cards</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Issue, freeze, and manage simulated cards linked to your Strata account.
          </p>
        </div>
        <div className="mx-auto max-w-2xl">
          <CardsManager cards={cardViews} holderName={session.user.name ?? "Cardholder"} />
        </div>
      </main>
    </div>
  );
}
