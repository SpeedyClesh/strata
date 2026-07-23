"use client";

import * as React from "react";
import { AlertTriangle, X } from "lucide-react";

import { cn } from "@/lib/utils";

export function SimulationBanner() {
  const [dismissed, setDismissed] = React.useState(false);

  if (dismissed) return null;

  return (
    <div
      role="alert"
      className={cn(
        "relative flex w-full items-center justify-center gap-2 bg-amber-400 px-4 py-2 text-center text-sm font-medium text-amber-950",
        "dark:bg-amber-500 dark:text-amber-950"
      )}
    >
      <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>
        Simulation for coursework — not a real bank. No real money or personal data.
      </span>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss simulation notice for this session"
        className="absolute right-3 rounded-full p-1 transition-colors hover:bg-amber-500/40"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
