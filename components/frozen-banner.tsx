"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertOctagon, Headphones } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export function FrozenBanner({ reason }: { reason: string | null }) {
  const router = useRouter();
  const { toast } = useToast();
  const [opening, setOpening] = React.useState(false);

  async function openSupportThread() {
    setOpening(true);
    const res = await fetch("/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: "My account has been frozen",
        body: `My account was frozen${reason ? ` with the reason: "${reason}"` : ""}. Please help me resolve this.`,
      }),
    });
    setOpening(false);
    if (!res.ok) {
      toast({ title: "Couldn't start a conversation", description: "Please open /support directly." });
      return;
    }
    const data = await res.json();
    router.push(`/support/${data.threadId}`);
  }

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-destructive/40 bg-destructive/5 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-destructive/20 text-destructive">
          <AlertOctagon className="h-4 w-4" />
        </span>
        <div>
          <p className="font-semibold">Your account is frozen</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {reason ? `Reason: ${reason}. ` : ""}Transfers, deposits, and crypto sends are disabled until this is resolved.
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button asChild variant="outline" className="gap-2">
          <Link href="/support">
            <Headphones className="h-4 w-4" />
            Support
          </Link>
        </Button>
        <Button className="gap-2 bg-strata-green hover:bg-strata-green-deep" onClick={openSupportThread} disabled={opening}>
          <Headphones className="h-4 w-4" />
          {opening ? "Opening…" : "Message support"}
        </Button>
      </div>
    </div>
  );
}
