"use client";

import * as React from "react";
import { ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export function PasswordButton() {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [current, setCurrent] = React.useState("");
  const [next, setNext] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (next.length < 8) return setError("Password must be at least 8 characters.");
    setSubmitting(true);
    const res = await fetch("/api/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: current, newPassword: next }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setError(err.error ?? "Failed.");
      return;
    }
    toast({ title: "Password updated" });
    setOpen(false);
    setCurrent("");
    setNext("");
  }

  return (
    <div>
      <Button variant="outline" className="gap-2" onClick={() => setOpen((s) => !s)}>
        <ShieldCheck className="h-4 w-4" />
        Password
      </Button>
      {open && (
        <form onSubmit={submit} className="mt-3 flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:w-72">
          <div>
            <Label htmlFor="current-pw">Current password</Label>
            <Input id="current-pw" type="password" required value={current} onChange={(e) => setCurrent(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="new-pw">New password</Label>
            <Input id="new-pw" type="password" required value={next} onChange={(e) => setNext(e.target.value)} />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button size="sm" type="submit" disabled={submitting} className="bg-strata-green hover:bg-strata-green-deep">
              {submitting ? "Saving…" : "Save"}
            </Button>
            <Button size="sm" type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </form>
      )}
    </div>
  );
}
