"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, Pencil, Plus, Shield, Trash2, X, AlertOctagon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency, cn } from "@/lib/utils";

export type EditorTxn = {
  id: string;
  amount: number;
  description: string;
  status: "PROCESSED" | "PENDING" | "UNDER_REVIEW" | "REJECTED";
  asset: string;
  counterpartyName: string | null;
  adminReason: string | null;
  direction: "credit" | "debit";
  createdAt: string; // ISO
};

const ASSETS = ["USD", "BTC", "ETH", "USDT"] as const;
const STATUSES: EditorTxn["status"][] = ["PROCESSED", "PENDING", "UNDER_REVIEW", "REJECTED"];

export function TransactionEditor({
  userId,
  transactions,
}: {
  userId: string;
  transactions: EditorTxn[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [showAdd, setShowAdd] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  async function refresh() {
    router.refresh();
  }

  async function updateStatus(id: string, status: EditorTxn["status"], reason?: string) {
    const res = await fetch(`/api/admin/transactions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, adminReason: reason }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast({ title: "Failed", description: err.error ?? "Try again." });
      return;
    }
    toast({ title: `Transaction marked ${status.toLowerCase()}` });
    refresh();
  }

  async function del(id: string) {
    if (!confirm("Delete this transaction? Balance will be rolled back if it was processed.")) return;
    const res = await fetch(`/api/admin/transactions/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast({ title: "Failed", description: err.error ?? "Try again." });
      return;
    }
    toast({ title: "Transaction deleted" });
    refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Ledger</p>
        <Button size="sm" onClick={() => setShowAdd(true)} className="gap-1 bg-strata-green hover:bg-strata-green-deep">
          <Plus className="h-3.5 w-3.5" />
          Add transaction
        </Button>
      </div>

      {showAdd && (
        <AddOrEditTxnForm
          userId={userId}
          onDone={() => {
            setShowAdd(false);
            refresh();
          }}
          onCancel={() => setShowAdd(false)}
        />
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="text-[10px] uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-2 py-2 text-left">Date</th>
              <th className="px-2 py-2 text-left">Description</th>
              <th className="px-2 py-2 text-left">Counterparty</th>
              <th className="px-2 py-2 text-left">Asset</th>
              <th className="px-2 py-2 text-right">Amount</th>
              <th className="px-2 py-2">Status</th>
              <th className="px-2 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) =>
              editingId === t.id ? (
                <tr key={t.id}>
                  <td colSpan={7} className="p-0">
                    <AddOrEditTxnForm
                      userId={userId}
                      existing={t}
                      onDone={() => {
                        setEditingId(null);
                        refresh();
                      }}
                      onCancel={() => setEditingId(null)}
                    />
                  </td>
                </tr>
              ) : (
                <tr key={t.id} className="border-t border-border">
                  <td className="px-2 py-2 text-muted-foreground">
                    {new Date(t.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </td>
                  <td className="px-2 py-2 font-medium">{t.description}</td>
                  <td className="px-2 py-2 text-muted-foreground">{t.counterpartyName ?? "—"}</td>
                  <td className="px-2 py-2 font-mono">{t.asset}</td>
                  <td className={cn("px-2 py-2 text-right font-medium", t.direction === "credit" ? "text-strata-green" : "text-foreground")}>
                    {t.direction === "credit" ? "+" : "−"}
                    {t.asset === "USD" ? formatCurrency(t.amount) : `${t.amount} ${t.asset}`}
                  </td>
                  <td className="px-2 py-2 text-center">
                    <StatusPill status={t.status} reason={t.adminReason} />
                  </td>
                  <td className="px-2 py-2 text-right">
                    <div className="inline-flex gap-1">
                      {t.status !== "PROCESSED" && (
                        <IconAction title="Approve" onClick={() => updateStatus(t.id, "PROCESSED")}>
                          <Check className="h-3.5 w-3.5 text-strata-green" />
                        </IconAction>
                      )}
                      {t.status !== "REJECTED" && (
                        <IconAction
                          title="Block"
                          onClick={() => {
                            const reason = prompt("Reason for blocking:");
                            if (reason) updateStatus(t.id, "REJECTED", reason);
                          }}
                        >
                          <AlertOctagon className="h-3.5 w-3.5 text-destructive" />
                        </IconAction>
                      )}
                      {t.status !== "UNDER_REVIEW" && (
                        <IconAction
                          title="Suspend"
                          onClick={() => {
                            const reason = prompt("Reason for suspending:");
                            if (reason) updateStatus(t.id, "UNDER_REVIEW", reason);
                          }}
                        >
                          <Shield className="h-3.5 w-3.5 text-strata-amber-deep" />
                        </IconAction>
                      )}
                      <IconAction title="Edit" onClick={() => setEditingId(t.id)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </IconAction>
                      <IconAction title="Delete" onClick={() => del(t.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </IconAction>
                    </div>
                  </td>
                </tr>
              )
            )}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={7} className="px-2 py-6 text-center text-muted-foreground">No transactions yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function IconAction({ title, onClick, children }: { title: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-input transition-colors hover:bg-secondary"
    >
      {children}
    </button>
  );
}

function StatusPill({ status, reason }: { status: EditorTxn["status"]; reason: string | null }) {
  const cls =
    status === "PROCESSED" ? "bg-strata-green-soft text-strata-green" :
    status === "PENDING" ? "bg-strata-amber-soft text-strata-amber-deep" :
    status === "UNDER_REVIEW" ? "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300" :
    "bg-destructive/15 text-destructive";
  const label = status === "UNDER_REVIEW" ? "Under Review" : status.charAt(0) + status.slice(1).toLowerCase();
  return (
    <span title={reason ?? undefined} className={"inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase " + cls}>
      {label}
    </span>
  );
}

function AddOrEditTxnForm({
  userId,
  existing,
  onDone,
  onCancel,
}: {
  userId: string;
  existing?: EditorTxn;
  onDone: () => void;
  onCancel: () => void;
}) {
  const { toast } = useToast();
  const [form, setForm] = React.useState({
    direction: existing?.direction ?? "credit",
    amount: existing ? String(existing.amount) : "",
    asset: existing?.asset ?? "USD",
    description: existing?.description ?? "",
    counterpartyName: existing?.counterpartyName ?? "",
    status: existing?.status ?? "PROCESSED",
    createdAt: existing ? new Date(existing.createdAt).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
  });
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) return setError("Amount must be > 0.");
    if (!form.description.trim()) return setError("Description is required.");
    setSubmitting(true);
    const url = existing ? `/api/admin/transactions/${existing.id}` : `/api/admin/transactions`;
    const method = existing ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        direction: form.direction,
        amount,
        asset: form.asset,
        description: form.description,
        counterpartyName: form.counterpartyName || null,
        status: form.status,
        createdAt: new Date(form.createdAt).toISOString(),
      }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setError(err.error ?? "Failed.");
      return;
    }
    toast({ title: existing ? "Transaction updated" : "Transaction added" });
    onDone();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 rounded-xl border border-strata-green-soft bg-strata-green-soft/40 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid grid-cols-2 gap-2">
          {(["credit", "debit"] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setForm((f) => ({ ...f, direction: d }))}
              className={
                "rounded-md border px-2 py-1.5 text-xs font-medium " +
                (form.direction === d
                  ? "border-strata-green bg-strata-green text-primary-foreground"
                  : "border-input bg-background hover:bg-secondary/40")
              }
            >
              {d === "credit" ? "Credit (received)" : "Debit (sent)"}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-2">
          {ASSETS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setForm((f) => ({ ...f, asset: a }))}
              className={
                "rounded-md border px-2 py-1.5 text-xs font-medium " +
                (form.asset === a
                  ? "border-strata-amber bg-strata-amber-soft text-strata-amber-deep"
                  : "border-input bg-background hover:bg-secondary/40")
              }
            >
              {a}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <Label htmlFor="tx-amount">Amount</Label>
          <Input id="tx-amount" required type="number" min="0" step="any" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="tx-date">Date</Label>
          <Input id="tx-date" type="datetime-local" value={form.createdAt} onChange={(e) => setForm({ ...form, createdAt: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="tx-status">Status</Label>
          <select
            id="tx-status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as EditorTxn["status"] })}
            className="mt-1 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s === "UNDER_REVIEW" ? "Under Review" : s.charAt(0) + s.slice(1).toLowerCase()}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="tx-desc">Description</Label>
          <Input id="tx-desc" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g. Salary from Acme" />
        </div>
        <div>
          <Label htmlFor="tx-cp">Counterparty name</Label>
          <Input id="tx-cp" value={form.counterpartyName} onChange={(e) => setForm({ ...form, counterpartyName: e.target.value })} placeholder="e.g. Acme Corp" />
        </div>
      </div>
      {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={submitting} className="bg-strata-green hover:bg-strata-green-deep">
          {submitting ? "Saving…" : existing ? "Save changes" : "Add transaction"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
          <X className="mr-1 h-3.5 w-3.5" /> Cancel
        </Button>
      </div>
    </form>
  );
}
