"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Snowflake, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export function FreezeAccount({
  userId,
  isFrozen,
  currentReason,
}: {
  userId: string;
  isFrozen: boolean;
  currentReason: string | null;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [showFreeze, setShowFreeze] = React.useState(false);
  const [reason, setReason] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  async function doAction(action: "freeze" | "unfreeze") {
    setSubmitting(true);
    const res = await fetch(`/api/admin/users/${userId}/freeze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, reason: action === "freeze" ? reason : undefined }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast({ title: "Failed", description: err.error ?? "Try again." });
      return;
    }
    toast({ title: action === "freeze" ? "Account frozen" : "Account reactivated" });
    setShowFreeze(false);
    setReason("");
    router.refresh();
  }

  if (isFrozen) {
    return (
      <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-destructive/20 text-destructive">
            <Snowflake className="h-4 w-4" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold">Account frozen</p>
            {currentReason && <p className="mt-1 text-xs text-muted-foreground">Reason: {currentReason}</p>}
          </div>
        </div>
        <Button className="mt-3 gap-2 bg-strata-green hover:bg-strata-green-deep" size="sm" disabled={submitting} onClick={() => doAction("unfreeze")}>
          <Sun className="h-3.5 w-3.5" />
          Unfreeze account
        </Button>
      </div>
    );
  }

  if (!showFreeze) {
    return (
      <Button variant="outline" size="sm" className="gap-2 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setShowFreeze(true)}>
        <Snowflake className="h-3.5 w-3.5" />
        Freeze account
      </Button>
    );
  }

  return (
    <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4">
      <Label htmlFor="freeze-reason" className="text-destructive">Reason for freezing</Label>
      <Input
        id="freeze-reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="e.g. Suspicious activity, KYC required"
        className="mt-2"
      />
      <div className="mt-3 flex gap-2">
        <Button
          size="sm"
          variant="destructive"
          disabled={submitting || !reason.trim()}
          onClick={() => doAction("freeze")}
          className="gap-2"
        >
          <Snowflake className="h-3.5 w-3.5" />
          Confirm freeze
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setShowFreeze(false)}>Cancel</Button>
      </div>
    </div>
  );
}
