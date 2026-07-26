"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, Repeat } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { PinConfirmDialog } from "@/components/shared/pin-confirm-dialog";

type Asset = "BTC" | "ETH" | "USDT";
type Holding = { asset: Asset; amount: number; usdRate: number };

const ASSETS: Asset[] = ["BTC", "ETH", "USDT"];

export function CryptoSwapForm({ holdings }: { holdings: Holding[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [from, setFrom] = React.useState<Asset>("BTC");
  const [to, setTo] = React.useState<Asset>("USDT");
  const [amount, setAmount] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [pinDialogOpen, setPinDialogOpen] = React.useState(false);

  const fromHolding = holdings.find((h) => h.asset === from);
  const toHolding = holdings.find((h) => h.asset === to);
  const rate = fromHolding && toHolding && toHolding.usdRate > 0 ? fromHolding.usdRate / toHolding.usdRate : 0;
  const receiveEstimate = Number(amount) * rate;
  const numericAmount = Number(amount);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (from === to) return setError("Choose two different assets.");
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) return setError("Enter a valid amount.");
    if (!fromHolding || numericAmount > fromHolding.amount) return setError(`Insufficient ${from} balance.`);

    setPinDialogOpen(true);
  }

  async function performSwap(pin: string): Promise<{ ok: boolean; error?: string }> {
    const res = await fetch("/api/crypto/swap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, amount: numericAmount, pin }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { ok: false, error: err.error ?? "Swap failed." };
    }
    setPinDialogOpen(false);
    toast({ title: "Swap complete", description: `${numericAmount} ${from} → ${receiveEstimate.toFixed(6)} ${to}` });
    router.refresh();
    setAmount("");
    return { ok: true };
  }

  return (
    <>
    <form onSubmit={submit} className="flex flex-col gap-4">
      <AssetRow label="From" asset={from} setAsset={setFrom} holdings={holdings} />
      <div>
        <Label htmlFor="amt">Amount</Label>
        <Input id="amt" required type="number" min="0" step="any" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
        {fromHolding && <p className="mt-1 text-xs text-muted-foreground">Available: {fromHolding.amount} {from}</p>}
      </div>
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => {
            setFrom(to);
            setTo(from);
          }}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-input hover:bg-secondary"
        >
          <ArrowDown className="h-4 w-4" />
        </button>
      </div>
      <AssetRow label="To" asset={to} setAsset={setTo} holdings={holdings} />
      {amount && rate > 0 && (
        <p className="rounded-lg bg-secondary/60 px-3 py-2 text-xs text-muted-foreground">
          You&apos;ll receive approx. <span className="font-semibold text-foreground">{receiveEstimate.toFixed(6)} {to}</span> at 1 {from} = {rate.toFixed(4)} {to}
        </p>
      )}
      {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
      <Button type="submit" className="gap-2 bg-strata-green hover:bg-strata-green-deep">
        <Repeat className="h-4 w-4" />
        Swap
      </Button>
    </form>

    <PinConfirmDialog
      open={pinDialogOpen}
      title="Confirm swap"
      description={`Enter your PIN to swap ${amount || 0} ${from} for ${to}.`}
      onCancel={() => setPinDialogOpen(false)}
      onConfirm={performSwap}
    />
    </>
  );
}

function AssetRow({
  label,
  asset,
  setAsset,
  holdings,
}: {
  label: string;
  asset: Asset;
  setAsset: (a: Asset) => void;
  holdings: Holding[];
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {ASSETS.map((a) => {
          const h = holdings.find((x) => x.asset === a);
          return (
            <button
              key={a}
              type="button"
              onClick={() => setAsset(a)}
              className={
                "rounded-lg border px-3 py-2 text-left transition-colors " +
                (asset === a
                  ? "border-strata-green bg-strata-green-soft"
                  : "border-input hover:bg-secondary/40")
              }
            >
              <p className="text-sm font-semibold">{a}</p>
              <p className="text-[10px] text-muted-foreground">{h ? h.amount : 0}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
