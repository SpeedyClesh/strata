import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/admin-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default async function AdminSupportInboxPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const threads = await prisma.supportThread.findMany({
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    include: {
      user: true,
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  const openTickets = threads.filter((t) => t.status === "OPEN").length;

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <AdminHeader userName={session.user.name ?? "Admin"} openTickets={openTickets} />
      <main className="container flex-1 py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight">Support inbox</h1>
          <p className="mt-1 text-sm text-muted-foreground">{openTickets} open, {threads.length - openTickets} resolved.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>All conversations</CardTitle>
            <CardDescription>Open threads listed first.</CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {threads.map((t) => {
              const last = t.messages[0];
              return (
                <Link key={t.id} href={`/admin/support/${t.id}`} className="flex items-center justify-between gap-4 py-3 hover:bg-secondary/40">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{t.subject}</p>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                          t.status === "OPEN" ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-900"
                        )}
                      >
                        {t.status}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {t.user.name} · {last ? `${last.senderRole === "ADMIN" ? "You: " : ""}${last.body}` : "No messages"}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              );
            })}
            {threads.length === 0 && (
              <p className="py-10 text-center text-sm text-muted-foreground">No support conversations yet.</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
