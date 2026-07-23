import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import {
  Zap,
  Percent,
  FileCheck,
  ShieldCheck,
  Home,
  Car,
  Briefcase,
  Users,
  Wallet,
  HeartPulse,
  AlertCircle,
} from "lucide-react";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSidebarUser, getUnreadNotificationCount } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { AuthedShell } from "@/components/authed/authed-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoanApplyForm } from "@/components/loans/loan-apply-form";

const FEATURES = [
  { icon: Zap, title: "Quick Approval", body: "Fast processing with decisions in 24–48 hours" },
  { icon: Percent, title: "Competitive Rates", body: "Flexible terms starting from 5% annually" },
  { icon: FileCheck, title: "Simple Process", body: "Minimal documentation with online application" },
  { icon: ShieldCheck, title: "Secure & Trusted", body: "Bank-grade security for your information" },
];

const LOAN_TYPES = [
  { key: "PERSONAL", icon: Home, title: "Personal Home Loans", body: "Finance your dream home with flexible terms" },
  { key: "AUTOMOBILE", icon: Car, title: "Automobile Loans", body: "Drive your desired vehicle today" },
  { key: "BUSINESS", icon: Briefcase, title: "Business Loans", body: "Grow your enterprise with capital" },
  { key: "MORTGAGE", icon: Users, title: "Joint Mortgage", body: "Buy together with a shared mortgage" },
  { key: "OVERDRAFT", icon: Wallet, title: "Secured Overdraft", body: "Short-term liquidity, secured by your account" },
  { key: "HEALTH", icon: HeartPulse, title: "Health Finance", body: "Cover medical expenses with peace of mind" },
];

export default async function LoansPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const sidebarUser = await getSidebarUser(session.user.id);
  const unread = await getUnreadNotificationCount(session.user.id);

  const activeLoan = await prisma.loan.findFirst({
    where: { userId: session.user.id, status: { in: ["ACTIVE", "APPROVED", "PENDING"] } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AuthedShell user={sidebarUser} unreadCount={unread}>
      <div className="mx-auto max-w-6xl">
        <h1 className="font-serif text-3xl font-semibold">Loan Services</h1>
        <p className="mt-1 text-sm text-muted-foreground">Access flexible financing solutions tailored to your needs.</p>

        {activeLoan && (
          <div className="mt-6 flex items-start gap-4 rounded-2xl border border-strata-amber/40 bg-strata-amber-soft p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-strata-amber/40 text-strata-amber-deep">
              <AlertCircle className="h-5 w-5" />
            </span>
            <div>
              <p className="font-serif text-lg text-strata-amber-deep">Active Loan in Progress</p>
              <p className="mt-1 text-sm text-strata-amber-deep/80">
                You currently have an active loan application: {activeLoan.type.toLowerCase()} — {formatCurrency(Number(activeLoan.amount))} over {activeLoan.termMonths} months.
                Our policy allows one active loan per customer.
              </p>
            </div>
          </div>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-strata-green-soft text-strata-green">
                <f.icon className="h-4 w-4" />
              </span>
              <p className="mt-4 font-semibold">{f.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Available Loan Types
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {LOAN_TYPES.map((t) => (
              <div key={t.key} className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-soft">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-strata-green-soft text-strata-green">
                  <t.icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold">{t.title}</p>
                  <p className="text-xs text-muted-foreground">{t.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Card className="mt-10">
          <CardHeader>
            <CardTitle>Apply for a loan</CardTitle>
            <CardDescription>Fill in the basics and a Strata officer will get back to you.</CardDescription>
          </CardHeader>
          <CardContent>
            <LoanApplyForm disabled={!!activeLoan} />
          </CardContent>
        </Card>
      </div>
    </AuthedShell>
  );
}
