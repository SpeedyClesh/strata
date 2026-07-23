"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

const TYPES = [
  { value: "PERSONAL", label: "Personal" },
  { value: "AUTOMOBILE", label: "Automobile" },
  { value: "BUSINESS", label: "Business" },
  { value: "MORTGAGE", label: "Mortgage" },
  { value: "OVERDRAFT", label: "Overdraft" },
  { value: "HEALTH", label: "Health" },
];

export function LoanApplyForm({ disabled }: { disabled?: boolean }) {
  const router = useRouter();
  const { toast } = useToast();
  const [type, setType] = React.useState("PERSONAL");
  const [amount, setAmount] = React.useState("");
  const [term, setTerm] = React.useState("12");
  const [purpose, setPurpose] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const n = Number(amount);
    const t = Number(term);
    if (!Number.isFinite(n) || n <= 0) return setError("Enter a valid amount.");
    if (!Number.isFinite(t) || t <= 0) return setError("Enter a valid term.");
    if (!purpose.trim()) return setError("Purpose is required.");

    setSubmitting(true);
    const res = await fetch("/api/loan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, amount: n, termMonths: t, purpose }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setError(err.error ?? "Application failed.");
      return;
    }
    toast({ title: "Application submitted", description: "A loan officer will get back to you within 24–48 hours." });
    setAmount("");
    setPurpose("");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div>
        <Label>Loan type</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              disabled={disabled}
              onClick={() => setType(t.value)}
              className={
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors " +
                (type === t.value
                  ? "border-strata-green bg-strata-green-soft text-strata-green"
                  : "border-input hover:bg-secondary/40 disabled:opacity-50")
              }
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="amount">Amount (USD)</Label>
          <Input id="amount" required disabled={disabled} type="number" min="100" step="100" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="10000" />
        </div>
        <div>
          <Label htmlFor="term">Term (months)</Label>
          <Input id="term" required disabled={disabled} type="number" min="1" max="360" value={term} onChange={(e) => setTerm(e.target.value)} />
        </div>
      </div>
      <div>
        <Label htmlFor="purpose">Purpose</Label>
        <Input id="purpose" required disabled={disabled} value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g. Home renovation" />
      </div>
      {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={submitting || disabled} className="bg-strata-green hover:bg-strata-green-deep">
        {submitting ? "Submitting…" : disabled ? "You already have an active loan" : "Submit application"}
      </Button>
    </form>
  );
}
