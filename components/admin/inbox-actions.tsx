"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, AlertOctagon, Shield } from "lucide-react";

import { useToast } from "@/components/ui/use-toast";

export function InboxActions({ txnId }: { txnId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, setPending] = React.useState(false);

  async function act(status: "PROCESSED" | "REJECTED" | "UNDER_REVIEW") {
    let reason: string | null | undefined = undefined;
    if (status !== "PROCESSED") {
      reason = prompt(status === "REJECTED" ? "Reason for blocking (shown to customer):" : "Reason for holding (shown to customer):");
      if (!reason) return;
    }
    setPending(true);
    const res = await fetch(`/api/admin/transactions/${txnId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, adminReason: reason ?? null }),
    });
    setPending(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast({ title: "Failed", description: err.error ?? "Try again." });
      return;
    }
    toast({
      title: status === "PROCESSED" ? "Approved" : status === "REJECTED" ? "Blocked" : "Suspended",
    });
    router.refresh();
  }

  return (
    <div className="inline-flex gap-1">
      <IconBtn title="Approve" onClick={() => act("PROCESSED")} disabled={pending}>
        <Check className="h-3.5 w-3.5 text-strata-green" />
      </IconBtn>
      <IconBtn title="Block" onClick={() => act("REJECTED")} disabled={pending}>
        <AlertOctagon className="h-3.5 w-3.5 text-destructive" />
      </IconBtn>
      <IconBtn title="Suspend" onClick={() => act("UNDER_REVIEW")} disabled={pending}>
        <Shield className="h-3.5 w-3.5 text-strata-amber-deep" />
      </IconBtn>
    </div>
  );
}

function IconBtn({ title, onClick, disabled, children }: { title: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-input transition-colors hover:bg-secondary disabled:opacity-40"
    >
      {children}
    </button>
  );
}
