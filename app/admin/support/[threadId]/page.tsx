import Link from "next/link";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/admin-header";
import { SupportThreadView, type SupportMessageView } from "@/components/support/support-thread-view";

export default async function AdminSupportThreadPage({ params }: { params: { threadId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const thread = await prisma.supportThread.findUnique({
    where: { id: params.threadId },
    include: {
      user: true,
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!thread) notFound();
  const openTickets = await prisma.supportThread.count({ where: { status: "OPEN" } });

  const messages: SupportMessageView[] = thread.messages.map((m) => ({
    id: m.id,
    senderRole: m.senderRole,
    body: m.body,
    createdAt: m.createdAt,
  }));

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <AdminHeader userName={session.user.name ?? "Admin"} openTickets={openTickets} />
      <main className="container flex-1 py-10">
        <Link href="/admin/support" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Support inbox
        </Link>
        <div className="mb-4 text-sm text-muted-foreground">
          Conversation with <span className="font-medium text-foreground">{thread.user.name}</span> ({thread.user.email})
        </div>
        <div className="mx-auto max-w-3xl">
          <SupportThreadView
            threadId={thread.id}
            subject={thread.subject}
            status={thread.status}
            messages={messages}
            viewerRole="ADMIN"
          />
        </div>
      </main>
    </div>
  );
}
