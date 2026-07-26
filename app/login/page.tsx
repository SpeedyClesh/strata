"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { AlertCircle, Info } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const DEMO_EMAIL = "alice@demo.test";
const DEMO_PASSWORD = "demo1234";
const ADMIN_EMAIL = "admin@demo.test";
const ADMIN_PASSWORD = "admin1234";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      if (result.error === "PENDING_APPROVAL") {
        setError("Your account is still awaiting admin approval. We'll email you once it's reviewed.");
      } else if (result.error === "ACCOUNT_REJECTED") {
        setError("This account application wasn't approved. Contact support for more details.");
      } else {
        setError("Invalid email or password. Please try again.");
      }
      setLoading(false);
      return;
    }

    const session = await getSession();
    setLoading(false);
    router.push(session?.user?.role === "ADMIN" ? "/admin" : "/dashboard");
    router.refresh();
  }

  function fillDemoCredentials() {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setError(null);
  }

  function fillAdminCredentials() {
    setEmail(ADMIN_EMAIL);
    setPassword(ADMIN_PASSWORD);
    setError(null);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="container flex flex-1 items-center justify-center py-16">
        <div className="grid w-full max-w-4xl gap-6 md:grid-cols-2">
          <Card className="order-2 md:order-1">
            <CardHeader>
              <CardTitle>Log in</CardTitle>
              <CardDescription>Sign in to your Strata account.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alice@demo.test"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link href="/forgot-password" className="text-xs font-medium text-strata-green hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <Button type="submit" size="lg" disabled={loading} className="mt-2">
                  {loading ? "Signing in…" : "Sign in"}
                </Button>
              </form>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                New to Strata?{" "}
                <Link href="/signup" className="font-medium text-strata-green hover:underline">
                  Open an account
                </Link>
              </p>
            </CardContent>
          </Card>

          <Card className="order-1 flex flex-col justify-center border-dashed bg-secondary/40 md:order-2">
            <CardHeader>
              <span className="mb-1 flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Info className="h-4 w-4" />
              </span>
              <CardTitle className="text-base">Test accounts</CardTitle>
              <CardDescription>Explore the customer and administrator experiences with one click.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-sm">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Customer</p>
                <div className="rounded-xl bg-background p-3 font-mono text-xs">
                  <p>email: {DEMO_EMAIL}</p>
                  <p>password: {DEMO_PASSWORD}</p>
                </div>
                <Button type="button" variant="outline" size="sm" className="mt-2 w-full" onClick={fillDemoCredentials}>
                  Fill customer credentials
                </Button>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Administrator</p>
                <div className="rounded-xl bg-background p-3 font-mono text-xs">
                  <p>email: {ADMIN_EMAIL}</p>
                  <p>password: {ADMIN_PASSWORD}</p>
                </div>
                <Button type="button" variant="outline" size="sm" className="mt-2 w-full" onClick={fillAdminCredentials}>
                  Fill admin credentials
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Other customer accounts: bob@demo.test and carol@demo.test — same password.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
