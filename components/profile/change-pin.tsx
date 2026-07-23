"use client";

import * as React from "react";
import { KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export function ChangePinButton() {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [currentPin, setCurrentPin] = React.useState("");
  const [newPin, setNewPin] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPin.length < 4 || newPin.length > 8) {
      setError("PIN must be 4–8 digits.");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPin: currentPin || null, newPin }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setError(err.error ?? "Update failed.");
      return;
    }
    toast({ title: "PIN updated" });
    setOpen(false);
    setCurrentPin("");
    setNewPin("");
  }

  return (
    <div>
      <Button variant="outline" className="gap-2" onClick={() => setOpen((s) => !s)}>
        <KeyRound className="h-4 w-4" />
        Change PIN
      </Button>
      {open && (
        <form onSubmit={submit} className="mt-3 flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:w-72">
          <div>
            <Label htmlFor="current-pin">Current PIN</Label>
            <Input id="current-pin" inputMode="numeric" pattern="[0-9]*" maxLength={8} value={currentPin} onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ""))} />
          </div>
          <div>
            <Label htmlFor="new-pin">New PIN</Label>
            <Input id="new-pin" required inputMode="numeric" pattern="[0-9]*" maxLength={8} value={newPin} onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))} />
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
