import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSidebarUser, getUnreadNotificationCount } from "@/lib/data";
import { AuthedShell } from "@/components/authed/authed-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NewThreadForm } from "@/components/support/new-thread-form";
import { cn } from "@/lib/utils";

export default async function SupportPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const [sidebarUser, unread, threads] = await Promise.all([
    getSidebarUser(session.user.id),
    getUnreadNotificationCount(session.user.id),
    prisma.supportThread.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } },
    }),
  ]);

  return (
    <AuthedShell user={sidebarUser} unreadCount={unread}>
      <div className="mx-auto max-w-5xl">
        <h1 className="font-serif text-3xl font-semibold">Support</h1>
        <p className="mt-1 text-sm text-muted-foreground">Chat with the Strata support team.</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-3 lg:col-span-2">
            {threads.length === 0 && (
              <Card>
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  No support conversations yet. Open one to get started.
                </CardContent>
              </Card>
            )}
            {threads.map((t) => {
              const last = t.messages[0];
              return (
                <Link key={t.id} href={`/support/${t.id}`}>
                  <Card className="transition-colors hover:bg-secondary/40">
                    <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
                      <CardTitle className="text-base">{t.subject}</CardTitle>
                      <span
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                          t.status === "OPEN" ? "bg-strata-amber-soft text-strata-amber-deep" : "bg-strata-green-soft text-strata-green"
                        )}
                      >
                        {t.status}
                      </span>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {last ? `${last.senderRole === "ADMIN" ? "Strata Support: " : "You: "}${last.body}` : "No messages yet."}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Start a new conversation</CardTitle>
              <CardDescription>A support agent will reply in this thread.</CardDescription>
            </CardHeader>
            <CardContent>
              <NewThreadForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthedShell>
  );
}
