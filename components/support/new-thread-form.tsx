"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function NewThreadForm() {
  const router = useRouter();
  const [subject, setSubject] = React.useState("");
  const [body, setBody] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) return;
    setSubmitting(true);
    const res = await fetch("/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, body }),
    });
    setSubmitting(false);
    if (!res.ok) return;
    const data = await res.json();
    router.push(`/support/${data.threadId}`);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="subject">Subject</Label>
        <Input id="subject" required value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Briefly, what's up?" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="body">Message</Label>
        <textarea
          id="body"
          required
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="flex w-full rounded-xl border border-input bg-background px-4 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Tell support what's going on…"
        />
      </div>
      <Button type="submit" disabled={submitting} size="lg">
        {submitting ? "Opening…" : "Open support ticket"}
      </Button>
    </form>
  );
}
