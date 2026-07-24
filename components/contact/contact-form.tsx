"use client";

import * as React from "react";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ContactForm() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [ok, setOk] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setError("Please fill in every field.");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, subject, message }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setError(err.error ?? "Something went wrong. Please try again.");
      return;
    }
    setOk(true);
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
  }

  if (ok) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <p className="font-serif text-2xl font-semibold text-strata-green">Thanks — message received</p>
        <p className="text-sm text-muted-foreground">A Strata team member will get back to you within one business day.</p>
        <Button variant="outline" className="mt-4" onClick={() => setOk(false)}>Send another</Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="c-name">Full name</Label>
          <Input id="c-name" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="c-email">Email</Label>
          <Input id="c-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
      </div>
      <div>
        <Label htmlFor="c-subject">Subject</Label>
        <Input id="c-subject" required value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="What's this about?" />
      </div>
      <div>
        <Label htmlFor="c-msg">Message</Label>
        <textarea
          id="c-msg"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-1 flex w-full rounded-xl border border-input bg-background px-4 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Tell us what's going on…"
        />
      </div>
      {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
      <Button type="submit" size="lg" disabled={submitting} className="gap-2 bg-strata-green hover:bg-strata-green-deep">
        <Send className="h-4 w-4" />
        {submitting ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
