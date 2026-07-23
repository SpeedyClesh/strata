"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export function CryptoSendForm({ asset, balance }: { asset: "BTC" | "ETH" | "USDT"; balance: number }) {
  const router = useRouter();
  const { toast } = useToast();
  const [address, setAddress] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const n = Number(amount);
    if (!address.trim()) return setError("Address is required.");
    if (!Number.isFinite(n) || n <= 0) return setError("Enter a valid amount.");
    if (n > balance) return setError(`Amount exceeds your ${asset} balance.`);

    setSubmitting(true);
    const res = await fetch("/api/crypto/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ asset, address, amount: n }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setError(err.error ?? "Send failed.");
      return;
    }
    toast({ title: "Transfer submitted", description: `${n} ${asset} sent to ${address.slice(0, 8)}…` });
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="addr">Recipient address</Label>
        <Input id="addr" required placeholder={`${asset} wallet address`} value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="amt">Amount ({asset})</Label>
        <Input id="amt" required type="number" min="0" step="any" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
        <p className="mt-1 text-xs text-muted-foreground">Available: {balance} {asset}</p>
      </div>
      {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={submitting} className="gap-2 bg-strata-green hover:bg-strata-green-deep">
        <Send className="h-4 w-4" />
        {submitting ? "Sending…" : `Send ${asset}`}
      </Button>
    </form>
  );
}
