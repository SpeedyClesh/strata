import Link from "next/link";
import { ArrowRight, LineChart, ShieldCheck, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";

const features = [
  {
    icon: LineChart,
    title: "Balance insights",
    description:
      "Watch a seeded 30-day balance trend and recent activity rendered from simulated transaction history.",
  },
  {
    icon: Send,
    title: "Simulated transfers",
    description:
      "Send money between demo accounts or to an 'external' recipient — all fake, all reversible, nothing leaves the sandbox.",
  },
  {
    icon: ShieldCheck,
    title: "Safe by design",
    description:
      "No real payment rails, no live credentials, no personal data. Built purely to demonstrate a banking UI.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="container flex flex-col items-center gap-6 py-24 text-center">
          <span className="rounded-full bg-secondary px-4 py-1 text-xs font-medium uppercase tracking-wide text-secondary-foreground">
            University Coursework Prototype
          </span>
          <h1 className="max-w-2xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Banking, simulated — for learning, not for money.
          </h1>
          <p className="max-w-xl text-balance text-muted-foreground sm:text-lg">
            Strata is a prototype dashboard that models what a modern banking UI looks and
            feels like, backed entirely by seeded demo data.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/login">
                Try the demo <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        <section className="container grid gap-6 pb-24 sm:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="rounded-2xl">
              <CardHeader>
                <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <feature.icon className="h-5 w-5" />
                </span>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="container flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
          <p>Strata — a coursework simulation. Not a real financial institution.</p>
        </div>
      </footer>
    </div>
  );
}
