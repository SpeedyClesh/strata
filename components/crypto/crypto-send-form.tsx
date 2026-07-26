"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { PinConfirmDialog } from "@/components/shared/pin-confirm-dialog";

export function CryptoSendForm({ asset, balance }: { asset: "BTC" | "ETH" | "USDT"; balance: number }) {
  const router = useRouter();
  const { toast } = useToast();
  const [address, setAddress] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [pinDialogOpen, setPinDialogOpen] = React.useState(false);

  const numericAmount = Number(amount);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!address.trim()) return setError("Address is required.");
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) return setError("Enter a valid amount.");
    if (numericAmount > balance) return setError(`Amount exceeds your ${asset} balance.`);

    setPinDialogOpen(true);
  }

  async function performSend(pin: string): Promise<{ ok: boolean; error?: string }> {
    const res = await fetch("/api/crypto/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ asset, address, amount: numericAmount, pin }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { ok: false, error: err.error ?? "Send failed." };
    }
    setPinDialogOpen(false);
    toast({ title: "Transfer submitted", description: `${numericAmount} ${asset} sent to ${address.slice(0, 8)}…` });
    router.push("/dashboard");
    router.refresh();
    return { ok: true };
  }

  return (
    <>
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
        <Button type="submit" className="gap-2 bg-strata-green hover:bg-strata-green-deep">
          <Send className="h-4 w-4" />
          Send {asset}
        </Button>
      </form>

      <PinConfirmDialog
        open={pinDialogOpen}
        title="Confirm send"
        description={`Enter your PIN to send ${amount || 0} ${asset}.`}
        onCancel={() => setPinDialogOpen(false)}
        onConfirm={performSend}
      />
    </>
  );
}
