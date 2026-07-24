import Link from "next/link";
import { ArrowRight, Compass, HeartHandshake, Sparkles, Users, Globe, ShieldCheck } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

const VALUES = [
  { icon: HeartHandshake, title: "Trust", body: "We treat every account like it's our own — with care, transparency, and clear communication." },
  { icon: Compass, title: "Reliability", body: "Money moves when we say it will. Confirmations you can count on, statements that add up." },
  { icon: Sparkles, title: "Innovation", body: "Modern banking should feel modern. We ship the tools our customers actually need." },
];

const MILESTONES = [
  { year: "2005", title: "Founded", body: "Strata is chartered as a private financial services company." },
  { year: "2011", title: "Reached 50,000 customers", body: "A decade of steady, careful growth built on referrals." },
  { year: "2018", title: "Digital-first launch", body: "Fully online onboarding and mobile-first dashboards go live." },
  { year: "2023", title: "International Banking Unit", body: "Dedicated support for cross-border and foreign national clients." },
  { year: "2026", title: "2 million customers", body: "Continuing to invest in security, simplicity, and premium service." },
];

const STATS = [
  { number: "21+", label: "Years Serving Customers" },
  { number: "2M+", label: "Accounts Worldwide" },
  { number: "500+", label: "Team Members" },
  { number: "60+", label: "Countries Supported" },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-strata-green stripes-green py-24 text-primary-foreground">
          <div className="container flex flex-col items-center gap-4 text-center">
            <span className="inline-flex rounded-full border border-strata-amber/60 bg-strata-amber/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-strata-amber">
              About Strata
            </span>
            <h1 className="max-w-3xl font-serif text-4xl font-semibold leading-tight sm:text-6xl">
              Banking built on trust, reliability, and belief.
            </h1>
            <p className="max-w-2xl text-primary-foreground/80 sm:text-lg">
              Strata is a modern digital bank offering personal, corporate, and international banking to individuals,
              SMEs, and premier clients around the world.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="container grid gap-14 py-24 lg:grid-cols-2">
          <div>
            <span className="inline-flex rounded-full bg-strata-green-soft px-4 py-1 text-xs font-semibold uppercase tracking-widest text-strata-green">
              Our Mission
            </span>
            <h2 className="mt-4 amber-underline font-serif text-4xl font-semibold leading-tight sm:text-5xl">
              A bank that respects your time.
            </h2>
            <p className="mt-8 text-muted-foreground">
              We started Strata because we believed the tools people used to manage money were still stuck in another
              era. Long queues. Confusing statements. Clunky apps. So we built something we&apos;d want to use ourselves —
              a bank that&apos;s quietly powerful, private by default, and easy to talk to.
            </p>
            <p className="mt-4 text-muted-foreground">
              Today, Strata serves millions of customers in over 60 countries. Every product decision still starts
              with the same question: <em>does this actually make our customers&apos; day better?</em>
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="rounded-2xl border border-border/60 bg-card p-6 text-center shadow-soft">
                <p className="font-serif text-4xl font-semibold text-strata-amber-deep">{s.number}</p>
                <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Values */}
        <section className="stripes-cream py-24">
          <div className="container">
            <div className="flex flex-col items-center gap-3 text-center">
              <span className="inline-flex rounded-full bg-strata-amber-soft px-4 py-1 text-xs font-semibold uppercase tracking-widest text-strata-amber-deep">
                Our Values
              </span>
              <h2 className="amber-underline amber-underline-center font-serif text-4xl font-semibold sm:text-5xl">
                What We Stand For
              </h2>
            </div>
            <div className="mt-14 grid gap-6 sm:grid-cols-3">
              {VALUES.map((v) => (
                <div key={v.title} className="rounded-2xl border border-border/60 bg-card p-8 shadow-card">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-strata-green-soft text-strata-green">
                    <v.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-6 font-serif text-xl font-semibold">{v.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{v.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="container py-24">
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="inline-flex rounded-full bg-strata-green-soft px-4 py-1 text-xs font-semibold uppercase tracking-widest text-strata-green">
              Our Journey
            </span>
            <h2 className="amber-underline amber-underline-center font-serif text-4xl font-semibold sm:text-5xl">
              Strata Over The Years
            </h2>
          </div>
          <ol className="mx-auto mt-14 max-w-3xl space-y-8 border-l border-border pl-8">
            {MILESTONES.map((m) => (
              <li key={m.year} className="relative">
                <span className="absolute -left-[41px] flex h-6 w-6 items-center justify-center rounded-full border border-strata-amber bg-background">
                  <span className="h-2 w-2 rounded-full bg-strata-amber" />
                </span>
                <p className="font-serif text-lg font-semibold text-strata-amber-deep">{m.year}</p>
                <p className="font-semibold">{m.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{m.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Leadership summary */}
        <section className="stripes-cream py-24">
          <div className="container grid items-center gap-14 lg:grid-cols-2">
            <div>
              <span className="inline-flex rounded-full bg-strata-green-soft px-4 py-1 text-xs font-semibold uppercase tracking-widest text-strata-green">
                Leadership
              </span>
              <h2 className="mt-4 amber-underline font-serif text-4xl font-semibold leading-tight sm:text-5xl">
                A team that&apos;s been here.
              </h2>
              <p className="mt-8 text-muted-foreground">
                Our leadership brings decades of combined experience across retail banking, capital markets, and
                consumer technology. The team is small on purpose — every decision is owned, not passed around.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {[Users, Globe, ShieldCheck].map((Icon, i) => (
                  <div key={i} className="rounded-2xl border border-border/60 bg-card p-4 text-sm">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-strata-green-soft text-strata-green">
                      <Icon className="h-4 w-4" />
                    </span>
                    <p className="mt-3 font-semibold">
                      {["Retail Banking", "Global Ops", "Risk & Security"][i]}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {["30+ yrs combined", "18 timezones", "Bank-grade defence"][i]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative h-72 rounded-3xl bg-gradient-to-br from-strata-green-soft/70 to-strata-amber-soft lg:h-[26rem]">
              <div className="absolute inset-6 rounded-2xl bg-card shadow-card" />
              <div className="absolute inset-x-10 top-14 rounded-2xl bg-card p-6 shadow-card">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Customer Satisfaction</p>
                <p className="mt-2 font-serif text-4xl font-semibold">96%</p>
                <p className="mt-2 text-xs text-muted-foreground">Ongoing NPS across 2M+ accounts</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="stripes-green py-20 text-primary-foreground">
          <div className="container flex flex-col items-center gap-4 text-center">
            <h2 className="font-serif text-3xl font-semibold sm:text-4xl">Ready to bank with Strata?</h2>
            <p className="max-w-lg text-primary-foreground/80">
              Open an account in minutes and see what modern banking feels like.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-2 gap-2 rounded-full bg-strata-amber px-8 text-strata-green-deep hover:bg-strata-amber-deep hover:text-primary-foreground"
            >
              <Link href="/login">
                Open your dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="bg-strata-green-deep py-10 text-center text-xs text-primary-foreground/60">
      © {new Date().getFullYear()} Strata. All rights reserved.
    </footer>
  );
}
