"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { SenderRole, SupportStatus } from "@prisma/client";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type SupportMessageView = {
  id: string;
  senderRole: SenderRole;
  body: string;
  createdAt: Date;
};

export function SupportThreadView({
  threadId,
  subject,
  status,
  messages,
  viewerRole,
}: {
  threadId: string;
  subject: string;
  status: SupportStatus;
  messages: SupportMessageView[];
  viewerRole: "USER" | "ADMIN";
}) {
  const router = useRouter();
  const [body, setBody] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const bottomRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    const res = await fetch(`/api/support/${threadId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    setSending(false);
    if (!res.ok) return;
    setBody("");
    router.refresh();
  }

  async function toggleStatus() {
    await fetch(`/api/support/${threadId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: status === "OPEN" ? "RESOLVED" : "OPEN" }),
    });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Subject</p>
          <p className="text-sm font-medium">{subject}</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
              status === "OPEN" ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-900"
            )}
          >
            {status}
          </span>
          {viewerRole === "ADMIN" && (
            <Button size="sm" variant="outline" onClick={toggleStatus}>
              {status === "OPEN" ? "Mark resolved" : "Reopen"}
            </Button>
          )}
        </div>
      </div>

      <div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto rounded-2xl border border-border bg-card p-4">
        {messages.map((m) => {
          const fromViewer = m.senderRole === viewerRole;
          return (
            <div key={m.id} className={cn("flex", fromViewer ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm",
                  fromViewer
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground/90"
                )}
              >
                <p className="mb-1 text-[10px] uppercase tracking-widest opacity-70">
                  {m.senderRole === "ADMIN" ? "Strata Support" : "You"} ·{" "}
                  {m.createdAt.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                </p>
                <p className="whitespace-pre-line">{m.body}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="flex gap-2">
        <Input
          placeholder={viewerRole === "ADMIN" ? "Reply to the customer…" : "Message support…"}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          disabled={status === "RESOLVED" && viewerRole === "USER"}
        />
        <Button
          type="submit"
          disabled={sending || !body.trim() || (status === "RESOLVED" && viewerRole === "USER")}
          className="gap-2"
        >
          <Send className="h-4 w-4" />
          Send
        </Button>
      </form>
      {status === "RESOLVED" && viewerRole === "USER" && (
        <p className="text-xs text-muted-foreground">This conversation is marked resolved. Open a new thread from the support list.</p>
      )}
    </div>
  );
}
