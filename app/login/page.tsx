"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { AlertCircle } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="container flex flex-1 items-center justify-center py-16">
        <div className="w-full max-w-md">
          <Card>
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
                    placeholder="you@example.com"
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
        </div>
      </main>
    </div>
  );
}
