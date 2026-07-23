"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/lib/utils";

export function TransferForm({
  currentBalance,
  currency,
  recipientLabel = "Recipient account number",
  method = "Transfer",
}: {
  currentBalance: number;
  currency: string;
  recipientLabel?: string;
  method?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();

  const [recipient, setRecipient] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }
    if (numericAmount > currentBalance) {
      setError("That amount exceeds your available balance.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientAccountNumber: recipient,
          amount: numericAmount,
          description: description || method,
          method,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Transfer failed. Please try again.");
        setSubmitting(false);
        return;
      }

      toast({
        title: "Transfer initiated",
        description: `${formatCurrency(numericAmount, currency)} — ${method}.`,
      });

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="recipient">{recipientLabel}</Label>
        <Input
          id="recipient"
          required
          placeholder={recipientLabel}
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="amount">Amount</Label>
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
          <Input
            id="amount"
            required
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            className="pl-8"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <p className="text-xs text-muted-foreground">Available balance: {formatCurrency(currentBalance, currency)}</p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="e.g. Rent, dinner split, gift"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Button type="submit" size="lg" disabled={submitting} className="gap-2 bg-strata-green hover:bg-strata-green-deep">
        <Send className="h-4 w-4" />
        {submitting ? "Sending…" : `Send ${method}`}
      </Button>
    </form>
  );
}
