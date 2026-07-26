"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { UserPlus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export function NewCustomerDialog() {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    password: "",
    balance: "0",
    phone: "",
    country: "",
    city: "",
    accountType: "SAVINGS",
    issueCard: true,
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function generatePassword() {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
    let out = "";
    for (let i = 0; i < 12; i++) out += chars[Math.floor(Math.random() * chars.length)];
    update("password", out);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError("Name, email, and password are required.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    const balance = Number(form.balance);
    if (!Number.isFinite(balance) || balance < 0) {
      setError("Starting balance must be zero or positive.");
      return;
    }

    setSubmitting(true);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, balance }),
    });
    setSubmitting(false);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setError(err.error ?? "Failed to create customer.");
      return;
    }

    toast({
      title: "Customer created",
      description: `${form.name} (${form.email}) — password: ${form.password}`,
    });
    setOpen(false);
    setForm({ name: "", email: "", password: "", balance: "0", phone: "", country: "", city: "", accountType: "SAVINGS", issueCard: true });
    router.refresh();
  }

  return (
    <>
      <Button className="gap-2 bg-strata-green hover:bg-strata-green-deep" onClick={() => setOpen(true)}>
        <UserPlus className="h-4 w-4" />
        New customer
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="font-serif text-2xl font-semibold">New customer</h2>
                <p className="text-sm text-muted-foreground">Provision a Strata account for a new user.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full p-1 hover:bg-secondary" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={submit} className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name">Full name *</Label>
                  <Input id="name" required value={form.name} onChange={(e) => update("name", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="password">Password *</Label>
                <div className="flex gap-2">
                  <Input id="password" required value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="min 8 chars" />
                  <Button type="button" variant="outline" size="sm" onClick={generatePassword}>Generate</Button>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Share this with the customer for their first sign-in.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor="balance">Starting balance (USD)</Label>
                  <Input id="balance" type="number" min="0" step="0.01" value={form.balance} onChange={(e) => update("balance", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+1 555 0100" />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" value={form.country} onChange={(e) => update("country", e.target.value)} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="city">City / address</Label>
                  <Input id="city" value={form.city} onChange={(e) => update("city", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="accountType">Account type</Label>
                  <select
                    id="accountType"
                    value={form.accountType}
                    onChange={(e) => update("accountType", e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="SAVINGS">Savings</option>
                    <option value="CHECKING">Checking</option>
                    <option value="TRADITIONAL">Traditional</option>
                  </select>
                  <p className="mt-1 text-xs text-muted-foreground">Fixed at creation — matches what the customer chose at signup.</p>
                </div>
              </div>
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.issueCard}
                  onChange={(e) => update("issueCard", e.target.checked)}
                />
                Issue a Visa card automatically
              </label>

              {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

              <div className="mt-2 flex gap-2">
                <Button type="submit" disabled={submitting} className="bg-strata-green hover:bg-strata-green-deep">
                  {submitting ? "Creating…" : "Create customer"}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
