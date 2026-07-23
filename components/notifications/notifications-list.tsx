"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Bell, Info, Shield, Wallet, LifeBuoy, Check } from "lucide-react";
import type { NotificationKind } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const KIND_ICON: Record<NotificationKind, React.ComponentType<{ className?: string }>> = {
  INFO: Info,
  SECURITY: Shield,
  BALANCE: Wallet,
  SUPPORT: LifeBuoy,
};

export type NotificationView = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  read: boolean;
  createdAt: Date;
};

export function NotificationsList({ notifications }: { notifications: NotificationView[] }) {
  const router = useRouter();
  const [pending, setPending] = React.useState<string | null>(null);

  async function markRead(id?: string) {
    setPending(id ?? "all");
    const url = id ? `/api/notifications/${id}/read` : `/api/notifications/read-all`;
    await fetch(url, { method: "POST" });
    setPending(null);
    router.refresh();
  }

  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-16 text-center text-sm text-muted-foreground">
          <Bell className="h-6 w-6" />
          <p>No notifications yet.</p>
        </CardContent>
      </Card>
    );
  }

  const unreadTotal = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {unreadTotal > 0 ? `${unreadTotal} unread` : "You're all caught up."}
        </p>
        {unreadTotal > 0 && (
          <Button variant="outline" size="sm" onClick={() => markRead()} disabled={pending === "all"}>
            <Check className="mr-2 h-4 w-4" /> Mark all as read
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {notifications.map((n) => {
          const Icon = KIND_ICON[n.kind];
          return (
            <Card key={n.id} className={n.read ? "" : "border-accent/40 bg-accent/5"}>
              <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-2">
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <CardTitle className="text-base">{n.title}</CardTitle>
                    <CardDescription>
                      {n.createdAt.toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </CardDescription>
                  </div>
                </div>
                {!n.read && (
                  <Button variant="ghost" size="sm" onClick={() => markRead(n.id)} disabled={pending === n.id}>
                    Mark read
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-sm">{n.body}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
