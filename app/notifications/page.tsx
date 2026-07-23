import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUnreadNotificationCount } from "@/lib/data";
import { AppHeader } from "@/components/app-header";
import { NotificationsList, type NotificationView } from "@/components/notifications/notifications-list";

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  const unreadCount = await getUnreadNotificationCount(session.user.id);

  const view: NotificationView[] = notifications.map((n) => ({
    id: n.id,
    kind: n.kind,
    title: n.title,
    body: n.body,
    read: n.read,
    createdAt: n.createdAt,
  }));

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <AppHeader userName={session.user.name ?? session.user.email ?? "Account"} unreadCount={unreadCount} />

      <main className="container flex-1 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">Alerts about your account activity and simulated security events.</p>
        </div>
        <div className="mx-auto max-w-2xl">
          <NotificationsList notifications={view} />
        </div>
      </main>
    </div>
  );
}
