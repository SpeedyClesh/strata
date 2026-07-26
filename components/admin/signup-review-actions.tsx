"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

export function SignupReviewActions({ userId }: { userId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [submitting, setSubmitting] = React.useState(false);
  const [showRejectForm, setShowRejectForm] = React.useState(false);
  const [reason, setReason] = React.useState("");

  async function approve() {
    setSubmitting(true);
    const res = await fetch(`/api/admin/signups/${userId}/approve`, { method: "POST" });
    setSubmitting(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast({ title: "Couldn't approve", description: err.error ?? "Try again." });
      return;
    }
    toast({ title: "Account approved" });
    router.refresh();
  }

  async function reject() {
    setSubmitting(true);
    const res = await fetch(`/api/admin/signups/${userId}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast({ title: "Couldn't reject", description: err.error ?? "Try again." });
      return;
    }
    toast({ title: "Application rejected" });
    router.refresh();
  }

  if (showRejectForm) {
    return (
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          placeholder="Reason (optional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="h-9 sm:w-48"
        />
        <div className="flex gap-2">
          <Button size="sm" variant="destructive" disabled={submitting} onClick={reject}>
            Confirm reject
          </Button>
          <Button size="sm" variant="ghost" disabled={submitting} onClick={() => setShowRejectForm(false)}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" disabled={submitting} onClick={approve} className="gap-1 bg-strata-green hover:bg-strata-green-deep">
        <Check className="h-3.5 w-3.5" />
        Approve
      </Button>
      <Button size="sm" variant="outline" disabled={submitting} className="gap-1 text-destructive" onClick={() => setShowRejectForm(true)}>
        <X className="h-3.5 w-3.5" />
        Reject
      </Button>
    </div>
  );
}
