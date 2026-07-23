import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUnreadNotificationCount } from "@/lib/data";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NewThreadForm } from "@/components/support/new-thread-form";
import { cn } from "@/lib/utils";

export default async function SupportPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const [threads, unreadCount] = await Promise.all([
    prisma.supportThread.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    }),
    getUnreadNotificationCount(session.user.id),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <AppHeader userName={session.user.name ?? session.user.email ?? "Account"} unreadCount={unreadCount} />

      <main className="container flex-1 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Support</h1>
          <p className="mt-1 text-sm text-muted-foreground">Chat with the (simulated) Strata support team.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 flex flex-col gap-3">
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
                          t.status === "OPEN" ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-900"
                        )}
                      >
                        {t.status}
                      </span>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {last ? `${last.senderRole === "ADMIN" ? "Strata Support: " : "You: "}${last.body}` : "No messages yet."}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Updated{" "}
                        {t.updatedAt.toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
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
              <CardDescription>A support agent will reply here (this is simulated for coursework).</CardDescription>
            </CardHeader>
            <CardContent>
              <NewThreadForm />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
