"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

const METHODS = ["Bank Transfer", "Wire Transfer", "Debit Card", "Crypto"];

export function DepositForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [amount, setAmount] = React.useState("");
  const [method, setMethod] = React.useState(METHODS[0]);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) {
      setError("Amount must be greater than zero.");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/deposit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: n, method }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setError(err.error ?? "Deposit failed.");
      return;
    }
    toast({ title: "Deposit successful", description: `$${n.toFixed(2)} was added to your balance.` });
    setAmount("");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div>
        <Label>Method</Label>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {METHODS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMethod(m)}
              className={
                "rounded-lg border px-3 py-2 text-xs font-medium transition-colors " +
                (method === m
                  ? "border-strata-green bg-strata-green-soft text-strata-green"
                  : "border-input hover:bg-secondary/40")
              }
            >
              {m}
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label htmlFor="amount">Amount (USD)</Label>
        <Input
          id="amount"
          type="number"
          min="0.01"
          step="0.01"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
        />
      </div>
      {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={submitting} className="bg-strata-green hover:bg-strata-green-deep">
        {submitting ? "Processing…" : "Deposit funds"}
      </Button>
    </form>
  );
}
