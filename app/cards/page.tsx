import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSidebarUser, getUnreadNotificationCount } from "@/lib/data";
import { AuthedShell } from "@/components/authed/authed-shell";
import { CardsManager, type CardView } from "@/components/cards/cards-manager";

export default async function CardsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const [sidebarUser, unread, account] = await Promise.all([
    getSidebarUser(session.user.id),
    getUnreadNotificationCount(session.user.id),
    prisma.account.findFirstOrThrow({ where: { userId: session.user.id } }),
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
    status: c.status,
    balance: Number(c.balance),
  }));

  return (
    <AuthedShell user={sidebarUser} unreadCount={unread}>
      <div className="mx-auto max-w-3xl">
        <h1 className="font-serif text-3xl font-semibold">Virtual cards</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Issue, freeze, and manage the virtual cards linked to your Strata account.
        </p>
        <div className="mt-8">
          <CardsManager cards={cardViews} holderName={sidebarUser.name} />
        </div>
      </div>
    </AuthedShell>
  );
}
