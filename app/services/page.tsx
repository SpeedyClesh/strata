import Link from "next/link";
import { ArrowRight, Building2, User, Globe, CreditCard, PiggyBank, HeartPulse, Home, Car, Briefcase, Users2, Wallet, Zap, ShieldCheck, Repeat } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

const CORE = [
  {
    icon: User,
    title: "Personal Banking",
    body: "Everyday accounts, virtual cards, savings, and instant transfers — designed for how you actually live.",
    features: ["Zero-fee current accounts", "High-yield savings", "Virtual & physical cards", "Instant peer transfers"],
    tone: "green",
  },
  {
    icon: Building2,
    title: "Corporate Banking",
    body: "Financing, cash management, and treasury solutions tailored to your business goals.",
    features: ["Working capital lines", "Payroll & AP tools", "Multi-user access", "FX & treasury"],
    tone: "amber",
  },
  {
    icon: Globe,
    title: "International Banking",
    body: "Cross-border accounts for foreign residents, overseas businesses, and internationally-mobile clients.",
    features: ["Multi-currency wallets", "SWIFT settlement", "Global card acceptance", "Local IBANs"],
    tone: "green",
  },
];

const LOANS = [
  { icon: Home, title: "Home Loans", body: "Finance your first home or a bigger one, with flexible terms and clear rates." },
  { icon: Car, title: "Auto Loans", body: "Drive your desired vehicle today with fast approvals." },
  { icon: Briefcase, title: "Business Loans", body: "Grow your enterprise with capital that scales with you." },
  { icon: Users2, title: "Joint Mortgages", body: "Buy together with a shared mortgage designed for co-owners." },
  { icon: Wallet, title: "Secured Overdraft", body: "Short-term liquidity, secured by your account." },
  { icon: HeartPulse, title: "Health Finance", body: "Cover medical expenses with peace of mind." },
];

const DIGITAL = [
  { icon: CreditCard, title: "Virtual Cards", body: "Issue Visa or Mastercard instantly. Freeze with a tap." },
  { icon: Zap, title: "Instant Transfers", body: "Move money between Strata accounts in seconds." },
  { icon: Repeat, title: "Crypto Wallet", body: "Hold and swap BTC, ETH, and USDT alongside your USD balance." },
  { icon: ShieldCheck, title: "Bank-Grade Security", body: "256-bit encryption, session controls, and instant alerts." },
  { icon: PiggyBank, title: "Investments", body: "Grow your money with vetted savings and investment products." },
  { icon: Wallet, title: "Deposits", body: "Fund via bank transfer, wire, card, or crypto." },
];

export default function ServicesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-strata-green stripes-green py-24 text-primary-foreground">
          <div className="container flex flex-col items-center gap-4 text-center">
            <span className="inline-flex rounded-full border border-strata-amber/60 bg-strata-amber/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-strata-amber">
              Our Services
            </span>
            <h1 className="max-w-3xl font-serif text-4xl font-semibold leading-tight sm:text-6xl">
              Everything your money needs, under one roof.
            </h1>
            <p className="max-w-2xl text-primary-foreground/80 sm:text-lg">
              Personal, corporate, and international banking — plus lending, cards, crypto, and investments.
            </p>
          </div>
        </section>

        {/* Core services */}
        <section className="container py-24">
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="inline-flex rounded-full bg-strata-amber-soft px-4 py-1 text-xs font-semibold uppercase tracking-widest text-strata-amber-deep">
              Core Banking
            </span>
            <h2 className="amber-underline amber-underline-center font-serif text-4xl font-semibold sm:text-5xl">
              Built For Every Customer
            </h2>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {CORE.map((s) => (
              <div key={s.title} className="rounded-2xl border border-border/60 bg-card p-8 shadow-card">
                <span
                  className={
                    "flex h-12 w-12 items-center justify-center rounded-2xl " +
                    (s.tone === "amber" ? "bg-strata-amber-soft text-strata-amber-deep" : "bg-strata-green-soft text-strata-green")
                  }
                >
                  <s.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-6 font-serif text-2xl font-semibold">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                <ul className="mt-5 space-y-2 text-sm">
                  {s.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-strata-amber" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Loans */}
        <section className="stripes-cream py-24">
          <div className="container">
            <div className="flex flex-col items-center gap-3 text-center">
              <span className="inline-flex rounded-full bg-strata-green-soft px-4 py-1 text-xs font-semibold uppercase tracking-widest text-strata-green">
                Lending
              </span>
              <h2 className="amber-underline amber-underline-center font-serif text-4xl font-semibold sm:text-5xl">
                Loans For Every Milestone
              </h2>
              <p className="mt-6 max-w-xl text-muted-foreground">
                Fast approvals, clear terms, no fine print.
              </p>
            </div>
            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {LOANS.map((l) => (
                <div key={l.title} className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-strata-green-soft text-strata-green">
                    <l.icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-serif text-lg font-semibold">{l.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{l.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Digital services */}
        <section className="container py-24">
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="inline-flex rounded-full bg-strata-amber-soft px-4 py-1 text-xs font-semibold uppercase tracking-widest text-strata-amber-deep">
              Digital Banking
            </span>
            <h2 className="amber-underline amber-underline-center font-serif text-4xl font-semibold sm:text-5xl">
              Modern Tools, Every Day
            </h2>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {DIGITAL.map((d) => (
              <div key={d.title} className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-strata-amber-soft text-strata-amber-deep">
                  <d.icon className="h-4 w-4" />
                </span>
                <p className="mt-4 font-serif text-lg font-semibold">{d.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{d.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="stripes-green py-20 text-primary-foreground">
          <div className="container flex flex-col items-center gap-4 text-center">
            <h2 className="font-serif text-3xl font-semibold sm:text-4xl">Talk to us about your needs</h2>
            <p className="max-w-lg text-primary-foreground/80">
              Not sure which product is right for you? Our team is happy to walk you through it.
            </p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="gap-2 rounded-full bg-strata-amber px-8 text-strata-green-deep hover:bg-strata-amber-deep hover:text-primary-foreground"
              >
                <Link href="/contact">
                  Get in touch <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-primary-foreground/40 bg-transparent px-8 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-strata-green-deep py-10 text-center text-xs text-primary-foreground/60">
        © {new Date().getFullYear()} Strata. All rights reserved.
      </footer>
    </div>
  );
}
