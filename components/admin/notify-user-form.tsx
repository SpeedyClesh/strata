"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export function NotifyUserForm({ userId }: { userId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [sendEmail, setSendEmail] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setSubmitting(true);
    const res = await fetch(`/api/admin/users/${userId}/notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, sendEmail }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast({ title: "Message failed", description: err.error ?? "Please try again." });
      return;
    }
    const data = await res.json();
    toast({
      title: "Message sent",
      description: data.emailVia === "resend"
        ? "In-app notification + email delivered via Resend."
        : data.emailVia === "console"
          ? "In-app notification created; email logged to server console (RESEND_API_KEY not set)."
          : "In-app notification created.",
    });
    setTitle("");
    setBody("");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Your card is on the way" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="body">Message</Label>
        <textarea
          id="body"
          required
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="flex w-full rounded-xl border border-input bg-background px-4 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      <label className="inline-flex items-center gap-2 text-sm">
        <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} />
        Also send by email
      </label>
      <Button type="submit" disabled={submitting}>{submitting ? "Sending…" : "Send message"}</Button>
    </form>
  );
}
