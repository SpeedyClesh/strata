import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSidebarUser, getUnreadNotificationCount } from "@/lib/data";
import { AuthedShell } from "@/components/authed/authed-shell";
import { NotificationsList, type NotificationView } from "@/components/notifications/notifications-list";

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const [sidebarUser, unread, notifications] = await Promise.all([
    getSidebarUser(session.user.id),
    getUnreadNotificationCount(session.user.id),
    prisma.notification.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" } }),
  ]);

  const view: NotificationView[] = notifications.map((n) => ({
    id: n.id,
    kind: n.kind,
    title: n.title,
    body: n.body,
    read: n.read,
    createdAt: n.createdAt,
  }));

  return (
    <AuthedShell user={sidebarUser} unreadCount={unread}>
      <div className="mx-auto max-w-3xl">
        <h1 className="font-serif text-3xl font-semibold">Notifications</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Alerts about your account activity and security events.
        </p>
        <div className="mt-8">
          <NotificationsList notifications={view} />
        </div>
      </div>
    </AuthedShell>
  );
}
