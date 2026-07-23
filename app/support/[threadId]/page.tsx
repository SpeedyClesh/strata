import Link from "next/link";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSidebarUser, getUnreadNotificationCount } from "@/lib/data";
import { AuthedShell } from "@/components/authed/authed-shell";
import { SupportThreadView, type SupportMessageView } from "@/components/support/support-thread-view";

export default async function SupportThreadPage({ params }: { params: { threadId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const [sidebarUser, unread, thread] = await Promise.all([
    getSidebarUser(session.user.id),
    getUnreadNotificationCount(session.user.id),
    prisma.supportThread.findUnique({
      where: { id: params.threadId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    }),
  ]);
  if (!thread || thread.userId !== session.user.id) notFound();

  const messages: SupportMessageView[] = thread.messages.map((m) => ({
    id: m.id,
    senderRole: m.senderRole,
    body: m.body,
    createdAt: m.createdAt,
  }));

  return (
    <AuthedShell user={sidebarUser} unreadCount={unread}>
      <div className="mx-auto max-w-3xl">
        <Link href="/support" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to support
        </Link>
        <SupportThreadView
          threadId={thread.id}
          subject={thread.subject}
          status={thread.status}
          messages={messages}
          viewerRole="USER"
        />
      </div>
    </AuthedShell>
  );
}
