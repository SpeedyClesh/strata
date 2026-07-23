import Link from "next/link";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUnreadNotificationCount } from "@/lib/data";
import { AppHeader } from "@/components/app-header";
import { SupportThreadView, type SupportMessageView } from "@/components/support/support-thread-view";

export default async function SupportThreadPage({ params }: { params: { threadId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const thread = await prisma.supportThread.findUnique({
    where: { id: params.threadId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!thread || thread.userId !== session.user.id) notFound();

  const unreadCount = await getUnreadNotificationCount(session.user.id);

  const messages: SupportMessageView[] = thread.messages.map((m) => ({
    id: m.id,
    senderRole: m.senderRole,
    body: m.body,
    createdAt: m.createdAt,
  }));

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <AppHeader userName={session.user.name ?? session.user.email ?? "Account"} unreadCount={unreadCount} />

      <main className="container flex-1 py-10">
        <Link href="/support" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to support
        </Link>
        <div className="mx-auto max-w-2xl">
          <SupportThreadView
            threadId={thread.id}
            subject={thread.subject}
            status={thread.status}
            messages={messages}
            viewerRole="USER"
          />
        </div>
      </main>
    </div>
  );
}
