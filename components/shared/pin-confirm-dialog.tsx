"use client";

import * as React from "react";
import { Lock, X } from "lucide-react";

import { Button } from "@/components/ui/button";

export function PinConfirmDialog({
  open,
  title = "Confirm with your PIN",
  description,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title?: string;
  description?: string;
  onCancel: () => void;
  /** Return { ok: true } on success, or { ok: false, error } to show inline and let the user retry. */
  onConfirm: (pin: string) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [pin, setPin] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setPin("");
      setError(null);
      setSubmitting(false);
    }
  }, [open]);

  if (!open) return null;

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{4,8}$/.test(pin)) {
      setError("Enter your 4–8 digit PIN.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const result = await onConfirm(pin);
    if (!result.ok) {
      setSubmitting(false);
      setError(result.error ?? "Incorrect PIN.");
      setPin("");
    }
    // On success the parent handles closing/redirecting; no need to touch state here.
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !submitting) onCancel();
      }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card shadow-soft">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="flex items-center gap-2 font-serif text-lg font-semibold">
            <Lock className="h-4 w-4" />
            {title}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleConfirm} className="flex flex-col gap-4 px-6 py-5">
          {description && <p className="text-sm text-muted-foreground">{description}</p>}

          <input
            autoFocus
            inputMode="numeric"
            maxLength={8}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            placeholder="••••••"
            aria-label="Transaction PIN"
            className="w-full rounded-lg border border-input bg-background px-3 py-3 text-center text-2xl tracking-[0.5em] shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="bg-strata-green hover:bg-strata-green-deep">
              {submitting ? "Verifying…" : "Confirm"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
