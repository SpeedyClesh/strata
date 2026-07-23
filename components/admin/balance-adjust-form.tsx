"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export function BalanceAdjustForm({ userId, currency }: { userId: string; currency: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [amount, setAmount] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [direction, setDirection] = React.useState<"credit" | "debit">("credit");
  const [submitting, setSubmitting] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) return;
    setSubmitting(true);
    const res = await fetch(`/api/admin/users/${userId}/balance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: n, direction, description: description || (direction === "credit" ? "Admin credit" : "Admin debit") }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast({ title: "Adjustment failed", description: err.error ?? "Please try again." });
      return;
    }
    toast({ title: "Balance adjusted", description: `${direction === "credit" ? "Credited" : "Debited"} ${currency} ${n.toFixed(2)}.` });
    setAmount("");
    setDescription("");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant={direction === "credit" ? "default" : "outline"}
          size="sm"
          onClick={() => setDirection("credit")}
        >
          Credit (add)
        </Button>
        <Button
          type="button"
          variant={direction === "debit" ? "default" : "outline"}
          size="sm"
          onClick={() => setDirection("debit")}
        >
          Debit (subtract)
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="amount">Amount ({currency})</Label>
        <Input id="amount" required type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Description</Label>
        <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Manual correction" />
      </div>
      <Button type="submit" disabled={submitting}>{submitting ? "Applying…" : "Apply adjustment"}</Button>
    </form>
  );
}
